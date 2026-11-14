# Source check: ACME E-FIELD Flames (`knowledge/investigations/acme-e-field.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **all values and findings supported. One sentence reworded; one limitation extended.**

## Sources read

As for ACME BRE: `ntrs-20210021781` (JASMAC 2021), `ntrs-20220007191` (CSS/CI 2022), `nasa-acme-fact-sheet` (E-FIELD section and Experiment-Unique Equipment).

## Field check

| Field / claim                                       | Record                                                         | Source evidence                                                   | Result           |
| --------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------- |
| Chemi-ions, ion wind effects                        | yes                                                            | JASMAC §3.2                                                       | Match            |
| Purpose                                             | chemi-ionization; ion generation and ion-driven flows; control | JASMAC; CSS 2022                                                  | Match            |
| Operations                                          | Mar–May 2018; Sep–Nov 2018                                     | JASMAC Table 2                                                    | Match            |
| First ACME study to complete ISS testing            | yes                                                            | JASMAC: "the first study for which the ISS testing was completed" | Match            |
| Fuels and burners                                   | pure and diluted methane and ethylene; gas-jet and coflow      | JASMAC                                                            | Match            |
| Field                                               | up to 10 kV, either polarity, burner to downstream mesh        | JASMAC                                                            | Match            |
| Mesh                                                | +10 to −10 kV; ~35 or ~50 mm downstream of insulated burner    | Fact sheet                                                        | Match            |
| Ion current method                                  | voltage drop across known resistor, Ohm's law                  | Fact sheet                                                        | Match            |
| Peak ion current at most compact flame (unlike 1 g) | yes                                                            | JASMAC; CSS 2022                                                  | Match            |
| Luminosity, intensity, ion current correlated       | yes                                                            | JASMAC                                                            | Match            |
| Weak fields stabilize highly diluted flames         | yes                                                            | JASMAC                                                            | Match            |
| Soot suppressed; wide range of behaviours with soot | yes                                                            | JASMAC; CSS 2022                                                  | Match            |
| Corona and arc discharges at high field             | yes                                                            | JASMAC                                                            | Match            |
| First ACME data online via PSI                      | yes                                                            | JASMAC                                                            | Match            |
| O2, pressure, dilution, flow                        | `null`                                                         | Not given                                                         | Correctly `null` |

## Edits made to the draft

1. **Sensors and Measurements:** "Flame imaging used the ACME high-definition color camera and the analog operations camera" now says the chamber insert _provides_ those cameras. The sources describe the cameras but do not say which E-FIELD tests used them.
2. **Limitations:** added that the pre-flight fact sheet gives the chamber volume as about 90 liters versus approximately 83 liters in the 2021 paper.

## Open for the reviewer

- The `sensors` list still includes both cameras; keep them (they are part of the ACME insert) or move them to a note.
- The NASA PSI record for E-FIELD was not consulted, although the 2021 paper says its data are on PSI.
