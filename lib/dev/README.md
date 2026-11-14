# lib/dev

Development-only code: mocks and test configuration that stand in for teammate modules that are not finished yet.

Rules:

- Nothing in this folder may be imported statically by production code. Load it through `lib/integration/` behind `areDevMocksEnabled()`, with a dynamic `import()`, so a production build does not contain it.
- Mocks are off unless the build is non-production **and** `NEXT_PUBLIC_IGNIS_DEV_MOCKS=1` is set in `.env.local`.
- Everything a mock returns is synthetic and named `TEST_...`. It is never labelled as NASA evidence without that name being visible.
- `TEST_CONFIG` is not a methodology. Its numbers are arbitrary. The real one is installed by Member 3 in `lib/ranking/methodology.ts`.
