# Source check: SPICE (`knowledge/investigations/spice.md`)

- Checked by: `llm:claude-opus-5-5`, 2026-11-14. Not a verification (see `README.md`).
- Record status: `draft`. Author: `human:member2`.
- Result: **all claims supported by the cited sources. No wrong values found.** Two small edits made.

## Sources read

| Source id                      | What was read                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `nasa-spice-fact-sheet`        | Full text (2 pages)                                                                  |
| `ntrs-20090014827`             | NTRS abstract and the full 4-page investigation summary PDF (last update 02/17/2009) |
| `researchers-guide-combustion` | Full text; the SPICE passages on the guide's history and program pages               |

## Field check

| Field / claim                                     | Record                                              | Source evidence                                                                                                                          | Result           |
| ------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Supporting organization                           | ESMD                                                | Summary: "Supporting Organization: Exploration Systems Mission Directorate (ESMD)"                                                       | Match            |
| Platform                                          | ISS, Increments 18 to 20                            | Summary: "Increment(s) Assigned: 18, 19, 20"                                                                                             | Match            |
| Expedition 18 image                               | yes                                                 | Summary: image ISS018E026974, "during Expedition 18"                                                                                     | Match            |
| Year conducted                                    | 2009                                                | Guide: "was conducted in 2009 on the ISS in its Microgravity Science Glovebox"                                                           | Match            |
| Hardware                                          | MSG; flow duct with igniter and nozzles             | Summary: "a small flow duct with an igniter and a small nozzle. Outside the flow duct are 2 cameras, the fuel supply bottle…"            | Match            |
| Fan-driven co-flow                                | yes                                                 | Guide: "ELF and SPICE flames were within fan-driven flow ducts"                                                                          | Match            |
| Sensors                                           | video with data overlay; high-res still camera      | Summary: "sensor data overlaid on the video image"; "After triggering the high resolution camera"                                        | Match            |
| Crew procedure                                    | set burner and air flow, adjust fuel to smoke point | Summary, Operational Protocols                                                                                                           | Match            |
| Test plan                                         | 6 fuels, 3 burner tubes, 54 points                  | Summary: "Six test sequences covering six different fuels with three different burner tubes, for a total of fifty-four (54) test points" | Match            |
| Tests completed                                   | 250                                                 | Fact sheet: "completed 250 combustion tests"                                                                                             | Match            |
| Fuels named                                       | propylene, propane, ethylene                        | Fact sheet, Science Results                                                                                                              | Match            |
| Smoke points                                      | more than 70                                        | Fact sheet: "more than 70 smoke points"                                                                                                  | Match            |
| LSP heritage                                      | STS-94                                              | Fact sheet and summary                                                                                                                   | Match            |
| LSP quiescent finding                             | very different from 1 g                             | Summary: "onset of the microgravity smoke point in a quiescent environment is very different from that seen in normal gravity"           | Match            |
| Soot and heat; materials selection                | as stated                                           | Fact sheet, Research Overview and Space Applications                                                                                     | Match            |
| O2, pressure, airflow, nozzle size, gravity value | `null`                                              | No cited source gives values                                                                                                             | Correctly `null` |

## Edits made to the draft

1. **Objective:** added the stated objective to "measure the temperature field to verify flame structure predictions" (fact sheet and summary). It was missing.
2. **Limitations:** the 54-versus-250 note now cites the summary's "Periodic repeat points are desired if time is available", and a new item says no source reports the temperature results.

## Open for the reviewer

- The record's note that the MSG "normally operates with ISS air" is supported by the guide, but that sentence is in the guide's BASS passage, not a SPICE one. Decide whether it is acceptable for SPICE or should be dropped.
- The NASA PSI record for SPICE was not consulted (the PSI site was not readable from here).
