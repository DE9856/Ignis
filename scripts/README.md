# Scripts

Command-line tools for the data pipeline. None exist yet.

Planned, on `feat/search-rag`:

| Script               | Purpose                                                                      |
| -------------------- | ---------------------------------------------------------------------------- |
| `validate-knowledge` | Run the OKF loader over `knowledge/` and exit non-zero on any issue (for CI) |
| `chunk-knowledge`    | Split verified records into section-aware `EvidenceChunk` objects            |
| `embed-chunks`       | Embed chunks with BAAI/bge-small-en-v1.5 (384 dimensions)                    |
| `ingest-supabase`    | Upsert chunks and vectors into Supabase pgvector                             |
| `evaluate-retrieval` | Run a fixed query set and report retrieval quality                           |

Conventions:

- Reuse `lib/okf` for parsing and `lib/retrieval/types.ts` for chunk shapes. Do not re-implement either.
- Only verified records are chunked and embedded.
- Write generated artefacts to `data/`, which is git-ignored.
- Scripts that write to Supabase read `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` and must fail with a clear message when it is missing.
- Record the model and chunking version in `embeddingVersion` on every chunk.
