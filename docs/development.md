# Development

Day-to-day commands and what each one tells you.

## Commands

| Command                      | What it does                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `npm run dev`                | Development server at http://localhost:3000                                     |
| `npm run check`              | Format check, lint, type-check, tests, knowledge validation. Run before pushing |
| `npm run check:ci`           | `check` plus a production build. What CI runs                                   |
| `npm run test`               | Unit, contract and integration tests                                            |
| `npm run test:watch`         | Tests in watch mode                                                             |
| `npm run typecheck`          | Generate route types, then `tsc --noEmit`                                       |
| `npm run lint`               | ESLint                                                                          |
| `npm run format`             | Format everything with Prettier                                                 |
| `npm run validate:knowledge` | Structural validation of `knowledge/`. Exits 1 on any error                     |
| `npm run inspect:knowledge`  | Progress statistics for `knowledge/`. Counts only                               |
| `npm run check:env`          | Which environment variables are usable. Never prints a value                    |
| `npm run check:db`           | Is Supabase reachable, is the schema in place                                   |
| `npm run build`              | Production build                                                                |

The knowledge scripts accept a folder and flags after `--`:

```bash
npm run validate:knowledge -- tests/fixtures/knowledge     # another knowledge root
npm run validate:knowledge -- --strict                      # warnings also fail
npm run validate:knowledge -- --quiet                       # hide passing files
npm run validate:knowledge -- --json                        # machine-readable
npm run inspect:knowledge -- --json
```

## Post-knowledge-merge checklist

Run this on `main` straight after a `knowledge:` or `verify:` pull request merges.

```bash
git switch main && git pull
npm install
npm run validate:knowledge     # must end with Errors: 0
npm run inspect:knowledge      # do the counts match what was merged?
npm test
npm run build
```

Then, if records became `stable`, tell Member 5 so the retrieval index is rebuilt from `main`.

What to look for in `inspect:knowledge`:

- "Human reviewed" went up by the number of records just verified.
- "Without sources" is 0 for anything stable.
- "Files with errors" is 0. A file with errors is excluded from the application entirely.

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`: install, format check, type-check, lint, tests, knowledge validation, build. A newer push to the same branch cancels the run in progress. There is no deployment step; Vercel deploys from GitHub on its own once connected.

There is no pre-commit hook. `npm run check` takes a few seconds; run it before pushing. If the team wants a hook later, add it then.

## Running with pieces missing

The application is built to run while teammate modules are unfinished. `lib/core/capabilities.ts` works out what is available and pages show a plain notice for what is not.

| Missing                  | What the application does                                                      |
| ------------------------ | ------------------------------------------------------------------------------ |
| Any verified record      | "Verified NASA evidence has not yet been loaded." Empty states, no sample data |
| Supabase configuration   | Runs on local knowledge files                                                  |
| Retrieval implementation | "Semantic retrieval is not available yet. Browse verified evidence instead."   |
| LLM key or synthesis     | "Generated synthesis is disabled. Retrieved evidence remains available."       |
| Validated methodology    | "Mission relevance scoring is awaiting validated methodology."                 |

The wording lives in `lib/core/degraded.ts`. Use `getDegradedNotices()` and `<DegradedNotice />` instead of writing a new message.

## Diagnostics

- `http://localhost:3000/dev/status` shows capabilities, knowledge counts, environment states and which module is waiting on whom. Development only: a production build answers 404, and it is not in the navigation.
- `GET /api/health` returns configuration booleans and knowledge counts. `GET /api/health?deep=1` also contacts the database. Neither returns keys, URLs or file contents. Works in production, for checking a deployment.

## Development mocks

Mocks let you build against a module that is not finished. They are off by default.

To turn them on, add `NEXT_PUBLIC_IGNIS_DEV_MOCKS=1` to `.env.local`. They need a non-production build as well, so a deployed site can never serve them.

| Stand-in             | For                    | Where                       |
| -------------------- | ---------------------- | --------------------------- |
| `LocalMockRetriever` | Member 5's retriever   | `lib/dev/mock-retriever.ts` |
| `TEST_CONFIG`        | Member 3's methodology | `lib/dev/test-config.ts`    |
| Synthetic OKF files  | Member 2's records     | `tests/fixtures/knowledge/` |

Rules, enforced by `tests/contract/repository-hygiene.test.ts`:

- Production code never imports `lib/dev/` or `tests/` statically. Go through `lib/integration/`.
- Synthetic data is named `TEST_...` and uses `https://test.invalid/...`. No real investigation names.
- No `TEST_` record ever sits in `knowledge/`.

For layout work with records on screen, copy a fixture to `knowledge/investigations/zz-local-<name>.md`. Those files are git-ignored and are skipped in production builds.

## Test layout

| Folder              | Purpose                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| `tests/okf`         | Parser, loader, validation                                                  |
| `tests/ranking`     | Relevance, gap analysis, methodology configuration                          |
| `tests/core`        | Environment, capabilities, degraded states, errors                          |
| `tests/domain`      | Units, provenance rules                                                     |
| `tests/supabase`    | Database health check against a fake client                                 |
| `tests/contract`    | Shapes shared between team members. A failure here means a contract changed |
| `tests/integration` | Synthetic end-to-end run from Markdown files to a dashboard view model      |
| `tests/fixtures`    | Synthetic data for all of the above                                         |

## Deployment notes

- Pages are prerendered at build time from `knowledge/`. A deployed site reflects the knowledge files at the commit it was built from; new records need a new deploy.
- `/api/health` runs at request time. `next.config.ts` ships the knowledge files with that function so its counts are real.
- `SUPABASE_SERVICE_ROLE_KEY` and `OPTIONAL_LLM_API_KEY` are server-only. Never give them a `NEXT_PUBLIC_` name. `npm run check:env` flags that mistake.
- Set environment variables in the Vercel project settings, not in the repository.
