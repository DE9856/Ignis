# Source check: ACME BRE (`knowledge/investigations/acme-bre.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **all values and findings supported. No edits needed.** Two points for the reviewer.

## Sources read

| Source id              | What was read                                                 |
| ---------------------- | ------------------------------------------------------------- |
| `ntrs-20210021781`     | Full paper (11 pages): Stocker, JASMAC 2021                   |
| `ntrs-20220007191`     | Full presentation (12 pages): Stocker, CSS/CI 2022            |
| `nasa-acme-fact-sheet` | Full text (19 pages); BRE section, chamber insert diagnostics |

## Field check

| Field / claim                       | Record                                                                                                                             | Source evidence                                                         | Result                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Objective                           | materials flammability in still atmospheres; extinction; sustained combustion; test-method relevance                               | JASMAC §3.3; fact sheet adds "for low and partial-gravity environments" | Match                                                                |
| Fuels and emulation                 | pure or N2-diluted ethylene and methane; heats of combustion and gasification, surface temperature, smoke point                    | JASMAC §3.3                                                             | Match                                                                |
| Atmospheres                         | elevated O2, reduced pressure for future crew vehicles                                                                             | JASMAC §3.3                                                             | Match                                                                |
| ISS operations                      | Jan–Apr 2019; Jul 2020–Jan 2021                                                                                                    | JASMAC Table 2                                                          | Match                                                                |
| Constant volume, ~83 L, few minutes | yes                                                                                                                                | JASMAC §2.2                                                             | Match                                                                |
| Crew configures, Glenn commands     | yes                                                                                                                                | JASMAC §2.2                                                             | Match                                                                |
| Burns for minutes without air flow  | yes                                                                                                                                | JASMAC; CSS 2022                                                        | Match                                                                |
| Self-extinguish below ~25% O2       | yes                                                                                                                                | JASMAC: "self-extinguish in concentrations below ~25% (by volume)"      | Match                                                                |
| Larger flames out within 1.5 min    | yes                                                                                                                                | JASMAC; CSS 2022                                                        | Match                                                                |
| Methane out within a minute         | yes                                                                                                                                | JASMAC; CSS 2022                                                        | Match                                                                |
| Significance                        | fire prevention; flammability conditions; test methods                                                                             | CSS 2022                                                                | Match                                                                |
| Sensors                             | surface thermocouple; 2 heat flux transducers per BRE burner; HD color camera; thermopile radiometers; PMTs; CIR gas chromatograph | Fact sheet, chamber insert section                                      | Match (record correctly says which were used per test is not stated) |
| O2, pressure, burner size           | `null`                                                                                                                             | Not given                                                               | Correctly `null`                                                     |

## Open for the reviewer

- **Airflow is recorded as `0` m/s, not `null`.** The sources describe "still atmospheres" and flames burning "in the absence of an air flow", so 0 is stated rather than guessed. Confirm 0 is acceptable, or set it to `null` with a note.
- The fact sheet (pre-flight) gives the chamber free volume as "about 90 liters"; the 2021 paper gives "approximately 83 liters". The record uses 83, the later figure.
- The NASA PSI record for BRE was not consulted.
