# Scripts

Command-line tools for the retrieval pipeline (Member 5). Run them with `npx tsx`; scripts that talk to Supabase read `.env.local` through `--env-file`.

| Command                                                        | What it does                                                                                      | Needs                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `npx tsx scripts/ingest.ts --dry-run`                          | Chunk the verified records and print a report. Writes `data/chunks.json`. Sends nothing anywhere. | nothing                          |
| `npx tsx scripts/ingest.ts --dry-run --exact-tokens`           | Same, and counts tokens with the model's tokenizer (downloads it once)                            | network once                     |
| `npx tsx --env-file=.env.local scripts/ingest.ts --selftest`   | Insert, read, search and delete one test row; checks row-level security                           | Supabase keys, migration applied |
| `npx tsx --env-file=.env.local scripts/ingest.ts`              | Chunk, embed, upsert, delete stale rows. Only from a clean `main`.                                | Supabase service key             |
| `npx tsx --env-file=.env.local scripts/ingest.ts --verify`     | Exit 1 if the index differs from the verified records                                             | Supabase service key             |
| `npx tsx scripts/evaluate.ts`                                  | Evaluation on the local records, keywords + metadata                                              | nothing                          |
| `npx tsx scripts/evaluate.ts --embed`                          | Evaluation with full hybrid search using the real model                                           | network once                     |
| `npx tsx --env-file=.env.local scripts/evaluate.ts --supabase` | Evaluation against the shared index                                                               | Supabase anon key                |
| `npx tsx scripts/evaluate.ts --url <deployment URL>`           | Evaluation through the deployed search route                                                      | a deployment                     |

Add `--write` to `evaluate.ts` to save `docs/retrieval-evaluation.md`, and `--split dev` or `--split holdout` to score one split.

## After a `verify:` pull request merges (handoff H12)

```bash
git switch main && git pull
npx tsx --env-file=.env.local scripts/ingest.ts
npx tsx --env-file=.env.local scripts/ingest.ts --verify
git switch feat/search-rag
```

Post the summary line the script prints in the team channel.

## Conventions

- Reuse `lib/okf` for parsing and `lib/retrieval` for chunk shapes. Do not re-implement either.
- Only verified records are chunked and embedded.
- Generated artefacts go to `data/`, which is git-ignored.
- Scripts that write to Supabase use `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` and stop with a clear message when it is missing. The key is never committed.
- `scripts/sql/evidence_chunks.proposal.sql` is a proposal for Member 1's migration; no script runs it.
