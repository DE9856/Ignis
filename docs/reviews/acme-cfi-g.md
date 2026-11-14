# Source check: ACME CFI-G (`knowledge/investigations/acme-cfi-g.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **one statement was not in any cited source and has been removed, with the sensor and measurement entries that depended on it.** Everything else is supported.

## Sources read

As for ACME BRE: `ntrs-20210021781` (JASMAC 2021), `ntrs-20220007191` (CSS/CI 2022), `nasa-acme-fact-sheet` (CFI-G section).

## Field check

| Field / claim                                               | Record                                                                    | Source evidence             | Result |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------- | ------ |
| Objective                                                   | observe non-premixed quasi-steady spherical cool flames on porous burners | JASMAC; CSS 2022            | Match  |
| 2012 discovery in droplet tests; droplets unsteady          | yes                                                                       | JASMAC; fact sheet          | Match  |
| Engine motivation                                           | models neglect cool-flame chemistry                                       | JASMAC; fact sheet          | Match  |
| CASIS and NSF                                               | yes                                                                       | JASMAC; fact sheet          | Match  |
| Operations                                                  | March–June 2021; June 2021–?                                              | JASMAC Table 2              | Match  |
| ACME testing complete by Feb 2022                           | yes                                                                       | CSS 2022                    | Match  |
| Not possible in 1 g or ground facilities                    | yes                                                                       | Fact sheet                  | Match  |
| Fuels                                                       | ethane, propane, n-butane; normal and inverse                             | JASMAC                      | Match  |
| Cool flame with diluted n-butane                            | yes                                                                       | JASMAC Fig. 10 caption      | Match  |
| Burner                                                      | 6.35 mm porous spherical                                                  | CSS 2022 figure label       | Match  |
| Formaldehyde-filtered intensified camera                    | yes                                                                       | JASMAC                      | Match  |
| First spherical, quasi-steady, burner-supported cool flames | yes                                                                       | CSS 2022                    | Match  |
| ~1 s dark period after radiative quench                     | yes                                                                       | CSS 2022 composite sequence | Match  |
| Cool flames significantly smaller                           | yes                                                                       | JASMAC                      | Match  |
| Significance                                                | engine efficiency and emissions                                           | CSS 2022                    | Match  |

## Edits made to the draft

1. **Sensors and Measurements:** removed "NASA reports that cool flames were also identified in thermal radiation and burner temperature data." Not found in any of the three sources (all CFI-G passages searched for radiometer, radiation, thermocouple and temperature).
2. **`sensors`:** removed "Thermopile radiometers" and "Burner thermocouple". **`measurements`:** removed "Thermal radiation" and "Burner temperature". **Variables:** dependent variables reduced to what the sources describe. These are now mentioned only as available ACME diagnostics whose use for CFI-G is not stated.

## Open for the reviewer

- If the peer-reviewed CFI-G paper reports radiometer or burner-temperature evidence of cool flames, add it as a source and restore the removed entries.
- The NASA PSI record for CFI-G was not consulted.
