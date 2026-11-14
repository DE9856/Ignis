# components/

Interface for IGNIS, grouped by screen area. Owner: Member 4 (`feat/ui`). This file is the handoff to Member 1 (H8): screen hierarchy, the component list with the props each expects, the states each covers, responsive rules and chart configuration.

Rules every component follows:

- Props are typed with `lib/` types (`Investigation`, `ScenarioAnalysis`, `RelevanceBreakdown`, `GapResult`, `RetrievedEvidence`, ...). No local copies of shared types.
- Components never load data. Scoring and gap analysis come from `lib/ranking` through `lib/integration`; components only lay out what those return.
- Missing values are a visible state: "Not reported" for a record, "Not specified" for a scenario field, "Awaiting verified NASA evidence" for an empty panel. Never blank, never a sample number.
- Status, provenance and evidence state are always text plus colour plus a shape cue.
- No percentage without a label and a path to its breakdown. Coverage is "evidence coverage", never risk.
- Colours come from the tokens in `app/globals.css`.
- Motion explains change and never delays reading a value. See [Motion](#motion).

## Screen hierarchy

| Route          | Screen in the Member 4 brief       | Top-level component                                            | Contents, top to bottom                                                                                                                                                                      |
| -------------- | ---------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`            | 1 Mission dashboard                | `dashboard/MissionDashboard`                                   | Purpose steps, degraded notice, scenario strip, most relevant investigations (score + explanation), mission evidence coverage, largest gap, research question, knowledge base, system status |
| `/scenario`    | 2 Score explanation, 5 Gap view    | `scenario/ScenarioWorkspace`                                   | Scenario form (sticky), ranked investigations with "Why this score", evidence gap view with largest gap and research question, tested condition envelopes                                    |
| `/explore`     | 3 Evidence Explorer, relationships | `experiments/EvidenceExplorer`, `experiments/RelationshipView` | Filter bar, cards or table, selected record in full beside the list (deep link `/explore#<id>`), knowledge relationships                                                                     |
| `/compare`     | 4 Investigation comparison         | `compare/ComparisonTable`                                      | Picker (2 to 4), grouped comparison with same / differs / can't tell markers, shared hardware, findings and interpretation kept apart (`/compare?ids=a,b`)                                   |
| `/evidence`    | 6 Evidence search                  | `evidence/EvidenceSearch`                                      | Question and filters, retrieved evidence cards with "Why retrieved?", optional summary bar after the evidence, refusal state                                                                 |
| `/methodology` | Provenance system                  | `evidence/ProvenanceLegend`, state badges                      | Provenance table and the evidence-state vocabulary                                                                                                                                           |
| `/dev/ui`      | (development only)                 | gallery                                                        | Every component in empty, loading, error and populated states, including the draft-contract ones. Synthetic TEST data. 404 in production                                                     |

The dashboard and the Scenario Builder share one scenario through the URL (`?oxygen=21&pressure=70&gravity=0.16&objective=prevention`), so a link reproduces a demo scenario exactly.

## Component list

### shared/

| Component                                                | Props                                                                                            | Notes                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `Badge`                                                  | `tone`, `icon` or `glyph`, `title`, children                                                     | The one badge shape. Every other badge is built on it                 |
| `StatusBadge`                                            | `status: DocumentStatus`                                                                         | `stable` reads "Human reviewed"                                       |
| `SafetyRole`                                             | `objectives: SafetyObjective[]`, `variant: "strip" \| "list"`                                    | P / D / S in fixed positions, or named chips                          |
| `Section`                                                | `title`, `description`, `eyebrow`, `meta`, `actions`, `flush`, `id`                              | Panel with header. `meta` holds a provenance badge                    |
| `EmptyState`                                             | `title` (defaults to "Awaiting verified NASA evidence"), `description`, `action`, `icon`, `size` | `size="compact"` for inside panels                                    |
| `LoadingState`, `ErrorState`, `DegradedNotice`           | as before; `DegradedNotice` dedupes repeated reasons                                             | Degraded wording comes from `lib/core/degraded.ts`                    |
| `Disclosure`                                             | `summary`, `defaultOpen`, children                                                               | Native `<details>`; every "why" path uses it                          |
| `Field`, `NumberInput`, `ToggleChip`, `SegmentedControl` | see `form-controls.tsx`                                                                          | Numeric inputs carry their unit; blank is never filled in             |
| `labels.ts`                                              |                                                                                                  | `NOT_REPORTED`, `NOT_SPECIFIED`, safety, gravity and dimension labels |

### evidence/

| Component                            | Props                                                                             | States                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `ProvenanceBadge`, `PROVENANCE_INFO` | `value: ProvenanceClass`                                                          | Labels from `getProvenanceLabel()`; meaning in the tooltip                   |
| `ProvenanceLegend`                   | `classes?`, `variant: "inline" \| "table"`                                        |                                                                              |
| `EvidenceCard`                       | `input: RetrievedEvidence \| EvidenceChunk`, `rank`, `query`, `filters`, `action` | Interpretation chunks drawn apart (violet rule)                              |
| `WhyRetrieved`                       | `result`, `query`, `filters`                                                      | Query terms in passage, chunk metadata, lexical / vector / combined scores   |
| `EvidenceSearch`                     | `synthesisAvailable`                                                              | idle, loading, unavailable, refusal, bounded answer, listing, results, error |
| `EvidenceRefusal`                    | `query`, `details?`                                                               | "The reviewed evidence does not establish this."                             |
| `BoundaryAnswer`                     | `boundary: BoundaryNotice`                                                        | Bounded answer shown first; wording from `lib/retrieval/messages.ts`         |
| `ListingSummary`                     | `listing: EvidenceListing`, `names`                                               | List questions answered from record metadata                                 |
| `SearchNotice`                       | `notice: string \| null`                                                          | Quiet operational note, e.g. keyword-only search                             |
| `GeneratedSummary`                   | `text`, `citations`                                                               | Not wired yet: synthesis is not implemented (Member 5)                       |

### scenario/ (score explanation)

| Component                                                                                  | Props                                                      | Notes                                                                                                            |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ScenarioWorkspace`                                                                        | `investigations`, `presets?: MissionScenario[]`            | Renders inside its own `<Suspense>`                                                                              |
| `ScenarioForm`, `PresetSelect`                                                             | `draft`, `errors`, `onChange`, `presets`, suggestion lists | Invalid input is reported and left out of the comparison                                                         |
| `RelevanceList`                                                                            | `analysis: ScenarioAnalysis`, `limit`, `openFirst`         | Score, factor pips, "Why this score"                                                                             |
| `ProvisionalScoreExplanation`                                                              | `scenario`, `investigation`, `result: RelevanceResult`     | Today's placeholder scorer: factor, scenario value, record value, outcome                                        |
| `ScoreBreakdown`                                                                           | `breakdown: RelevanceBreakdown`                            | Draft contract: dimension, state, weight × multiplier, contribution; relevance and direct coverage kept separate |
| `EvidenceStateBadge`, `GapStateBadge`, `FactorOutcomeBadge`, `StrengthMeter`, `FactorPips` | state values from `lib/ranking`                            | One-hue strength meter: DIRECT > RELATED > BOUNDING                                                              |

### gaps/ (evidence gap view)

| Component                 | Props                                | Notes                                                                                            |
| ------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `EvidenceGapView`         | `analysis`                           | Per factor: covers / not reported / tested outside, as counts of reviewed records                |
| `ScenarioCoverageSummary` | `analysis`                           | "k / n scenario conditions with matching reviewed evidence"                                      |
| `LargestGap`              | `analysis`, `variant`                | Ordered by coverage level until gap priority exists; lists what the reviewed corpus does contain |
| `GapCoverageBars`         | `gaps: GapResult[]`                  | Draft contract: evidence-coverage bars, state badges, largest gap by priority                    |
| `ResearchQuestionPanel`   | `question: ResearchQuestion \| null` | Labelled PROJECT-GENERATED RESEARCH QUESTION; waiting state until templates exist                |

### experiments/, compare/, dashboard/, charts/, layout/

| Component                                                                               | Props                                                  | Notes                                                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `EvidenceExplorer`                                                                      | `investigations`                                       | Selection in the URL hash; compare up to 4 from the cards                                 |
| `ExplorerFilterBar`, `applyFilters`                                                     | filters, options                                       | Ranges use three-valued containment; unreported records are counted, not silently dropped |
| `ExperimentCard`, `ExperimentTable`, `ExperimentDetail`                                 | `investigation(s)`                                     | Card: name, one-line objective, role, key conditions, review badge, source                |
| `RelationshipView`                                                                      | `investigations`, `hardware: GenericOkfDocument[]`     | Investigation → hardware → facility → role, from stated links only                        |
| `ComparisonTable`                                                                       | `investigations`                                       | Uses `buildComparisonViewModel()` for same / different                                    |
| `MissionDashboard`                                                                      | `investigations`, `presets`, `coverage`                | Renders inside its own `<Suspense>`                                                       |
| `ScenarioStrip`, `ObjectiveCoverage`, `KnowledgeStatus`, `SystemStatus`, `PurposeSteps` | see files                                              |                                                                                           |
| `ConditionEnvelope(s)`                                                                  | `analysis` or `title`, `unit`, `scenarioValue`, `rows` | Tested ranges on a shared axis with the scenario value                                    |
| `EvidenceCoverageChart`                                                                 | `data: CoverageDatum[]`                                | Recharts, see below                                                                       |
| `AppSidebar`, `AppHeader`, `NavLinks`, `PageHeader`, `BrandMark`                        |                                                        | Original mark; no agency insignia                                                         |

## States covered

Every data component handles empty ("Awaiting verified NASA evidence", or a specific reason), populated and, where it fetches, loading and error. `/dev/ui` shows them side by side. The scenario components also cover "no conditions set" and invalid input; the search covers "retrieval not available", the refusal and development mocks (labelled TEST).

## Responsive rules

Designed for a 1366 × 768 demo laptop first, then checked at 1440, tablet and 390 px phones.

- Sidebar from `lg` (1024 px); below that the header shows a scrolling nav row that keeps the current page in view.
- Content max width 84rem.
- Dashboard: scenario strip is one row at `lg` (preset + four conditions + safety goal), 3 columns at `sm`, 2 on phones. Below it, ranked list (2/3) and coverage (1/3) at `lg`, stacked below.
- Scenario Builder: form column 23rem and sticky from `xl`; results stack under the form below `xl`. Envelopes are one per row until `2xl`.
- Explorer: cards 3 / 2 / 1 columns; with a record open, list and record sit side by side from `lg` and the record is sticky; below `lg` the record opens inline under its card.
- Comparison: one aligned table from `md` with the label column pinned; 4 columns fit 1366 px without horizontal scroll. Below `md` each row becomes a block listing every investigation's value.
- Evidence cards: badges wrap under the heading on narrow screens; the why-retrieved drawer is two columns from `md`.

## Chart configuration (Recharts)

`charts/chart-theme.ts` holds the shared settings: series colours as CSS variables, `BAR_SIZE` 14 px (cap 24), a 2 px surface-coloured stroke as the gap between stacked segments, hairline solid gridlines, mono tick labels in ink tokens, a `tooltipCursor`, and a 700 ms ease-out grow on first render. `EvidenceCoverageChart` is the reference use: horizontal stacked bars, legend above, numbers printed beside it so the tooltip never gates a value. The other plots (coverage bars, envelopes, strength meters) are plain HTML so they stay crisp, accessible and theme-safe.

## Motion

GSAP 3.15 with `@gsap/react` (both pinned), plus a few CSS keyframes. Everything is skipped under `prefers-reduced-motion`, and nothing hides a value: the final state is always in the markup.

| Where                                | What moves                                                                            | How                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Every page                           | Header lines and panels rise in once, in reading order                                | CSS `[data-stagger]` (first paint, no flash)              |
| Long pages                           | Panels below the fold rise in as they are scrolled to                                 | `motion/ScrollReveal` (ScrollTrigger.batch)               |
| Coverage bars, gap bars, envelopes   | Grow out from their baseline; later value changes glide                               | CSS `[data-grow]`, `motion/GrowIn`, CSS width transitions |
| Ranked investigations                | Rows slide to their new rank when the scenario changes; scores count to the new value | `motion/useFlipList`, `motion/AnimatedNumber`             |
| Explorer cards                       | Re-flow smoothly on filter or selection; the record slides in                         | `useFlipList`, `motion/Enter`                             |
| "Why this score", "Why retrieved?"   | Panels ease open and closed                                                           | `shared/Disclosure`                                       |
| Search results, refusal, largest gap | Rise in when they change                                                              | `motion/Enter`, keyed by content                          |
| Envelope scenario marker             | Glides to the new value while typing                                                  | CSS `left` transition                                     |
| Brand mark, sidebar accent           | Ignites once on load; the accent bar draws in on navigation                           | CSS keyframes                                             |

Import GSAP only from `components/motion/gsap.ts`, which registers plugins once and sets shared timing (`MOTION`). The "no animation beyond a loading spinner" line in `docs/contribution-guide.md` predates the team's decision to use motion and should be updated by whoever owns that guide.

## Working without real records

Copy a fixture from `tests/fixtures/knowledge/investigations/` to `knowledge/investigations/zz-local-<name>.md` (git-ignored, never loaded in production), run `npm run dev`, and open the screens. `/dev/ui` shows the draft-contract components with `TEST_CONFIG` numbers. Set `NEXT_PUBLIC_IGNIS_DEV_MOCKS=1` to see the Evidence Desk with synthetic TEST passages.

## Waiting on teammates

| Waiting for                                    | What changes here                                                                                                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Member 3's methodology and Member 1's H9 types | Pass `RelevanceBreakdown` to `ScoreBreakdown` and `GapResult[]` to `GapCoverageBars` in place of the provisional components; pass a `ResearchQuestion` to `ResearchQuestionPanel` |
| Mission preset field names (open decision 4)   | Map `knowledge/missions` documents to `MissionScenario` in `app/page.tsx` (`MISSION_PRESETS`) and pass them to `ScenarioWorkspace`                                                |
| Member 5's retriever and synthesis             | Nothing for search. For synthesis, wire the "Summarise selected evidence" button and render `GeneratedSummary` after the cards                                                    |
