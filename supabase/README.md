# Supabase

Schema for the evidence index. Optional: the application runs without it.

Full setup, environment and Vercel instructions: [`docs/deployment.md`](../docs/deployment.md).

## Apply

1. Create a project at supabase.com.
2. Open the SQL editor, paste `migrations/0001_evidence_chunks.sql`, run it. It is safe to run again.
3. Copy the project URL and anon key into `.env.local` (see `.env.example`).
4. Run `npm run check:db`. It reports one state (`READY`, `PGVECTOR_UNAVAILABLE`, `EVIDENCE_CHUNKS_TABLE_MISSING`, ...) plus reachability, table, pgvector and embedding dimension. `npm run check:db -- --strict` also fails when Supabase is not configured.

The migration has not been run against a live project by its author. If the SQL editor reports an error, fix it here in the same pull request.

## What it creates

- `evidence_chunks`: one row per retrievable chunk, with text, provenance, metadata, a `vector(384)` embedding and a generated full-text column.
- Indexes for full-text and metadata lookups. No vector index: exact search is faster to reason about and fast enough below ~10^4 rows (see the comment in the SQL).
- Row-level security: the anon key reads verified chunks only; write privileges are revoked from `anon` and `authenticated`.
- `ignis_vector_available()` and `ignis_embedding_dimension()` for the health check, and `match_evidence_chunks()` as a minimal similarity lookup.

It creates no rows. Ingestion is Member 5's script and runs from `main` after records are verified.

Column meanings and the mapping to the frontend type are in `docs/retrieval-contract.md`.
