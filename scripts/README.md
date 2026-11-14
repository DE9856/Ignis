# Scripts

Command-line tools. Run them through npm; they are TypeScript, executed with `tsx`.

| Script                  | Command                      | Purpose                                                      |
| ----------------------- | ---------------------------- | ------------------------------------------------------------ |
| `validate-knowledge.ts` | `npm run validate:knowledge` | Structural validation of `knowledge/`. Exits 1 on any error  |
| `inspect-knowledge.ts`  | `npm run inspect:knowledge`  | Progress statistics. Counts only, never content              |
| `check-env.ts`          | `npm run check:env`          | Which environment variables are usable. Never prints a value |
| `check-db.ts`           | `npm run check:db`           | Is Supabase reachable, is the schema in place                |

Options are in `docs/development.md`.

Still to come, on `feat/search-rag`:

| Script               | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `ingest`             | Chunk and embed stable records, upsert into `evidence_chunks` |
| `evaluate-retrieval` | Run the labelled query set and report Top-1, Top-3, Top-5     |

Conventions:

- Reuse `lib/okf` for parsing and the rules in `lib/domain/provenance.ts` for eligibility. Do not re-implement either.
- Only stable, human-reviewed records are chunked and embedded.
- Call `loadLocalEnv()` from `scripts/lib/cli.ts` to read `.env.local`.
- Write generated artefacts to `data/`, which is git-ignored. Never commit embeddings or model files.
- A script that writes to Supabase must fail with a clear message when `SUPABASE_SERVICE_ROLE_KEY` is missing.
- Record the model and chunker version in `embedding_version` on every chunk.
