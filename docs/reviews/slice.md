# Source check: SLICE (`knowledge/investigations/slice.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **all values and findings supported. One finding reworded because it overstated the paper; one finding added.**

## Sources read

| Source id                      | What was read                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `ntrs-20140017780`             | Full paper (21 pages): Ma et al., soot formation in a coflow jet flame, microgravity vs normal gravity |
| `researchers-guide-combustion` | SLICE passages                                                                                         |

## Field check

| Field / claim                  | Record                                          | Source evidence                                                                                                                                            | Result           |
| ------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Completed                      | March 2012, crew Donald Pettit, MSG             | Paper abstract and introduction                                                                                                                            | Match            |
| 1 g tests                      | replica hardware at Yale                        | Paper: "using a replica of the SLICE flight hardware (namely, the engineering and training hardware)"                                                      | Match            |
| ELF heritage                   | STS-87                                          | Paper, section 2                                                                                                                                           | Match            |
| Duct                           | 76 mm × 76 mm, rounded corners, 174 mm tall     | Paper, section 2                                                                                                                                           | Match            |
| Nozzles                        | 0.41, 0.77, 1.59, 2.14, 3.23 mm ID              | Paper, section 2                                                                                                                                           | Match            |
| Fuels                          | 100/70/40% CH4, 100/20% C2H4, N2-diluted        | Paper, section 2                                                                                                                                           | Match            |
| Fuel flow                      | 0–500 sccm N2-equivalent                        | Paper: "0-500 sccm N 2 equivalent flow"                                                                                                                    | Match            |
| Coflow                         | DC fan, honeycomb, mesh; varied by fan voltage  | Paper, section 2                                                                                                                                           | Match            |
| Example test                   | 46 cm/s fuel, 18 cm/s coflow, 3.23 mm, 100% CH4 | Paper, section 5                                                                                                                                           | Match            |
| Video overlay                  | fuel flow, fan setting, anemometer, timer       | Paper, diagnostics                                                                                                                                         | Match            |
| Still camera                   | Nikon D300s, BG-7 filter                        | Paper: "Nikon D300s … 2 mm BG-7 filter"                                                                                                                    | Match            |
| Soot volume fraction method    | S-type thermocouple light calibration           | Paper                                                                                                                                                      | Match            |
| Anemometer                     | omni-directional hot-sphere                     | Paper                                                                                                                                                      | Match            |
| Soot increase                  | factor ~4 to 8 (100% CH4)                       | Paper: "increase by a factor of approximately 4 to 8 bounded by the uncertainty in soot dispersion exponent"                                               | Match            |
| Soot shift                     | centerline to wings                             | Paper abstract                                                                                                                                             | Match            |
| Lower µg temperature           | soot loading and radiative loss                 | Paper conclusions                                                                                                                                          | Match            |
| Objective, CLD Flame precursor | as stated                                       | Guide: "twin purposes … increased fuel efficiency and reduced pollutant emission"; "precursor to the CLD Flame experiment"                                 | Match            |
| Coflow caveats                 | profiles may differ; not perfectly symmetric    | Paper: "the coflow near the fuel nozzle is not perfectly symmetric"; flight and engineering units "very similar" but velocity-profile differences possible | Match            |
| O2, pressure, coflow range     | `null`                                          | Not given                                                                                                                                                  | Correctly `null` |

## Edits made to the draft

1. **Key Findings, computations:** was "underestimated soot volume fraction, especially in microgravity". The paper says the 1 g prediction "has the same order of magnitude as the measured value" and the computation "does not capture the dramatic increase" in microgravity. Reworded to match.
2. **Key Findings, temperature:** added the paper's "peak soot temperature in µg is shown to be ~200 K lower than its 1 g counterpart".

## Open for the reviewer

- The paper's conclusions also say "peak soot volume fraction increased by a factor of ~8" while the results section gives "approximately 4 to 8". The record uses the range; confirm that's the right one to cite.
- The NASA PSI record for SLICE was not consulted.
