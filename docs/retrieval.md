# Evidence retrieval: methodology and AI use

Owner: Member 5. Status: draft for Member 3's review (handoff H15). Scoring and gap methodology are in `docs/methodology.md` (Member 3); this file covers only how evidence is found.

IGNIS is a research navigation and evidence-comparison prototype. Retrieval finds reviewed passages; it does not judge whether something is safe.

## 1. Where the evidence comes from

Source hierarchy, as agreed by the team (Member 2 brief):

1. NASA PSI investigation record or associated PSI file
2. Official NASA project or investigation page
3. NASA technical publication or the Researcher's Guide to ISS combustion science
4. NASA history or spinoff page, for context only

Blogs, AI answers and search snippets are never evidence.

A team member transcribes each investigation into an OKF record in `knowledge/investigations/` (YAML metadata plus Markdown sections). A different team member checks every value against the NASA source and signs the record off. Unknown values stay empty (`null`); nothing is estimated.

**The OKF files are the source of truth.** Chunks and vectors are a search index built from them and can be rebuilt at any time.

## 2. Only verified records are searched

A record enters retrieval only when it is signed off by a second person. This is enforced in four places:

| Where     | How                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------- |
| Chunker   | Unverified records produce no chunks (`lib/retrieval/chunker.ts`)                                 |
| Ingestion | Runs only from a clean `main`, so only merged, verified records are indexed (`scripts/ingest.ts`) |
| Database  | Row-level security returns only rows marked verified to the app                                   |
| Check     | `scripts/ingest.ts --verify` fails if the index holds anything not produced by a verified record  |

Local layout fixtures (`zz-local-*` files) are never indexed.

## 3. Section-aware chunking

Each record's section headings are the boundaries:

| Section                  | Chunk type     | Evidence class      |
| ------------------------ | -------------- | ------------------- |
| Objective                | OBJECTIVE      | NASA_SOURCE         |
| Experimental Conditions  | CONDITIONS     | NASA_SOURCE         |
| Variables                | VARIABLES      | NASA_SOURCE         |
| Sensors and Measurements | MEASUREMENT    | NASA_SOURCE         |
| Key Findings             | FINDING        | NASA_SOURCE         |
| Limitations              | LIMITATION     | NASA_SOURCE         |
| Fire Safety Relevance    | INTERPRETATION | TEAM_INTERPRETATION |
| Source Notes             | not searched   |                     |

- A short section is one chunk. A long one is split on bullets (findings, limitations), never inside a bullet, or on paragraphs with one sentence of overlap.
- Chunks are capped at about 480 tokens. The embedding model reads at most 512 tokens and silently ignores the rest, so a larger cap would lose text without warning. Ingestion re-counts with the model's own tokenizer and refuses anything over the limit.
- Every chunk inherits its record's title, section, safety category, fuel, material, gravity condition, conditions (oxygen, pressure, airflow), hardware, source URL and verification state. A retrieved passage therefore always carries its provenance.
- Chunk ids are deterministic (`bass-ii.conditions.01`), so re-ingestion replaces rows instead of duplicating them.
- The text that is embedded starts with a short header (investigation name, section, hardware) because a Conditions section often never names its investigation. The stored and displayed text is exactly what the curator wrote.
- Team interpretation is labelled TEAM_INTERPRETATION on every chunk and is never shown as NASA evidence.

## 4. Embedding model and store

| Item    | Choice                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model   | BAAI/bge-small-en-v1.5, ONNX conversion `Xenova/bge-small-en-v1.5`, run locally with `@huggingface/transformers`                                                          |
| Vector  | 384 dimensions, CLS pooling, unit length (from the model card)                                                                                                            |
| Queries | Prefixed with "Represent this sentence for searching relevant passages: " as the model card recommends; passages are not prefixed                                         |
| Store   | Supabase PostgreSQL with pgvector; text, metadata and vector in the same row                                                                                              |
| Version | Every row records `bge-small-en-v1.5/onnx-fp32/cls-norm/chunker-v1`. Search refuses to compare vectors from a different version and falls back to keyword search instead. |

One function (`lib/embeddings/index.ts`) embeds both chunks and queries, so the index and the search cannot drift apart.

## 5. Hybrid retrieval

Vector similarity alone is not enough: the records have precise metadata, and experiment names matter.

1. **Understand the question** with fixed rules, no language model: named investigations, safety role (prevention, detection, suppression), gravity (micro, partial, 1 g), materials, fuels, hardware, which section it asks about, and whether it asks for a list. Names, materials and hardware come from the verified records themselves.
2. **Check boundaries** before searching (section 7).
3. **Search** for up to 10 candidates by meaning (vector) and 10 by keywords (full text).
4. **Score metadata:** the share of detected facets each chunk matches.
5. **Fuse:** 0.40 vector + 0.30 keywords + 0.30 metadata, re-weighted over the signals actually available. These weights are a starting point from the brief, tuned only on the evaluation set's `dev` split; they are engineering choices, not scientific parameters.
6. **Select** 4 to 6 chunks: at most 2 per investigation unless the question names it, and at most 1 team-interpretation chunk unless the question asks about relevance or implications.
7. **List questions** ("Which investigations studied smoke detection?") are answered from metadata: every verified investigation with that safety category, hardware or material is listed, not just the top few by similarity.
8. **Expand:** if a chunk is part of a split section, its neighbouring pieces come with it.
9. **Support check:** a chunk is shown only if it shares a distinctive word with the question, matches its metadata, or is very close in meaning. Otherwise the answer is "The reviewed evidence does not establish this."

Every result carries its vector, keyword and metadata scores, the matched words and the matched metadata with a plain reason, for the "Why retrieved?" panel.

Two technical notes:

- Postgres' English full-text configuration drops "same" as a stop word, which would make the SAME investigation unsearchable by name. Names are therefore indexed with the `simple` configuration.
- A whole question is searched with its words OR-ed, not AND-ed, so a natural question still finds partial matches.

If the embedding model is unavailable, search continues with keywords and metadata and says so. With no Supabase configuration, the server searches the verified records in `knowledge/` directly, so the app works with no environment variables.

## 6. Evaluation

`tests/retrieval/eval-set.json` holds 26 questions across prevention, detection, suppression, hardware, fuel and material, oxygen, airflow, gravity, spacecraft-scale fire and interpretation, plus three questions with no answer in the corpus.

- Expected answers are written by a team member reading the verified records, never from memory or an AI answer. A question is scored only when its expected records are verified.
- `scripts/evaluate.ts` reports Top-1, Top-3 and Top-5 hit rate and mean reciprocal rank, each beside the rate random ranking would get. With only a handful of investigations, random results often hit by luck, so the baseline shows how much the system adds.
- It also reports section-level hits (right investigation and right section), recall on list questions, and the share of unanswerable questions that correctly get the evidence-insufficient answer.
- Questions are split into `dev` (used for tuning) and `holdout` (scored only once weights are fixed).
- False positives are inspected by hand, not just counted.

Current numbers: `docs/retrieval-evaluation.md`, generated by the script.

## 7. Questions IGNIS will not answer directly

A deterministic check runs before retrieval and before any language model, so it holds even with no LLM key:

| Question type               | Example                                                        | Behaviour                                                             |
| --------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| Probability or risk level   | "What is the probability of a fire in a lunar base?"           | Refuses a number; shows the closest evidence for context              |
| Universal guarantee         | "What oxygen percentage guarantees ignition?"                  | States that no universal guarantee is established                     |
| Prediction or extrapolation | "Predict flame spread at 0.16 g."                              | Does not predict; lists evidence that may bound the question          |
| Design prescription         | "What exact material should NASA use?"                         | Makes no recommendation; lists related evidence                       |
| Wrong premise               | "Since microgravity is the same as lunar gravity…"             | Corrects it: microgravity evidence only bounds partial gravity        |
| Corpus coverage             | "Which NASA experiment directly tested lunar gravity?"         | Answers from record metadata, including "none in the reviewed corpus" |
| Value not reported          | "What oxygen level did X use?" when the record leaves it empty | Says the record does not report it                                    |
| Unknown investigation       | A name that appears in no verified record                      | Says so; any evidence shown is about other investigations             |
| No support                  | Off-topic questions                                            | "The reviewed evidence does not establish this."                      |

The questions and expected behaviours are in `tests/retrieval/boundary.json` and run as tests. Pattern matching cannot catch every paraphrase; each class is tested with paraphrases, and any optional generated summary is checked again afterwards (section 8).

## 8. AI use

- Retrieval, ranking, coverage and gap analysis use no generative AI.
- The embedding model is used to find passages, not to produce claims.
- Generative AI is optional and runs only after retrieval, only when the user asks, and only on the evidence already shown. It is not a source of scientific facts. Any generated text is labelled GENERATED_SUMMARY, and citations come from stored chunk metadata, never from generated text. (Planned; not yet built.)
- AI coding assistants helped write this code. Team members review what is merged.

## 9. Limitations

Required text (Member 3):

> IGNIS is a research navigation and evidence-comparison prototype.
> It does not predict the probability of spacecraft fire.
> It does not replace engineering fire-safety analysis or certification.
> Mission relevance scores describe the similarity and usefulness of reviewed evidence.
> Evidence-gap outputs identify coverage limitations in the reviewed corpus.
> Project-generated research questions are not NASA recommendations.

Retrieval-specific:

- The corpus covers only the investigations the team has reviewed. Absence from IGNIS says nothing about whether NASA studied a topic.
- Relevance in search is not safety. A passage ranked first is the closest match to the wording of the question, not the most important finding.
- The evaluation set is small, so its numbers are indicative, not statistically strong.
- Citations point to a record's source, not to a sentence within it.
- Retrieval weights and thresholds are heuristics tuned on a small set.
- The boundary check is rule-based and can miss unusual phrasings.

## 10. For the rest of the team

- **Member 1:** apply `supabase/migrations/0002_hybrid_search.sql` (adapted from the earlier proposal; `lib/supabase/types.ts` now matches `lib/retrieval/rows.ts`), and send me the keys privately (H10). The route is `app/api/evidence/search/route.ts`, three lines calling `lib/retrieval/server.ts`. No `next.config.ts` change is needed: Next already treats the embedding packages as external.
- **Member 4:** the response shape is in `lib/retrieval/types.ts` (H14). The current Evidence Desk ignores `boundary`, `listing`, `notice` and the scores. A refusal currently shows "No verified passages match", so `boundary.message` needs its own intentional-looking state.
- **Member 3:** please review `lib/retrieval/messages.ts`, the safety-role keywords in `lib/retrieval/query-analysis.ts`, and `tests/retrieval/boundary.json` (H13), and this document (H15).
- **Member 2:** keep the eight section headings exactly; unknown headings are reported and not indexed. SAME needs its capitalised name in the title or short title.
