# Deployment

How to run IGNIS locally, connect a Supabase project, and deploy to Vercel. Commands are PowerShell-friendly; they work in Git Bash too.

IGNIS is designed to work with **nothing** configured. Supabase, retrieval, an LLM, verified knowledge and the scoring methodology are all optional, and each missing piece produces an honest notice rather than an error (see "Degraded operation").

## Local setup

```powershell
git switch main; git pull
npm ci
npm run check          # format, lint, types, tests, knowledge validation
npm run dev            # http://localhost:3000
```

Node 22 is pinned in `.nvmrc`. `npm run check:env` shows which environment variables are usable (names and states, never values).

## Supabase setup

Supabase is optional. It holds the derived retrieval index (`evidence_chunks`). The OKF Markdown files in `knowledge/` remain the source of truth and the index can be dropped and rebuilt from them.

Manual steps (these need your Supabase account; nothing here is automated):

1. Create a project at https://supabase.com (any region, free tier is enough).
2. **Project Settings → API**: copy the **Project URL**, the **anon / publishable** key, and the **service_role / secret** key.
3. Copy `.env.example` to `.env.local` and fill in:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>
   ```

4. Run the migration (next section).
5. Verify:

   ```powershell
   npm run check:env
   npm run check:db
   ```

   Expected: `Status  READY`. With a fresh project it also prints "The index is empty", which is correct until ingestion has run.

## Running migrations

The migration is `supabase/migrations/0001_evidence_chunks.sql`. It is safe to run more than once and creates no rows and no embeddings.

**Simplest (recommended for the first run):** Supabase dashboard → **SQL Editor** → New query → paste the whole file → **Run**. Then run `npm run check:db`.

**Supabase CLI (optional):**

```powershell
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

If the SQL editor reports an error, fix the SQL in the repository and re-run; do not hand-edit the live database.

### What the migration sets up

| Item               | Detail                                                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pgvector           | `create extension if not exists vector`                                                                                                                                                        |
| Table              | `public.evidence_chunks`, columns documented in `docs/retrieval-contract.md`; `embedding vector(384)` (nullable), `metadata jsonb`, `created_at`, `updated_at` (kept current by a trigger)     |
| Embedding contract | `BAAI/bge-small-en-v1.5`, 384 dimensions. Constants `EMBEDDING_MODEL` / `EMBEDDING_DIMENSIONS` in `lib/retrieval/types.ts`. The model is never loaded in the Next.js app                       |
| Indexes            | btree on `concept_id`, `investigation`, `human_verified`, `source_class`, `chunk_type`; GIN on `safety_category`, `tags` and the generated full-text column                                    |
| Vector index       | **None, on purpose.** For a few hundred chunks an exact scan takes milliseconds with perfect recall. Add HNSW in a new migration only if the corpus passes ~10⁴ rows (SQL is in the migration) |
| Row-level security | Enabled. The anon key can `select` rows where `human_verified` is true. No insert/update/delete policy exists, and those privileges are revoked from `anon` and `authenticated`                |
| Writes             | Only the service-role key (which bypasses RLS), used by Member 5's ingestion script                                                                                                            |
| Helper functions   | `ignis_vector_available()`, `ignis_embedding_dimension()` (health check); `match_evidence_chunks()` (minimal similarity lookup, not the hybrid search)                                         |

**Read access is a decision, not an assumption.** Today the anon key can read verified chunks. If that is not wanted, drop the `read verified chunks` policy; the app then needs a server route using the service-role key for retrieval. Decide before Member 5's retrieval ships.

The migration is pinned by `tests/contract/supabase-schema.test.ts` (no live database needed).

## Environment variables

| Variable                        | Class                     | Purpose                                                 |
| ------------------------------- | ------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | PUBLIC, optional          | Project URL (https only; localhost allowed)             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | PUBLIC, optional          | Read-only key. Safe to expose because RLS limits it     |
| `SUPABASE_SERVICE_ROLE_KEY`     | **SERVER-ONLY**, optional | Admin key for ingestion and server code. Bypasses RLS   |
| `OPTIONAL_LLM_API_KEY`          | SERVER-ONLY, optional     | Groq key for grounded synthesis                         |
| `OPTIONAL_LLM_MODEL`            | SERVER-ONLY, optional     | Groq model id; defaults to `openai/gpt-oss-120b`        |
| `NEXT_PUBLIC_IGNIS_DEV_MOCKS`   | PUBLIC, dev only          | Synthetic TEST data. Ignored when `NODE_ENV=production` |

Both Supabase public values must be set together, or neither. `.env.local` is git-ignored (`.env*` except `.env.example`). `npm run check:env` also flags a service-role key placed in a `NEXT_PUBLIC_` variable.

Capability states: `SUPABASE_CONFIGURED` / `SUPABASE_NOT_CONFIGURED` and `LLM_CONFIGURED` / `LLM_NOT_CONFIGURED` come from `lib/core/env.ts`. "Configured" means "values present and valid", not "reachable" and not "implemented".

## Capabilities

`lib/core/capabilities.ts` is the single source of truth.

| Flag                              | True when                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `supabaseConfigured`              | Public URL and anon key set and valid (no live request)                                                             |
| `retrievalImplemented`            | `RETRIEVAL_IMPLEMENTED` is true in `lib/retrieval/index.ts`. **Member 5 flips it.** pgvector existing never sets it |
| `llmConfigured`                   | `OPTIONAL_LLM_API_KEY` set                                                                                          |
| `verifiedKnowledgeAvailable`      | At least one human-reviewed record is loaded                                                                        |
| `methodologyConfigured`           | Member 3's approved methodology is installed                                                                        |
| `retrievalEnabled` / `llmEnabled` | Usable features: implemented **and** configured                                                                     |

## Degraded operation

| Case                  | Behaviour                                                                      |
| --------------------- | ------------------------------------------------------------------------------ |
| No Supabase           | Local evidence browsing works from `knowledge/`; health says not configured    |
| No retrieval          | "Semantic retrieval is not available yet. Browse verified evidence instead."   |
| No LLM                | "Generated synthesis is disabled. Retrieved evidence remains available."       |
| No verified knowledge | "Verified NASA evidence has not yet been loaded." Empty states, no sample data |
| No methodology        | "Mission relevance scoring is awaiting validated methodology."                 |

Wording lives in `lib/core/degraded.ts`. A configured-but-down Supabase never blocks a page: pages do not call it. Only `/api/health?deep=1`, `npm run check:db` and the retrieval code path (when it exists) do.

## What loads when

| Data                             | Build time                                    | Server runtime                                                                            | Browser                                                                           |
| -------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| OKF knowledge (`knowledge/*.md`) | Read from disk and prerendered into the pages | Only by `/api/health` (files shipped via `outputFileTracingIncludes` in `next.config.ts`) | Receives rendered HTML and props only; never the raw knowledge base               |
| Supabase health check            | Never                                         | On demand: `/api/health?deep=1`                                                           | Never                                                                             |
| Retrieval (Member 5)             | Never                                         | Server routes / actions, using Supabase                                                   | Calls those routes; does not touch the DB directly with anything but the anon key |
| LLM synthesis                    | Never                                         | Server only (key is server-only)                                                          | Never                                                                             |
| Service-role client              | Never                                         | Server and scripts only (`lib/supabase/server.ts`)                                        | **Never.** Guarded by `tests/contract/deployment.test.ts`                         |

Consequences: a deployed site shows the knowledge **as of the commit it was built from**; new records need a new deploy. If a future page reads `knowledge/` at request time, add it to `outputFileTracingIncludes`, or it will find no files on Vercel.

## Vercel setup

Audit result: no route uses the Edge runtime; `fs`/`path` are used only in `lib/okf/*` (server code) and scripts; client components import no Node built-ins; the service-role key is read only in `lib/supabase/server.ts`.

1. **Node version:** in Vercel → Settings → General, set Node.js to 22.x to match `.nvmrc`. (`engines` is `>=20.19`, which would otherwise float.)
2. Framework preset: **Next.js** (auto-detected). Build command `npm run build`, install `npm ci` (defaults).
3. Environment variables (Settings → Environment Variables), for **Production** (and Preview if wanted):
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` only if server code needs it. IGNIS pages do not need it today; ingestion runs from a developer machine. **Leaving it out of Vercel is the safest choice until needed.** Never add a `NEXT_PUBLIC_` prefix.
   - Do **not** set `NEXT_PUBLIC_IGNIS_DEV_MOCKS`.
4. `NEXT_PUBLIC_*` values are inlined at build time: changing them requires a **redeploy**.

## Production checklist

Before every production deploy:

- [ ] `npm run check` passes (format, lint, types, tests, knowledge validation)
- [ ] `npm run build` passes
- [ ] `git status` clean; no `.env.local` or other env file committed (`git ls-files | Select-String "\.env"` shows only `.env.example`)
- [ ] No keys, tokens or URLs with credentials in the diff
- [ ] Service-role key is server-only (the deployment contract test passes)
- [ ] `/dev/status` returns 404 in production (tested; re-verify after deploy)
- [ ] `/api/health` returns only booleans and counts
- [ ] Supabase migration state known: `npm run check:db` reports `READY` for the target project (or Supabase intentionally unset)
- [ ] Optional services degrade gracefully (run once with every optional variable unset)
- [ ] No placeholder or synthetic NASA values in `knowledge/` (`TEST_` / `test.invalid` are rejected by the hygiene test)

## First production deployment

Do not deploy until the checklist is green. Nothing in the repository deploys automatically.

1. Merge `feat/infrastructure` to `main` once reviewed and CI is green.
2. Vercel → **Add New → Project** → import the GitHub repo.
3. Framework: Next.js. Set Node 22.x and the environment variables above.
4. **Deploy.**
5. Open `https://<deployment>/api/health`. Expect `"status":"ok"`, counts, and `false` for anything not set up.
6. If Supabase is connected, open `/api/health?deep=1`. Expect `"check":{"status":"READY"...}`.
7. Click through `/`, `/explore`, `/evidence`, `/compare`, `/scenario`, `/methodology`, `/about`. Empty states are expected until verified knowledge exists.
8. Open `/dev/status`. Expect the 404 page.
9. Confirm no secrets in the client: view page source / DevTools Network and search for `service_role` and the first characters of your service key. Only the anon key and project URL may appear.

## Rollback

- **Bad deploy:** Vercel → Deployments → pick the last good one → **Promote to Production** (instant; no rebuild).
- **Bad env value:** fix it in Vercel and redeploy. `NEXT_PUBLIC_*` changes need a rebuild.
- **Leaked service-role key:** Supabase → Project Settings → API → regenerate the key, update Vercel and `.env.local`, redeploy.
- **Bad migration:** the table is a derived index. `drop table public.evidence_chunks cascade;` then re-run the migration and re-ingest. The OKF files are untouched. Do this only on a project without data you need.
- **Supabase outage:** nothing to do. Pages do not depend on it.

## Left for later

Not infrastructure, deliberately absent: chunking, embedding generation, ingestion, hybrid retrieval, LLM synthesis (Member 5); methodology and presets (Member 3); knowledge records (Member 2).
