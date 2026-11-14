# Test fixtures

Everything in this folder is synthetic. None of it describes a real NASA investigation, and no real investigation name may be used here.

Names are deliberately artificial: `TEST_INVESTIGATION_ALPHA`, `TEST_FUEL_A`, `TEST_RIG_ONE`, `https://test.invalid/...`. Numbers are round values chosen to exercise code paths.

| Path                 | Contents                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| `knowledge/`         | A small, valid OKF knowledge base. Passes `validate:knowledge` with no errors |
| `knowledge-invalid/` | One file per structural failure the validator must catch                    |
| `index.ts`           | Paths, loaders, `TEST_SCENARIO_*` scenarios and `TEST_CHUNK_*` chunks       |

Use them in any test:

```ts
import { loadFixtureKnowledge, TEST_SCENARIO_ALPHA } from "@/tests/fixtures";
```

Validate them by hand:

```bash
npm run validate:knowledge -- tests/fixtures/knowledge
npm run validate:knowledge -- tests/fixtures/knowledge-invalid
```

| Fixture                     | Covers                                                                          |
| --------------------------- | ------------------------------------------------------------------------------- |
| `test-investigation-alpha`  | Complete record, human reviewed, interval conditions, two safety categories     |
| `test-investigation-beta`   | Partially missing record, unverified draft, unknown conditions                  |
| `test-investigation-gamma`  | Human reviewed, single-value conditions, half-open range, links to other records |
| `test-investigation-delta`  | Deprecated record, excluded everywhere                                          |
| `test-rig-one`              | Hardware record                                                                 |
| `test-concept-one`          | Concept record                                                                  |
| `test-scenario-alpha`       | Mission record with extra, not-yet-agreed fields                                |
