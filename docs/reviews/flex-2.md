# Source check: FLEX-2 (`knowledge/investigations/flex-2.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **one statement was not in any cited source and has been removed.** Everything else is supported.

## Sources read

| Source id                               | What was read                                    |
| --------------------------------------- | ------------------------------------------------ |
| `nasa-flex-fact-sheet`                  | Full text (5 pages); FLEX and FLEX-2 sections    |
| `researchers-guide-combustion`          | FLEX, FLEX-2 and MDCA passages, Figure 3 caption |
| ACME fact sheet (cited in Source Notes) | CFI-G section, for the 2012 cool-flame sentence  |

## Field check

| Field / claim                                                                                   | Record                                                                                                 | Source evidence                                                                                                                      | Result                                                                            |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Second in the FLEX series; mimics real combustor conditions                                     | yes                                                                                                    | Fact sheet, FLEX-2 section                                                                                                           | Match                                                                             |
| Objective: sub-buoyant flow, second droplet in a linear array, bi-component and surrogate fuels | yes                                                                                                    | Fact sheet                                                                                                                           | Match                                                                             |
| Models of real fuels for transportation and industry                                            | yes                                                                                                    | Fact sheet                                                                                                                           | Match                                                                             |
| Energy-conversion motivation                                                                    | yes                                                                                                    | Guide: "fundamental problems of energy conversion and utilization where liquid hydrocarbon fuels are a predominant source of energy" | Match                                                                             |
| Droplet size                                                                                    | 2 to 4 mm                                                                                              | Fact sheet, FLEX-2 section: "from 2 mm to 4 mm in diameter"                                                                          | Match (the fact sheet's "2 and 5 mm" sentence is in the FLEX section, not FLEX-2) |
| Single or pair of droplets; burn to completion or extinguish                                    | yes                                                                                                    | Fact sheet                                                                                                                           | Match                                                                             |
| Tethered at crossed fibers moved through quiescent gas                                          | yes                                                                                                    | Fact sheet: "placed at the intersection of two fiber crosshairs"                                                                     | Match                                                                             |
| Four test groups, 30 to 60 tests each                                                           | yes                                                                                                    | Fact sheet                                                                                                                           | Match                                                                             |
| MDCA capability                                                                                 | 1–5 mm, 0–3 atm, up to 40% O2                                                                          | Guide                                                                                                                                | Match (correctly labelled facility capability, not test conditions)               |
| Example test                                                                                    | ethanol, 30% O2, 2.4 atm                                                                               | Guide, Figure 3 caption "(Image credit: NASA, FLEX-2 experiment)"                                                                    | Match                                                                             |
| Combined FLEX/FLEX-2 findings                                                                   | radiative and diffusive extinction limits; LOI significantly lower; quasi-steady cool flames (heptane) | Guide                                                                                                                                | Match (record correctly says the guide does not separate FLEX from FLEX-2)        |
| Cool diffusion flames discovered on ISS in 2012                                                 | yes                                                                                                    | ACME fact sheet, CFI-G section                                                                                                       | Match                                                                             |
| O2, pressure, airflow                                                                           | `null`                                                                                                 | No FLEX-2 test ranges given                                                                                                          | Correctly `null`                                                                  |

## Edits made to the draft

1. **Sensors and Measurements:** removed "NASA states that FLEX-2 studies the rate and manner in which fuel is burned, the conditions necessary for soot to form, and the way a mixture of fuels evaporates before burning." None of the three sources contains it (searched for every key phrase). Replaced with what the fact sheet and guide do say.
2. **Variables:** removed "liquid-phase mixing of fuel components" from the dependent variables; it came from the same unsupported sentence.
3. **Source Notes:** the fact sheet was credited with "burning rate, soot and fuel-mixture evaporation"; corrected to what it supports. The guide note now also lists the energy-conversion motivation.

## Open for the reviewer

- The removed sentence reads like a NASA web page about FLEX-2. If the author has that page, it could be added as a source and the sentence restored.
- `ACME fact sheet` is used for one Key Finding but is not in this record's `sources` list. Add it, or move that statement.
- `sensors` is empty; no FLEX-2 diagnostics are given in the sources.
- The NASA PSI record for FLEX-2 was not consulted.
