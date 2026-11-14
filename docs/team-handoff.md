# Team handoff

What each member needs from the codebase, where it is, and how to check their work against it. For the order of work and the handoffs between people, see `docs/team/IGNIS_Team_Workflow.pdf`.

One command tells you whether your change fits: `npm run check`.

## Member 2: evidence curator

**Where files go**

```
knowledge/investigations/<id>.md
knowledge/hardware/<id>.md
knowledge/concepts/<id>.md
```

Start from `knowledge/_templates/investigation.md`. File names are lower-case with hyphens and become the record id.

**How to validate**

```bash
npm run validate:knowledge      # PASS / WARN / ERROR per file
npm run inspect:knowledge       # counts, and how many condition fields each record states
npm run dev                     # open /explore to see the record as the application sees it
```

An ERROR blocks the merge. A WARN is a prompt to look. A draft may have warnings.

**Required fields**

`type` and `title`. Everything else is optional, and `null` is the correct value for anything the source does not state. Keys are snake_case. A misspelt key is an error, by design.

**How sources work**

```yaml
resource: https://... # primary source, optional
sources:
  - id: psi # short id, unique within the file
    resource: https://... # must be an http(s) URL
    title: NASA PSI investigation record
    source_class: NASA_SOURCE
    accessed: 2026-11-14
```

A draft with no sources gets a warning. A stable record with no sources is an error. Placeholder text such as "NASA PSI URL", "TODO" or "..." is a warning on a draft and an error on a stable record.

Leave `status: draft` and `verified: []`. You never set `stable` on your own record; the validator rejects a record verified only by its author.

Full field list: `docs/data-contract.md`.

## Member 3: validation and methodology

**Where verification metadata goes**

In the record's frontmatter, in a separate commit from the author's:

```yaml
status: stable
verified:
  - by: human:member3
    at: 2026-11-14T10:30:00Z
    note: "Checked against NASA PSI record and listed NASA sources."
```

`npm run validate:knowledge` then holds the record to the stricter stable rules. `npm run inspect:knowledge` shows the human-reviewed count.

**Where the methodology configuration lives**

`lib/ranking/methodology.ts`. `PRODUCTION_METHODOLOGY` is `null` today, and while it is null the application says "Mission relevance scoring is awaiting validated methodology." Installing it means replacing `null` with an object of this shape:

```ts
{
  id: "ignis-methodology-v1",
  label: "...",
  approvedBy: "human:member3",
  approvedAt: "2026-11-14",
  weights: { safetyObjective, materialFuel, oxygen, airflow, pressure, gravity, measurement },
  stateMultipliers: { DIRECT, RELATED, BOUNDING, UNKNOWN, NOT_RELEVANT },
}
```

The numbers are yours. Nobody else sets them. `lib/dev/test-config.ts` holds `TEST_CONFIG`, with arbitrary values for tests only; it has no approver and can never count as configured.

The configuration carries weights and multipliers. The rules that assign a state to each dimension (when is oxygen RELATED rather than DIRECT, the gravity rule, how a blank dimension is treated, how coverage is calculated) need to be written in `docs/methodology.md` with worked examples; Member 1 implements them from that document and turns the examples into tests. The scorer in `lib/ranking/relevance.ts` is a labelled placeholder until then.

**How presets are represented**

One file per preset in `knowledge/missions/`, `type: Mission`. The shared fields (title, description, sources, status, verified) are validated. Preset-specific fields are not in the schema yet: add the ones you need, `validate:knowledge` will list them as a warning, and tell Member 1 the final names so they are added to the schema and wired into the scenario builder. Record for each value whether it is a sourced physical parameter, challenge context, or a prototype assumption.

**Evidence classification**

`lib/domain/provenance.ts` is the single place that decides what counts as canonical evidence and what may be ranked or retrieved. If a rule there is wrong, change it there; `tests/domain/provenance.test.ts` states the current rules in plain terms.

**Decided on Member 3's behalf (2026-11-14)**

Member 3 was absent. These were reviewed by `human:member2` acting for her, with Claude preparing each item. Each one is recorded where it applies; revisit any of them.

| Item                             | Decision                                                                                                                                                                                                                                                                   | Where                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Verification of 11 records       | Signed off as `human:member3` on Member 3's instruction, from the source-check reports                                                                                                                                                                                     | `knowledge/investigations/`, `docs/reviews/`                  |
| Evaluation labels (23 questions) | All accepted. q07 kept as FLEX + BASS (changed from the brief); q13 keeps CFI; q20 keeps BASS; q23 must show the partial-gravity notice                                                                                                                                    | `tests/retrieval/eval-set.json` (`labelStatus`, `reviewNote`) |
| Boundary wording                 | All eight approved. The false-premise message now also says "The reviewed evidence does not establish this."                                                                                                                                                               | `lib/retrieval/messages.ts`                                   |
| Automatic summary                | Accepted: the grounded summary is written for every search and shown above the evidence, reversing the brief's "synthesis only on request". Kept safe by the boundary refusals, citation, number and scope checks, the second review pass, and the evidence shown below it | `docs/retrieval.md`, `lib/synthesis/`                         |
| Lunar and Mars questions         | Any question mentioning partial gravity shows an informational notice when no verified record was tested there; the summary is still written and must say so. "Was it tested on the Moon?" keeps the blocking coverage answer                                              | `lib/retrieval/guard.ts` (`PARTIAL_GRAVITY_BOUND`)            |

## Member 4: interface and visualisation

**View models that exist**

Plain data, ready to render. Components should take these as props and not load data, parse Markdown or compute scores.

| View model             | Built by                                                        | For                                                                       |
| ---------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `DashboardViewModel`   | `buildDashboardViewModel()` in `lib/integration/dashboard.ts`   | Counts, coverage by objective, reviewed list, top investigations, notices |
| `ScenarioAnalysis`     | `analyzeScenario()` in `lib/integration/scenario.ts`            | Ranked investigations with per-factor outcomes, gaps                      |
| `ComparisonViewModel`  | `buildComparisonViewModel()` in `lib/integration/comparison.ts` | Rows with display text, unknown flags, same/different                     |
| `EvidenceDisplayModel` | `toEvidenceDisplayModel()` in `lib/integration/evidence.ts`     | Evidence cards: badge, canonical or interpretation, safe link, scores     |
| `KnowledgeSummary`     | `summarizeKnowledge()` in `lib/integration/knowledge.ts`        | Counts by type and status                                                 |
| `DegradedNotice[]`     | `getDegradedNotices()` in `lib/core/degraded.ts`                | "Not available yet" messages                                              |

The pages do not all use these yet; the existing components still take `Investigation[]` directly and keep working. Move a screen over when you rework it.

**Contracts that are stable**

- `Investigation` (`lib/okf/types.ts`). Every scientific field is `T | null`.
- The provenance classes and their labels (`getProvenanceLabel()` in `lib/domain/provenance.ts`).
- Status values: `draft`, `stable` (shown as "Human reviewed"), `deprecated`.
- `EvidenceChunk` and `RetrievedEvidence` (`lib/retrieval/types.ts`).
- The degraded-state wording in `lib/core/degraded.ts`.

**Contracts that will change**

- `RelevanceResult` and `GapFinding` are the placeholder scorer's output. They will be replaced by `RelevanceBreakdown` and `GapResult` (already declared in `lib/ranking/types.ts` as a draft, using DIRECT, RELATED, BOUNDING, UNKNOWN and DIRECT, BOUNDING, INDIRECT, MISSING). Build the score explanation and gap views against the draft types.

**What you can safely redesign**

Everything under `components/` and the tokens in `app/globals.css`. Keep these: unknown values are visible, never blank; status and provenance are text as well as colour; no percentage without a label and a way to its breakdown; empty data shows "Awaiting verified NASA evidence".

For layout work with records on screen, copy a fixture from `tests/fixtures/knowledge/investigations/` to `knowledge/investigations/zz-local-<name>.md`. Those files are git-ignored.

## Member 5: retrieval

Everything is in `docs/retrieval-contract.md`. In brief:

| You need               | It is                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `EvidenceChunk`        | `lib/retrieval/types.ts`. No embedding array on it                                                 |
| Embedding dimension    | 384, `EMBEDDING_DIMENSIONS`. Model `BAAI/bge-small-en-v1.5`                                        |
| Supabase schema        | `supabase/migrations/0001_evidence_chunks.sql`, typed in `lib/supabase/types.ts`                   |
| Retrieval API contract | Implement `EvidenceRetriever`, return it from `getRetriever()`, set `RETRIEVAL_IMPLEMENTED = true` |
| Trust filtering        | `isVerified`, `isEvidenceSection`, `getSectionProvenance`, `canUseForRetrieval`                    |
| Chunker input          | `parseOkfDocument()` output; shape pinned in `tests/contract/chunker-input.test.ts`                |
| Synthetic data         | `tests/fixtures/knowledge/` and `TEST_CHUNKS` in `tests/fixtures/chunks.ts`                        |
| Database check         | `npm run check:db`                                                                                 |

Ingest from `main`, never from a feature branch, so the index holds only what was verified and merged.

## Everyone

- `http://localhost:3000/dev/status` shows what is configured and which module is waiting on whom.
- `tests/contract/` fails when a shared shape changes. If you meant to change it, update the test in the same pull request and put `contract:` in the title.
- `docs/development.md` has every command and the post-knowledge-merge checklist.
