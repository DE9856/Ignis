# Contribution guide

## Setup

```bash
npm install
npm run dev
```

Node.js 20.19 or newer. No environment variables are required.

## Branches

| Branch                | Member   | Primary areas                                                                                     |
| --------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `main`                | everyone | Always builds. Changes arrive by pull request only                                                |
| `feat/app-core`       | Member 1 | `app/` core, `lib/okf`, `lib/ranking`, Supabase integration, final integration                    |
| `feat/nasa-knowledge` | Member 2 | `knowledge/investigations`, `knowledge/hardware`, `knowledge/concepts`                            |
| `feat/methodology`    | Member 3 | `knowledge/missions`, ranking methodology, verification status, `docs/methodology` if added later |
| `feat/ui`             | Member 4 | `components/`, visualisation, responsive UI                                                       |
| `feat/search-rag`     | Member 5 | `lib/retrieval`, chunking scripts, Supabase vector ingestion, retrieval evaluation, QA            |

```
feature branch -> pull request -> review -> merge to main
```

Ownership means "this person knows that area best and should see changes to it", not "nobody else may touch it". If a fix in someone else's area unblocks you, make it and ask them to review.

## Working through the day

- Merge `main` into your branch often. Small, frequent merges beat one large one at the end.
- Open pull requests early and keep them small. A 50-line pull request gets reviewed in minutes.
- Before pushing: `npm run check`. CI runs the same, plus `npm run build`.
- One approval from another member, then merge with a merge commit. Do not squash: the five branches are long-lived, and squashing makes a branch conflict with itself on its next merge.
- If you change a shared type or the frontmatter schema, put "contract" in the pull request title and tell the team.

Places where two branches are likely to meet, so coordinate first:

- `lib/okf/types.ts` and `lib/okf/schema.ts` (Members 1, 2, 3, 5)
- `lib/ranking/relevance.ts` and the Methodology page (Members 1, 3)
- `app/*/page.tsx` and the components they use (Members 1, 4)
- `lib/retrieval/types.ts` and `components/evidence/*` (Members 4, 5)

## Adding a knowledge record

1. Copy `knowledge/_templates/investigation.md` to `knowledge/investigations/<id>.md`.
2. Fill in only what the source states. Leave everything else `null`.
3. List the source under `sources` with its URL and the date you read it.
4. Leave `status: draft`. Open a pull request.
5. A different person checks each value against the source, adds a `verified` entry and sets `status: stable`.

Run `npm run validate:knowledge`, or open the Evidence Explorer: a malformed file shows up in both with the reason.

Format details are in [data-contract.md](data-contract.md).

## Code conventions

- TypeScript strict. No `any` without a comment explaining why.
- Scientific fields are `T | null`. Do not add defaults for them.
- Server components by default. Add `"use client"` only where state or browser APIs are needed.
- File names are kebab-case; components are named exports in PascalCase.
- Import through the `@/` alias.
- Colours come from the tokens in `app/globals.css` (`bg-surface`, `text-ink-muted`, `border-line`). No raw hex values in components.
- Empty data uses `<EmptyState />`, which defaults to "Awaiting verified NASA evidence".
- Prettier formats everything except knowledge records. Do not hand-format.

## UI conventions

- Engineering dashboard, not a product landing page. Dense, legible, calm.
- No emojis, no glow, no decorative gradients, no animation beyond a loading spinner.
- Status and provenance are always shown as text, never by colour alone.
- Numbers use the monospace face with tabular figures and always carry a unit.
- Do not use NASA logos or insignia.

## Tests

Tests live in `tests/` and run with Vitest in a Node environment.

- Add a test when you change parsing, ranking or gap analysis.
- Test data must be obviously synthetic. Do not put real-looking NASA values in tests.
- Shared synthetic data lives in `tests/fixtures/`. Use the `TEST_...` names; never a real investigation name.
- `tests/contract/` pins shapes shared between members. If one fails, you changed a contract.
- Component tests are not set up. If they become necessary, add `jsdom` and `@testing-library/react` then.

## Commit messages

Short imperative subject, optional body explaining why.

```
Add pressure range validation to investigation schema
```

## Do not

- Commit `.env.local` or any key.
- Add scientific values without a source.
- Mark your own record as verified.
- Add dependencies without a quick word with the team.
