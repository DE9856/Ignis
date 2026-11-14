# Supabase

Schema for the evidence index. Optional: the application runs without it.

## Apply

1. Create a project at supabase.com.
2. Open the SQL editor, paste `migrations/0001_evidence_chunks.sql`, run it. It is safe to run again.
3. Copy the project URL and anon key into `.env.local` (see `.env.example`).
4. Run `npm run check:db`. It reports whether the database is reachable, the table exists and pgvector is installed.

The migration has not been run against a live project by its author. If the SQL editor reports an error, fix it here in the same pull request.

## What it creates

- `evidence_chunks`: one row per retrievable chunk, with text, provenance, metadata, a `vector(384)` embedding and a generated full-text column.
- Indexes for vector, full-text and metadata lookups.
- Row-level security: the anon key reads verified chunks only.
- `ignis_vector_available()` for the health check, and `match_evidence_chunks()` as a minimal similarity lookup.

It creates no rows. Ingestion is Member 5's script and runs from `main` after records are verified.

Column meanings and the mapping to the frontend type are in `docs/retrieval-contract.md`.
