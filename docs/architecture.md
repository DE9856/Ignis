# Architecture

## Principles

- **Files are the source of truth.** Knowledge lives as Markdown in `knowledge/`. Anything in a database is a derived copy that can be rebuilt.
- **Evidence before interface.** A page with no verified evidence says so. It does not show sample data.
- **Deterministic first.** Ranking and gap analysis are plain functions with tests. A language model is optional and comes last.
- **Small and readable.** One day, five people. Prefer a plain function to a framework.

## Data flow today

```
knowledge/<type>/<id>.md
   -> lib/okf/parser.ts     gray-matter splits frontmatter and body; Zod validates; body is split into sections
   -> lib/okf/loader.ts     reads all four folders; returns records plus a list of validation issues
   -> app/*/page.tsx        server components call loadKnowledgeBase()
   -> components/*          render records; client components run ranking in the browser
```

Pages are prerendered at build time, so a deployed site reflects the knowledge files at the commit it was built from. In `npm run dev`, files are re-read on each request.

Invalid files never crash the app. They are excluded and listed on the Evidence Explorer and counted on the dashboard.

## Modules

| Module            | Responsibility                                                                 | Depends on              |
| ----------------- | ------------------------------------------------------------------------------ | ----------------------- |
| `lib/okf`         | Domain types, frontmatter schema, parser, loader, structural validation        | nothing                 |
| `lib/domain`      | Provenance and trust rules; unit conversion and null-safe numeric helpers      | okf types               |
| `lib/ranking`     | Scenario type, relevance scoring, gap analysis, methodology configuration slot | okf                     |
| `lib/retrieval`   | Chunk type, retriever interface, placeholder retriever                         | okf types               |
| `lib/supabase`    | Optional clients that return `null` when not configured; database health check | retrieval types         |
| `lib/core`        | Environment inspection, capability flags, degraded-state wording, typed errors | okf, ranking, retrieval |
| `lib/integration` | View models and adapters: the only thing pages need to call                    | everything above        |
| `lib/dev`         | Development-only mocks and `TEST_CONFIG`                                       | loaded dynamically only |
| `components`      | Presentation. No file access, no Markdown parsing, no scoring                  | lib                     |
| `scripts`         | Command-line validation, inspection and checks                                 | lib                     |

Keep the dependency direction: `app -> lib/integration -> lib/*`, and `components -> lib`, never the reverse. `lib/okf/parser.ts` has no file access, which keeps it easy to test.

## Running with pieces missing

Five people build in parallel, so most of the time something is unfinished. `lib/core/capabilities.ts` reports what this instance can do: Supabase configured, retrieval implemented, synthesis available, verified knowledge loaded, methodology configured. Pages ask for the notices that apply to them (`getDegradedNotices`) and render them with `<DegradedNotice />`. Nothing throws because a teammate's module is not there yet, and nothing substitutes sample data for missing evidence.

Development mocks are a separate, explicit switch (`NEXT_PUBLIC_IGNIS_DEV_MOCKS=1` and a non-production build). They are reached only through `lib/integration/`, by dynamic import. See `docs/development.md`.

## Trust rules

`lib/domain/provenance.ts` is the only place that decides what counts as trusted: generated summaries are never canonical; team interpretation is not NASA evidence; reviewed NASA-sourced content is canonical; unverified content is used only on explicit opt-in; deprecated content never. Ranking inputs go through `canUseForAnalytics`, retrieval results through `canUseForRetrieval`.

## Errors

`lib/core/errors.ts` defines `IgnisError` with a fixed set of codes. Each code has a message that is safe to show. Internal detail is carried on the error and surfaced only outside production; stack traces are never shown. Knowledge files that fail to parse do not raise errors at all: they are excluded and listed, so one bad file cannot take a page down.

## Server and client components

Server by default. Client components (`"use client"`) are limited to things that hold state: navigation highlight, scenario workspace, comparison selection, evidence search, the chart. Records are passed from server pages to client components as plain objects.

`lib/okf/loader.ts`, `lib/okf/validation.ts`, `lib/core/env.ts` and `lib/supabase/server.ts` must not be imported from client components.

## Ranking and gap analysis

`lib/ranking/relevance.ts` and `gap-analysis.ts` hold a working placeholder: each factor a scenario specifies is compared with an investigation record and comes out as match, mismatch or unknown. The weights and thresholds in it are not a methodology.

The validated methodology belongs to Member 3. Its weights and multipliers are installed as `PRODUCTION_METHODOLOGY` in `lib/ranking/methodology.ts`; its rules are implemented from `docs/methodology.md`. Until that is in place the application reports scoring as awaiting methodology. The target result shapes (`RelevanceBreakdown`, `GapResult`) are declared in `lib/ranking/types.ts` so the interface can be built against them now.

Rules that hold whatever the methodology: a missing value is never a match; identical inputs give identical order; unreviewed records are excluded unless explicitly included; relevance is not a probability and coverage is not a risk level.

## Planned retrieval

Interfaces exist in `lib/retrieval/types.ts`, the database schema in `supabase/migrations/`, and the boundary is written down in `docs/retrieval-contract.md`. The retrieval implementation itself is not built.

```
OKF Markdown
 -> section-aware chunking          one chunk per section, linked by previousChunkId / nextChunkId
 -> verified chunks only            drafts are not embedded
 -> BAAI/bge-small-en-v1.5          384-dimensional embeddings
 -> Supabase pgvector               table evidence_chunks
 -> hybrid retrieval                metadata filters + lexical + vector
 -> retrieved evidence              EvidenceChunk objects with scores
 -> optional grounded synthesis     labelled GENERATED_SUMMARY, with sources
```

Decisions already made:

- `EvidenceChunk` carries no embedding array. Vectors stay in the database (`EvidenceChunkRow.embedding`).
- `embeddingVersion` records the model and chunking version so stale vectors can be found and rebuilt.
- The UI calls `getRetriever()` in `lib/retrieval/index.ts`. Replace the placeholder there; the Evidence Desk needs no other change.
- Ingestion uses the service-role key and runs from `scripts/`, never from the browser.

## Running without Supabase

`getSupabaseClient()` and `getSupabaseServiceClient()` return `null` when their variables are missing. Callers must handle `null`. `checkDatabaseHealth()` is on-demand only and is never called during page load. The dashboard's System status panel, `/dev/status` and `/api/health` show what is configured.

## Framework notes

The project uses the Next.js defaults from `create-next-app`, including Cache Components. In practice: avoid `async` data fetching in a page without either a `"use cache"` directive or a `<Suspense>` boundary, or the build will flag it. `AGENTS.md` is maintained by Next.js for coding agents; leave it in place.
