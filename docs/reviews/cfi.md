# Source check: CFI (`knowledge/investigations/cfi.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **all planned values supported. Three wording corrections. The record still has no flight results**, so it describes a planned investigation only.

## Sources read

| Source id              | What was read                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `grc-cfi-scr-2014`     | Full slides (17 pages): CFI Science Concept Review, NASA Glenn, May 2014            |
| `ntrs-20150023100`     | Full slides (38 pages): Urban, "NASA Microgravity Combustion Program", October 2015 |
| `iss-daily-2017-01-24` | NASA ISS Daily Summary Report, 24 January 2017                                      |

## Field check

| Field / claim                                                                             | Record                                                                                                                             | Source evidence                                                                       | Result           |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------- |
| Three objectives, objective 3 ground-only                                                 | yes                                                                                                                                | 2014 review, "Experiment Objectives – Cool Combustion, CFI"                           | Match            |
| Cool flames first seen in FLEX; prevalent; strong function of pressure, O2, diluent, fuel | yes                                                                                                                                | 2014 review                                                                           | Match            |
| Planned fuels                                                                             | n-dodecane; farnesane; dodecane mixtures with farnesane or 2,2,4,6,6-pentamethylheptane; 4-component mixture; n-heptane/iso-octane | 2014 review, "Requirements – Test Fuels" (iso-octane given as 2,2,4-trimethylpentane) | Match            |
| Planned pressure                                                                          | 0.5–3.0 atm, up to 5 desired (2014); 0.50–5.0 atm (2015)                                                                           | Both sources                                                                          | Match            |
| Planned O2 mole fraction                                                                  | 0.10–0.40                                                                                                                          | 2014 review: "similar to the range in FLEX experiments"                               | Match            |
| Diluents                                                                                  | N2, He, Xe (2014); N2 and Xe (2015)                                                                                                | Both sources                                                                          | Match            |
| Fiber                                                                                     | 80 µm to 40 µm                                                                                                                     | 2014 review                                                                           | Match            |
| Test timeline                                                                             | ~10 s; 5–10 s; 5–60 s                                                                                                              | 2014 review                                                                           | Match            |
| Cool-flame imaging                                                                        | no way to image on CIR/MDCA (2014); invisible as configured, intensified OH* camera reconfigured (2015)                            | Both sources                                                                          | Match            |
| MDCA reconfigured for CFI, 24 Jan 2017                                                    | needles, igniters, fiber arm, fuel reservoirs                                                                                      | ISS daily report                                                                      | Match            |
| Test fields (O2, pressure, airflow)                                                       | `null`                                                                                                                             | Only pre-flight requirements given                                                    | Correctly `null` |

## Edits made to the draft

1. **Planned hardware:** "larger camera fields of view" is now the source's exact change, "Increase FOV from 30 mm (FLEX) to 50 mm (CFI)". Source Notes updated to match.
2. **Sensors and Measurements:** removed "very dim" from the expected cool-flame description. The 2014 review says cool flames were expected to be "approximately ½ size of hot flame"; "very dim" in that review refers to OH* images of the _hot_ flame.
3. **Objective:** "less polluting" now follows the ISS report's wording, "more efficient and less harmful to the environment".

## Open for the reviewer

- **No CFI flight results.** A search of the NTRS API for "Cool Flame Investigation" returned nothing usable. Until a results source is found, this record only shows that CFI was planned and that the hardware was configured in January 2017. The reviewer should decide whether a planned-only record should become `stable` at all.
- The 2015 overview lists "Dodecane/iso-dodecane mixtures", which is not in the 2014 fuel list; the record's `material` covers it as "dodecane/iso-alkane mixtures".
- The NASA PSI record for CFI was not consulted.
