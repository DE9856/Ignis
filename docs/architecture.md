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

| Module              | Responsibility                                                              | Depends on      |
| ------------------- | --------------------------------------------------------------------------- | --------------- |
| `lib/okf/types.ts`  | Domain types: `Investigation`, provenance, status, OKF document shapes      | nothing         |
| `lib/okf/schema.ts` | Zod schemas for frontmatter                                                 | types           |
| `lib/okf/parser.ts` | String in, typed document or issues out. No file access                     | schema          |
| `lib/okf/loader.ts` | File access. Server only                                                    | parser          |
| `lib/ranking/*`     | `MissionScenario`, relevance scoring, gap analysis. Pure functions          | okf types       |
| `lib/retrieval/*`   | `EvidenceChunk`, retriever interface, placeholder retriever                 | okf types       |
| `lib/supabase/*`    | Optional clients that return `null` when not configured                     | retrieval types |
| `components/*`      | Presentation. No file access, no scoring logic beyond calling `lib/ranking` | lib             |

Keep the dependency direction: `components -> lib`, never the reverse. Keep `parser.ts` free of file access so it stays easy to test.

## Server and client components

Server by default. Client components (`"use client"`) are limited to things that hold state: navigation highlight, scenario workspace, comparison selection, evidence search, the chart. Records are passed from server pages to client components as plain objects.

`lib/okf/loader.ts` and `lib/supabase/server.ts` must not be imported from client components.

## Ranking and gap analysis

`lib/ranking/relevance.ts` compares each factor a scenario specifies with an investigation record and returns `match`, `mismatch` or `unknown`. Score is matches over factors compared. The weights and the gravity tolerance are provisional and are documented on the Methodology page; change both together.

Rules that should not change: a missing value is never a match; identical inputs give identical order; unverified records are excluded unless explicitly included.

`lib/ranking/gap-analysis.ts` summarises the same outcomes per factor: covered, unknown, gap, or no evidence.

## Planned retrieval

Interfaces exist in `lib/retrieval/types.ts`. Nothing is implemented.

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

`getSupabaseClient()` and `getSupabaseServiceClient()` return `null` when their variables are missing. Callers must handle `null`. The dashboard's System status panel shows what is configured.

## Framework notes

The project uses the Next.js defaults from `create-next-app`, including Cache Components. In practice: avoid `async` data fetching in a page without either a `"use cache"` directive or a `<Suspense>` boundary, or the build will flag it. `AGENTS.md` is maintained by Next.js for coding agents; leave it in place.
