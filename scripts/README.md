# Scripts

Command-line tools. They are TypeScript, executed with `tsx`.

## Knowledge and environment

| Script                  | Command                      | Purpose                                                      |
| ----------------------- | ---------------------------- | ------------------------------------------------------------ |
| `validate-knowledge.ts` | `npm run validate:knowledge` | Structural validation of `knowledge/`. Exits 1 on any error  |
| `inspect-knowledge.ts`  | `npm run inspect:knowledge`  | Progress statistics. Counts only, never content              |
| `check-env.ts`          | `npm run check:env`          | Which environment variables are usable. Never prints a value |
| `check-db.ts`           | `npm run check:db`           | Is Supabase reachable, is the schema in place                |

Options are in `docs/development.md`.

## Retrieval pipeline (Member 5)

Scripts that talk to Supabase read `.env.local` through `--env-file`. Anything that runs the model needs its files in `models/`: run `npm run fetch:model` once (it also runs before every build).

| Command                                                        | What it does                                                                                                                                 | Needs                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `npm run fetch:model`                                          | Download the pinned q8 model files into `models/` (git-ignored) and verify their sha256. Runs as `prebuild`.                                 | network                          |
| `npx tsx scripts/check-bundle.ts`                              | After a build: fail if the search function lacks the model or Linux runtime, includes GPU libraries, or exceeds 200 MB. Runs as `postbuild`. | a build                          |
| `npx tsx scripts/ingest.ts --dry-run`                          | Chunk the verified records and print a report. Writes `data/chunks.json`. Sends nothing anywhere.                                            | nothing                          |
| `npx tsx scripts/ingest.ts --dry-run --exact-tokens`           | Same, and counts tokens with the model's tokenizer                                                                                           | model files                      |
| `npx tsx --env-file=.env.local scripts/ingest.ts --selftest`   | Insert, read, search and delete one test row; checks row-level security                                                                      | Supabase keys, migration applied |
| `npx tsx --env-file=.env.local scripts/ingest.ts`              | Chunk, embed, upsert, delete stale rows. Only from a clean `main`.                                                                           | Supabase service key             |
| `npx tsx --env-file=.env.local scripts/ingest.ts --verify`     | Exit 1 if the index differs from the verified records                                                                                        | Supabase service key             |
| `npx tsx scripts/evaluate.ts`                                  | Evaluation on the local records, keywords + metadata                                                                                         | nothing                          |
| `npx tsx scripts/evaluate.ts --embed`                          | Evaluation with full hybrid search using the real model                                                                                      | model files                      |
| `npx tsx --env-file=.env.local scripts/evaluate.ts --supabase` | Evaluation against the shared index                                                                                                          | Supabase anon key                |
| `npx tsx scripts/evaluate.ts --url <deployment URL>`           | Evaluation through the deployed search route                                                                                                 | a deployment                     |

Add `--write` to `evaluate.ts` to save `docs/retrieval-evaluation.md`, and `--split dev` or `--split holdout` to score one split.

## After a `verify:` pull request merges (handoff H12)

```bash
git switch main && git pull
npx tsx --env-file=.env.local scripts/ingest.ts
npx tsx --env-file=.env.local scripts/ingest.ts --verify
```

Post the summary line the script prints in the team channel.

## Conventions

- Reuse `lib/okf` for parsing and `lib/retrieval` for chunk shapes. Do not re-implement either.
- Only stable, human-reviewed records are chunked and embedded.
- Write generated artefacts to `data/`, which is git-ignored. Never commit embeddings or model files.
- A script that writes to Supabase must fail with a clear message when `SUPABASE_SERVICE_ROLE_KEY` is missing. The key is never committed.
- Record the model and chunker version in `embedding_version` on every chunk.
- The database schema lives in `supabase/migrations/`.
