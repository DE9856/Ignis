# Source check: SAME-R (`knowledge/investigations/same-r.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **all values and findings supported. One limitation was incomplete and has been corrected; one finding reworded closer to the source.**

## Sources read

| Source id          | What was read                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ntrs-20130000422` | Full paper (13 pages): Urban et al., AIAA 2012-3536, "Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2" |
| `nasa-fact-sheet`  | SAME fact sheet, SAME-R section                                                                                                             |

## Field check

| Field / claim                                   | Record                                                                                               | Source evidence                                                                            | Result                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------ |
| When                                            | Expedition 24, July–September 2010                                                                   | Paper abstract; fact sheet                                                                 | Match                                      |
| Builds on SAME (Expedition 15)                  | yes                                                                                                  | Paper abstract: "adding diagnostic measurements and expanding the test matrix"             | Match                                      |
| Below ignition, ~60 s heating                   | yes                                                                                                  | Paper: "heated to temperatures below the ignition point"; "approximately 60 seconds"       | Match                                      |
| Baseline temperature rule                       | 1–2 mg loss in 60 s                                                                                  | Paper, Experimental Results                                                                | Match                                      |
| Airflow                                         | 0 to 0.08 m/s; baseline 8 cm/s; down to 2 cm/s; 11 zero-flow tests                                   | Paper: "quiescent to 8 cm/s"; "down to 2 cm/s"; "examined for 11 tests"                    | Match                                      |
| Aging                                           | 11 to 1800 s                                                                                         | Paper abstract                                                                             | Match                                      |
| Materials                                       | 5 (abstract) / 6 incl. dibutyl-phthalate (results)                                                   | Paper: both lists; "Over 100 sample materials were tested"                                 | Match (conflict documented in Limitations) |
| Concentrations                                  | few million /cc; 2–15 mg/m³                                                                          | Paper                                                                                      | Match                                      |
| Instruments                                     | P-Trak, ionization chamber, DustTrak, MPASS                                                          | Paper, hardware section                                                                    | Match                                      |
| MPASS                                           | two angles, two moments                                                                              | Paper: "two angles of detection … the 3rd and 2nd moments"                                 | Match                                      |
| Shuttle and ISS detectors in duct               | yes                                                                                                  | Paper: "Also installed in the diagnostics duct were space shuttle and ISS smoke detectors" | Match                                      |
| 72 TEM samples                                  | yes                                                                                                  | Paper: "Overall, 72 particle samples were taken on … TEM grids"                            | Match                                      |
| Ground calibration                              | before flight                                                                                        | Paper: "performed on the ground before the flight"                                         | Match                                      |
| 200–400 nm; quiescent larger                    | yes                                                                                                  | Paper abstract                                                                             | Match                                      |
| Material differences                            | substantial                                                                                          | Paper conclusions                                                                          | Match                                      |
| Ionization vs light scattering; silicone rubber | yes                                                                                                  | Paper conclusions                                                                          | Match                                      |
| Zero flow 2–3× larger                           | yes                                                                                                  | Paper conclusions                                                                          | Match                                      |
| MPASS variance ≥2× lower                        | yes                                                                                                  | Paper: "decreases the relative variance by roughly a factor of at least 2"                 | Match                                      |
| Morphology                                      | liquid: lamp wick, silicone, Kapton; fractal: Teflon, Pyrell; Pyrell clusters → spheres at zero flow | Paper, TEM results                                                                         | Match                                      |
| Half the smoke lost (zero flow)                 | yes                                                                                                  | Paper                                                                                      | Match                                      |
| Silicone and DBP not visible by TEM             | yes                                                                                                  | Paper: "presumably because the particles were condensed liquid that evaporated"            | Match                                      |
| O2, pressure, sample shape and size             | `null`                                                                                               | Not given                                                                                  | Correctly `null`                           |

## Edits made to the draft

1. **Limitations, log-normal assumption:** the record said it "could not be directly tested". The paper adds "there are two indications that the distribution can be approximated" this way, and the fact sheet says later ground SMPS tests were used to check it. Both added; the SMPS results themselves are not in the cited sources.
2. **Key Findings, MPASS:** "avoiding false alarms from dust" is now "avoiding excessive false alarms from nuisance sources such as dust", matching the paper's conclusion.

## Open for the reviewer

- The fact sheet's SAME-R section describes ground comparison work (SMPS, engineering hardware) whose results are not in the record. Decide whether to add a source for them.
- `program` is `null`; neither source names a program or supporting organization for SAME-R.
- The NASA PSI record for SAME-R was not consulted.
