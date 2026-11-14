# Retrieval contract

The engineering boundary between the retrieval implementation (Member 5) and the rest of the application (Member 1 for wiring, Member 4 for display). It says what each side can rely on. It does not say how retrieval should work internally.

## The pipeline and who owns each step

```
OKF Markdown (knowledge/)                       Member 2 writes, Member 3 verifies
  -> parseOkfDocument()          lib/okf        Member 1   provided
  -> chunker                     lib/retrieval  Member 5   to build
  -> embeddings (384-d)          lib/embeddings Member 5   to build
  -> evidence_chunks table       supabase/      Member 1   schema provided, empty
  -> ingestion script            scripts/       Member 5   to build
  -> retriever                   lib/retrieval  Member 5   to build (placeholder provided)
  -> retrieveEvidence()          lib/integration Member 1  provided
  -> evidence display model      lib/integration Member 1  provided
  -> Evidence Desk               components/    Member 4
```

## 1. Chunker input

Call `parseOkfDocument(raw, filePath)` from `lib/okf/parser.ts`. Do not write a second Markdown parser. On success it returns:

```ts
{
  id: string;                 // record id, the file name without .md
  type: "Investigation" | "Hardware" | "Concept" | "Mission";
  filePath: string;           // knowledge/<folder>/<file>.md
  metadata: { ... };          // validated frontmatter, camelCase
  sections: {
    heading: string;          // "Experimental Conditions"
    slug: string;             // "experimental-conditions"
    level: 1 | 2;
    content: string;          // trimmed Markdown
    order: number;            // 0-based, document order
  }[];
}
```

Shared rules to call, not re-implement:

| Question                                       | Function                                             |
| ---------------------------------------------- | ---------------------------------------------------- |
| Is this record eligible for the trusted index? | `isVerified(document.metadata)` in `lib/okf/parser`  |
| Is this section evidence, or display-only?     | `isEvidenceSection(slug)` in `lib/domain/provenance` |
| Which evidence class does this section carry?  | `getSectionProvenance(slug)`                         |
| May this chunk be indexed or returned?         | `canUseForRetrieval({ sourceClass, humanReviewed })` |

Today those rules say: only `stable` records with a reviewer entry; `source-notes` is not evidence; `fire-safety-relevance` is `TEAM_INTERPRETATION`, everything else `NASA_SOURCE`.

Pinned by `tests/contract/chunker-input.test.ts`.

## 2. Embedding

- Model: `BAAI/bge-small-en-v1.5`, 384 dimensions. Constants `EMBEDDING_MODEL` and `EMBEDDING_DIMENSIONS` in `lib/retrieval/types.ts`.
- The same model, and the same wrapper function, for chunks and for queries.
- Record the model and chunker version in `embedding_version` on every row.
- Embedding vectors, model files and generated chunk dumps are never committed. Write artefacts to `data/`, which is git-ignored.

## 3. Database table

Defined in `supabase/migrations/0001_evidence_chunks.sql`, typed as `EvidenceChunkRow` in `lib/supabase/types.ts`. The migration creates the schema only; it has not been run against a live project yet.

| Column                                       | Type        | Notes                                                                              |
| -------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `chunk_id`                                   | text, PK    | Deterministic: `<record-id>.<type>.<nn>`, e.g. `bass-ii.conditions.01`             |
| `concept_id`                                 | text        | `<folder>/<record-id>`                                                             |
| `investigation`                              | text        | Display name of the parent record                                                  |
| `title`                                      | text        |                                                                                    |
| `section`                                    | text        | Heading the chunk came from                                                        |
| `chunk_type`                                 | text        | OBJECTIVE, CONDITIONS, VARIABLES, MEASUREMENT, FINDING, LIMITATION, INTERPRETATION |
| `content`                                    | text        | Full chunk text. A vector match always has its text and provenance beside it       |
| `source_class`                               | text        | NASA_SOURCE or TEAM_INTERPRETATION                                                 |
| `source_url`                                 | text, null  |                                                                                    |
| `safety_category`                            | text[]      | prevention, detection, suppression                                                 |
| `fuel_type`, `material`, `gravity_condition` | text, null  |                                                                                    |
| `tags`                                       | text[]      |                                                                                    |
| `human_verified`                             | boolean     |                                                                                    |
| `previous_chunk_id`, `next_chunk_id`         | text, null  | Neighbours within the same record                                                  |
| `embedding_version`                          | text        |                                                                                    |
| `embedding`                                  | vector(384) | Never selected for the frontend                                                    |
| `fts`                                        | tsvector    | Generated from `content`. Read-only                                                |

Indexes: HNSW cosine on `embedding`; GIN on `fts`, `safety_category`, `tags`; b-tree on `concept_id`, `investigation`, `human_verified`, `chunk_type`.

Row-level security is on. The anon key reads rows where `human_verified` is true and nothing else. Writing needs the service-role key, which only the ingestion script uses.

Two functions are provided: `ignis_vector_available()` for the health check, and `match_evidence_chunks(query_embedding, match_count)` as a minimal similarity lookup. The hybrid search is yours to add, in a new migration file.

Where this document says NASA_SOURCE, Member 5's brief says NASA_EVIDENCE. The codebase uses `NASA_SOURCE` throughout.

Pinned by `tests/contract/supabase-schema.test.ts`: every column in the row type must appear in the migration, and the vector size must equal `EMBEDDING_DIMENSIONS`.

## 4. Retriever interface

Implement `EvidenceRetriever` from `lib/retrieval/types.ts` and return it from `getRetriever()` in `lib/retrieval/index.ts`:

```ts
interface EvidenceRetriever {
  search(query: RetrievalQuery): Promise<RetrievalResponse>;
}

type RetrievalResponse =
  { status: "ok"; results: RetrievedEvidence[] } | { status: "unavailable"; reason: string };

interface RetrievedEvidence {
  chunk: EvidenceChunk; // no embedding array
  lexicalScore: number | null; // null when that signal was not used
  vectorScore: number | null;
  combinedScore: number;
}
```

Requirements:

1. `search()` resolves; it does not reject. If something is down, resolve with `status: "unavailable"` and a reason a user can read.
2. `chunk` has exactly the `EvidenceChunk` fields. No embedding.
3. Results are ordered best first.
4. When the real retriever is in place, set `RETRIEVAL_IMPLEMENTED = true` in `lib/retrieval/index.ts`. The application then stops showing "retrieval not available" and stops offering the development mock.

`rowToEvidenceChunk()` in `lib/integration/evidence.ts` converts a database row to an `EvidenceChunk` and maps the upper-case `chunk_type` values onto the current `ChunkType` union. VARIABLES currently maps to `"other"`; if you want a dedicated value, add it to `ChunkType` in a `contract:` pull request.

To extend `RetrievedEvidence` (for example matched terms or a metadata score for the why-retrieved view), add optional fields in a `contract:` pull request so Member 4 can use them.

Pinned by `tests/contract/retrieval.test.ts`, which checks shape only, never retrieval quality.

## 5. What the application calls

Screens call `retrieveEvidence(query, options)` in `lib/integration/retrieval.ts`, not the retriever directly. It:

- returns an empty result for a blank query without calling you;
- applies the trust filter (`canUseForRetrieval`), so an unverified chunk is dropped even if the index returned it;
- converts a thrown error into `status: "unavailable"`;
- adds `origin`: `"live"`, `"dev-mock"` or `"none"`.

`components/evidence/evidence-search.tsx` calls `retrieveEvidence()`, so the trust filter, the dev-mock switch and the `unavailable` fallback all apply to the Evidence Desk. Its "Why retrieved?" drawer shows `lexicalScore`, `vectorScore` and `combinedScore` as returned, and lists which words of the question appear in the passage (a display aid, not a retrieval signal).

For display, `toEvidenceDisplayModel()` decides the badge, whether a chunk is canonical NASA evidence or team interpretation, and whether the source link is safe to render.

## 6. Trust filtering, in one place

| Content                                  | Indexed | Returned by default | Shown as            |
| ---------------------------------------- | ------- | ------------------- | ------------------- |
| NASA-sourced section of a stable record  | Yes     | Yes                 | NASA source         |
| Fire Safety Relevance of a stable record | Yes     | Yes                 | Team interpretation |
| Any section of a draft record            | No      | No                  | Unverified          |
| Any section of a deprecated record       | No      | No                  | n/a                 |
| Generated summary                        | Never   | Never               | Generated summary   |

Citations shown to a user come from stored chunk fields (`source_url`, `investigation`, `section`), never from generated text.

## 7. Checking your side

```bash
npm run check:db                 # reachable? table? pgvector?
npm test -- tests/contract       # shapes still agree
curl localhost:3000/api/health?deep=1
```
