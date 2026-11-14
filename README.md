# IGNIS

Evidence-first exploration of NASA microgravity combustion research, connected to fire-safety scenarios for future human spaceflight.

> NASA is the source of scientific evidence. IGNIS is an independent hackathon prototype and is not an official NASA product.

## Hackathon context

Built for NASA Space Apps 2026 by a five-person team. The goal for the event is a working prototype that lets someone describe a spacecraft or habitat fire-safety scenario and see which NASA combustion investigations tested comparable conditions, and where no evidence exists.

## Status

Scaffold. The application runs, every route renders, and the data pipeline from Markdown file to screen works end to end. There is no scientific content yet: pages show "Awaiting verified NASA evidence" until records are added.

| Area                            | State                                                          |
| ------------------------------- | -------------------------------------------------------------- |
| Routes and layout               | Working shells                                                 |
| Domain types and OKF schema     | In place, aligned with the member briefs                       |
| OKF parser, loader, validator   | Working: frontmatter, sections, structural validation          |
| Relevance ranking, gap analysis | Working with placeholder rules; awaiting validated methodology |
| Provenance and trust rules      | In place, centralised                                          |
| Knowledge records               | None yet                                                       |
| Supabase                        | Schema migration and health check; no data                     |
| Chunking, embeddings, retrieval | Interfaces, contract tests and a development mock              |
| LLM synthesis                   | Not started, optional                                          |

## Architecture overview

```
knowledge/*.md            OKF records: YAML frontmatter + Markdown sections (source of truth)
      |
lib/okf                   parse -> validate (Zod) -> typed Investigation objects
      |
      +--> lib/ranking    deterministic relevance scoring and evidence-gap analysis
      |
      +--> app/, components/   pages render records, scores and gaps with provenance labels

Planned, interfaces only (lib/retrieval, lib/supabase):

OKF Markdown -> section-aware chunking -> verified chunks only
  -> BAAI/bge-small-en-v1.5 (384 dimensions) -> Supabase pgvector
  -> metadata + lexical + vector hybrid retrieval -> retrieved evidence
  -> optional grounded synthesis
```

The Markdown files are canonical. Supabase, when added, is a derived index that can be rebuilt from them. More detail in [docs/architecture.md](docs/architecture.md).

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS, Lucide React, Recharts
- Zod and gray-matter for knowledge records
- Supabase JS client (PostgreSQL + pgvector, planned)
- Vitest, ESLint, Prettier

No LangChain, no ORM, no state-management library, no component framework, no authentication, no containers.

## Getting started

Requires Node.js 20.19 or newer (22 recommended, see `.nvmrc`).

```bash
git clone <repository-url>
cd ignis
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are needed.

| Command                      | What it does                                        |
| ---------------------------- | --------------------------------------------------- |
| `npm run dev`                | Development server                                  |
| `npm run check`              | Format, lint, types, tests and knowledge validation |
| `npm run check:ci`           | `check` plus a production build                     |
| `npm run validate:knowledge` | Structural validation of the knowledge base         |
| `npm run inspect:knowledge`  | Progress statistics for the knowledge base          |
| `npm run check:env`          | Which environment variables are usable              |
| `npm run check:db`           | Is Supabase reachable and the schema in place       |

All commands, the post-knowledge-merge checklist and the diagnostics pages are in [docs/development.md](docs/development.md).

## Environment variables

Copy `.env.example` to `.env.local`. All are optional; without them the app reads local knowledge files and the dashboard reports Supabase as not configured.

| Variable                        | Used for                                     |
| ------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe)             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only key for ingestion scripts        |
| `OPTIONAL_LLM_API_KEY`          | Optional grounded synthesis, not implemented |

Never commit real keys. `.env*` is git-ignored except `.env.example`.

## Project structure

```
app/            Routes: / /explore /scenario /compare /evidence /methodology /about
components/     UI by area: layout, dashboard, experiments, scenario, compare, evidence, charts, shared
lib/okf/        Domain types, Zod schema, parser, loader, validation
lib/ranking/    Relevance scoring, gap analysis, methodology configuration
lib/retrieval/  Retrieval interfaces and placeholder
lib/supabase/   Optional clients, database types, health check
lib/core/       Environment, capabilities, degraded states, typed errors
lib/domain/     Provenance rules, unit conversion
lib/integration/ View models and adapters between modules
lib/dev/        Development-only mocks and test configuration
lib/utils/      Class-name and number helpers
supabase/       Database migrations
knowledge/      OKF records: investigations, hardware, concepts, missions
data/           Generated artefacts (git-ignored)
scripts/        Knowledge validation and inspection, environment and database checks
tests/          Unit, contract and integration tests; synthetic fixtures
docs/           Architecture, data contract, retrieval contract, development, team handoff
```

## Development workflow

1. Pull `main`, then work on your feature branch.
2. Keep changes small. Run `npm run check` before pushing.
3. Open a pull request to `main`. CI runs the same checks plus a build.
4. One other team member reviews. Merge when green, with a merge commit.

Details and conventions are in [docs/contribution-guide.md](docs/contribution-guide.md).

## Branching strategy

```
feature branch -> pull request -> review -> merge to main
```

`main` always builds. Nobody pushes to it directly.

| Branch                | Member   | Primary areas                                                                                     |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `feat/app-core`       | Member 1 | `app/` core, `lib/okf`, `lib/ranking`, `lib/supabase`, final integration                          |
| `feat/nasa-knowledge` | Member 2 | `knowledge/investigations`, `knowledge/hardware`, `knowledge/concepts`                            |
| `feat/methodology`    | Member 3 | `knowledge/missions`, ranking methodology, verification status, `docs/methodology` if added later |
| `feat/ui`             | Member 4 | `components/`, visualisation, responsive UI                                                       |
| `feat/search-rag`     | Member 5 | `lib/retrieval`, chunking scripts, Supabase vector ingestion, retrieval evaluation, QA            |

These are primary areas, not fences. Anyone can change anything through a pull request; if you touch someone else's area, ask them to review it.

## Scientific integrity rules

1. NASA is the source of scientific evidence. Every scientific statement traces to a cited NASA source.
2. Never invent data. No sample numbers, no plausible placeholders, no "typical" values.
3. Missing means `null`. The UI shows "Unknown" or "Awaiting verified NASA evidence".
4. A record is `draft` until a second person checks it against the source, adds a `verified` entry and sets it to `stable`.
5. Only `stable`, human-reviewed records feed ranking and retrieval by default.
6. Every piece of content carries a provenance label: `NASA_SOURCE`, `HUMAN_REVIEWED`, `COMPUTED`, `TEAM_INTERPRETATION`, `GENERATED_SUMMARY` or `UNVERIFIED`.
7. Team interpretation is labelled as such and kept separate from what the source says.
8. No NASA logos or insignia, and nothing that implies NASA endorsement.

## AI-use principles

- AI tools may help write code, and helped generate this scaffold. People review what gets merged.
- AI output is never a scientific source. Records are curated and verified by people from NASA material.
- Ranking and gap analysis are deterministic and use no language model.
- Any generated summary must be built only from retrieved, verified passages, shown with its sources, and labelled `GENERATED_SUMMARY`.
- AI use is disclosed on the Methodology page and in the project submission.

## License

MIT. See [LICENSE](LICENSE). NASA source material keeps its own terms; cite it, do not relicense it.
