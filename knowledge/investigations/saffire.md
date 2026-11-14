---
type: Investigation
title: Spacecraft Fire Safety Demonstration (Saffire)
shortTitle: Saffire
program: NASA Spacecraft Fire Safety Demonstration Project
description: >-
  Series of six large-scale fire experiments (Saffire I to VI) conducted inside uncrewed Cygnus
  cargo vehicles after they left the ISS, burning large fabric and PMMA samples in a flow unit to
  measure flame spread, heat release, and the effect of a fire on spacecraft temperature, pressure,
  carbon dioxide, carbon monoxide and smoke.
status: stable

safetyCategories:
  - prevention
  - detection
  - suppression

fuelType: solid
material: >-
  SIBAL fabric (75% cotton, 25% fiberglass); cotton jersey; cast PMMA (one-sided 5 mm thick,
  two-sided 10 mm thick, and a ribbed PMMA sample on Saffire V); Nomex fabric; silicone sheets
  (Saffire II)
sampleShape: Large flat sheets and slabs mounted on a sample card in a flow duct
sampleSize: >-
  Saffire I and III SIBAL samples 41 cm wide by 94 cm long; Saffire II samples 5 cm wide by 29 cm
  long; Saffire IV and V samples 40 to 41 cm wide, 18 to 50 cm long; Saffire VI samples all
  41 cm wide, with cotton/fiberglass 50 cm long, PMMA 18 cm long, Nomex 7 cm long

oxygenMin: 21 # percent O2 by volume
oxygenMax: 31
pressureMin: 54.1 # kPa
pressureMax: 100
airflowMin: 0.2 # m/s
airflowMax: 0.3

gravityCondition: microgravity
gravityValue: null

platform: Uncrewed Northrop Grumman (formerly Orbital ATK) Cygnus cargo vehicle, after departure from the ISS
hardware:
  - Saffire Flow Unit (SFU)
  - Far Field Diagnostics (FFD) unit with smoke cleanup system
sensors:
  - Front-view and side-view cameras
  - Radiometer
  - Vane anemometer
  - Inlet and outlet oxygen, carbon dioxide and carbon monoxide sensors
  - Remote sensors with thermocouple and carbon dioxide sensor
  - Ionization smoke detector
  - Light-scattering particulate monitor
measurements:
  - Flame spread and flame growth
  - Heat release rate (oxygen consumption calorimetry and fuel consumption)
  - Spacecraft temperature and pressure rise
  - Carbon dioxide and carbon monoxide concentration increase
  - Smoke concentration and smoke detector response
variables:
  - Sample material and thickness
  - Ambient pressure (spacecraft vented and backfilled with oxygen)
  - Oxygen concentration
  - Air flow speed in the flow duct
  - Flow direction relative to spread (concurrent; opposed for some samples)

tags:
  - combustion
  - microgravity
  - large-scale-fire
  - solid-material
  - flame-spread
  - heat-release
  - combustion-products
  - smoke-detection

sources:
  - id: ntrs-20210011521
    resource: https://ntrs.nasa.gov/citations/20210011521
    title: >-
      Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large
      Scale Spacecraft Fires (Urban et al., ICES-2021-266)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20240002981
    resource: https://ntrs.nasa.gov/citations/20240002981
    title: Preliminary Results from the Saffire VI Experiment (Urban et al., ICES-2024-365)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: nasa-release-2016
    resource: https://www.nasa.gov/news-release/nasa-glenn-successfully-ignites-largest-fire-experiment-in-space/
    title: NASA Glenn Successfully Ignites Largest Fire Experiment in Space (NASA release 16-021, June 2016)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: nasa-saffire-v-2021
    resource: https://www.nasa.gov/humans-in-space/saffire-ignites-new-discoveries-in-space/
    title: Saffire Ignites New Discoveries in Space (NASA, January 2021)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: nasa-saffire-vi-2024
    resource: https://www.nasa.gov/centers-and-facilities/glenn/flame-burns-out-on-nasas-long-running-spacecraft-fire-experiment/
    title: Flame Burns Out on NASA's Long-Running Spacecraft Fire Experiment (NASA, February 2024)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: psi-98
    resource: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-98"
    title: NASA PSI investigation record PSI-98 (Saffire-I)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: psi-99
    resource: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-99"
    title: NASA PSI investigation record PSI-99 (Saffire-II)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: psi-100
    resource: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-100"
    title: NASA PSI investigation record PSI-100 (Saffire-III)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: investigations/bass
    relation: shares-fuel
    note: Both burned SIBAL cotton-fiberglass fabric and PMMA; BASS at centimetre scale in the MSG, Saffire at large scale in Cygnus
  - id: investigations/same
    relation: shares-measurement
    note: Both address spacecraft smoke detection; Saffire measured smoke and detector response from a real fire
  - concepts/prevention
  - concepts/detection
  - concepts/suppression
  - concepts/flame-spread
  - concepts/smoke-detection

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified:
  - by: human:member3
    at: 2026-11-14
    note: "Scope: all. Checked against the cited NASA sources, using the docs/reviews source-check report."
---

# Objective

Saffire (Spacecraft Fire Safety Demonstration) was a NASA series of six large-scale fire experiments conducted inside uncrewed Cygnus cargo vehicles after they departed the International Space Station. NASA states that the lack of experimental data on spacecraft fire behaviour at practical length scales and geometries has forced spacecraft designers to base designs and safety precautions on 1-g understanding of flame spread, flame self-extinguishment, fire detection and suppression, and that the project was formulated to conduct large-scale experiments in spacecraft environments that represent practical spacecraft fires. A major goal of the final flight, Saffire VI, was to compare the heat and pressure rise from a spacecraft fire with the release of hazardous products (carbon monoxide and carbon dioxide).

# Experimental Conditions

All Saffire burns took place in microgravity inside an uncrewed Cygnus vehicle in orbit after it had left the ISS; no crew was aboard.

- Saffire I launched to the ISS in a Cygnus on March 22, 2016 and its burn took place after the vehicle departed the station on June 14, 2016. The module was 3 feet by 3 feet by 5 feet tall and the sample was approximately 16 inches wide and 37 inches long. Saffire IV and V flew in May 2020 (NG-13) and January 2021 (NG-14).
- Saffire I to III, per the NASA PSI records (which take precedence over the IV/V paper where they differ): Saffire I burned two SIBAL samples (one concurrent, one opposed) at 20 cm/s and about 21.5 to 21.7% O2 (PSI-98); Saffire II burned nine 5 cm wide samples of silicone, SIBAL, PMMA and a PMMA/Nomex combination at 20 cm/s and about 21.5 to 22.1% O2 (PSI-99); Saffire III burned SIBAL at 30 cm/s, concurrent or opposed (PSI-100). Table 2 of the IV/V paper lists 21% O2, 100 kPa and a 46 cm high duct for I to III; PSI gives no pressure for these flights.
- Saffire IV and V (Table 1 of the IV/V paper): IV-1 and IV-2 at 100.0 kPa and 22.0 mol% O2; V-2, V-3 and V-4 at 70.7 to 72.6 kPa and 25.4 to 26.2 mol% O2; all at 20 cm/s (four concurrent, one opposed). Free volume 17.9 m3 (IV) and 19.0 m3 (V).
- For Saffire IV to VI the tests were conducted in a rectangular flow tunnel 30 cm high by 45 cm wide by 109 cm long, with a fan in the inlet duct and a vane anemometer at the inlet.
- Spacecraft atmosphere: before testing, the Cygnus was vented to a requested pressure and Saffire released oxygen to bring the vehicle to the desired condition. Across the tests tabulated in the two papers and the PSI records, ambient pressure ranged from 54.1 to 100 kPa and oxygen from 21 to 31 percent (mol%, treated as volume percent for a gas mixture). These ranges are used in the frontmatter.
- Airflow: the test flow speeds were 20 cm/s (Saffire I, II and IV to VI) and 30 cm/s (Saffire III, per PSI-100); the frontmatter range (0.2 to 0.3 m/s) covers these test conditions only. In some tests the flow was later reduced to 5 cm/s or stopped as part of the extinction sequence (IV-2, V-2, V-3, V-4, VI-3); these phases are described under Key Findings and are not part of the frontmatter range.
- Free air volume in the vehicle was 16.7 to 19.0 m3 for the tabulated tests; the fires spanned 1.5 to 3.2 kW.
- Saffire VI samples were all 41 cm wide: SIBAL cotton/fiberglass fabric 50 cm long, two-sided PMMA 1 cm thick and 18 cm long, one-sided PMMA 0.5 cm thick and 18 cm long, and Nomex fabric 7 cm long.

# Variables

Independent variables reported across the Saffire flights:

- Sample material and thickness (SIBAL fabric, cotton jersey, one-sided and two-sided PMMA, ribbed PMMA, Nomex).
- Ambient pressure and oxygen concentration, set by venting the vehicle and backfilling with oxygen.
- Air flow speed in the flow duct (for example 20 cm/s reduced to 5 cm/s in test VI-3).
- Flow direction relative to flame spread (concurrent in most tests; opposed in Saffire I sample 2, Saffire II sample 2-4, some Saffire III tests and Saffire V-4).

Dependent variables: flame growth and spread, heat release rate, spacecraft temperature and pressure rise, increases in carbon dioxide and carbon monoxide concentration, and smoke concentration and detector response.

# Sensors and Measurements

For Saffire IV to VI the Saffire Flow Unit carried front-view and side-view cameras, a radiometer, a vane anemometer, and gas sensors at the inlet and outlet measuring oxygen, carbon dioxide and carbon monoxide. On Saffire VI the outlet gas sensor was placed at a verified mixed location so that heat release could be measured by oxygen consumption calorimetry (13.1 kJ per gram of oxygen consumed, per Huggett's method). Six remote sensors, each with a thermocouple and a carbon dioxide sensor, were placed around the vehicle. A Far Field Diagnostics unit near the hatch contained aerosol and species diagnostics, a smoke cleanup system, an ionization smoke detector and a light-scattering particulate monitor.

# Key Findings

- Practical-scale fires of 1.5 to 3.2 kW were tested in uncrewed spacecraft with free air volumes of 17 to 19 cubic meters; despite these fires, temperature increased significantly only very near the fire itself (Saffire VI paper).
- Ambient carbon monoxide and carbon dioxide rose significantly; the PMMA tests on Saffire VI exceeded the 1-hour carbon dioxide limit and the 24-hour carbon monoxide limit.
- Smoke was readily detected by an ionization detector and a light-scattering system, but a typical alarm threshold (1 mg/m3 selected by the authors) was only reached at 981 seconds in test VI-3, by which time most of the hazardous gas release had occurred.
- The authors conclude that the human hazard from a fire in a spacecraft is very similar to terrestrial fires: heat is not the principal hazard, and smoke and gaseous products are a much greater concern.
- The SIBAL fabric sample reached a steady size and spread rate quite rapidly, whereas the two PMMA samples grew continuously until the flow speed was reduced.
- The Nomex sample on Saffire VI did not ignite.
- On Saffire II, the four silicone samples showed insignificant burning in microgravity, while in the 1-g comparison tests two burned completely, one burned 7.6 cm and one did not burn (PSI-99). The Nomex portion of the PMMA/Nomex sample was not ignited.
- Earlier flights showed that, under typical spacecraft conditions, fires can develop to significant size, and that average temperature and pressure rise were not of particular concern while the increase in carbon monoxide and carbon dioxide was enough to be a health concern (as summarised in the Saffire VI paper).
- On Saffire V, NASA reports that a ribbed PMMA sample burned faster on the thinner ribs and that elevated oxygen levels produced more energetic flames.
- Saffire IV and V fires had heat release rates up to 10 kW and a measurable impact on vehicle pressure, temperature and carbon dioxide, but average vehicle conditions did not rise to unacceptable levels (IV/V paper abstract).
- Extinguishment of thin charring fuels at increased oxygen, and of bubbling polymers, cannot be assumed to occur rapidly in quiescent conditions: a cotton sample (V-2) regrew after 70 s with the fan off, and a two-sided PMMA sample (IV-2) kept burning through a 15 s no-flow interval (IV/V paper).
- On Saffire V an extinction approach was tested: instead of stopping the flow abruptly, the air flow was reduced to 5 cm/s and held for 300 s, after which the samples extinguished immediately when the fan was turned off (V-3, V-4). The authors note this would carry other risks as an extinguishment strategy given uncertain spacecraft flow configurations.
- Overheated materials in quiescent or low-flow zones produced stratified fuel mixtures that caused strong deflagrations during ignition (IV-2, V-4).
- Flames reached nearly steady lengths in all configurations (concurrent and opposed, thin and thick fuels), unlike upward spread in normal gravity; on thick PMMA in concurrent flow, flames stayed pinned at the leading edge and advanced only by surface regression.
- Thick-fuel flame growth was dissimilar from NASA-STD-6001 Test 1; the authors state this does not invalidate the test but affects interpretation of its results. In one case a flame jumped a 4.5 cm gap to ignite a previously warmed PMMA surface.

# Fire Safety Relevance

Team interpretation: Saffire is the only investigation in this knowledge base that burned spacecraft-relevant materials at a large, practical scale inside a real spacecraft volume. Its evidence points to combustion products (carbon monoxide, carbon dioxide, smoke) rather than heat or pressure as the main crew hazard from a moderate cabin fire, and to the possibility that a smoke alarm threshold may be reached only after much of the hazardous gas has been released. This is relevant to detection (sensor choice, placement and thresholds), to prevention (material selection in elevated-oxygen, reduced-pressure exploration atmospheres) and to suppression and post-fire response (shutting off ventilation did not reliably extinguish thin charring fuels or bubbling polymers, and low-flow zones allowed fuel vapour to accumulate and deflagrate). The tests were in microgravity; the authors state further work is needed to extend the results to the partial gravity of the Moon and Mars, and IGNIS does not treat Saffire as direct lunar or Martian evidence.

# Limitations

- Both quantitative sources are preliminary conference papers (ICES-2021 and ICES-2024), not final reports.
- The pressure, oxygen and airflow ranges in this record cover only the tests tabulated in those papers and the PSI records (Saffire I to V and VI-2, VI-3, VI-4). Conditions for other Saffire VI runs are not stated in the sources consulted.
- The Saffire VI news article reports 19 Saffire VI runs, while the Saffire VI paper describes a sample card configured for four ignitions; the sources do not explain the difference.
- Conflicts between the PSI records and Table 2 of the IV/V paper were resolved in favour of PSI: Saffire II sample 6 airflow (PSI 20 cm/s, paper 25 cm/s), Saffire III airflow (PSI 30 cm/s, paper 25 cm/s), Saffire II sample length (PSI 29 cm, paper 30 cm), and Saffire I and II oxygen (PSI about 21.5 to 22.1%, paper 21%). The oxygen minimum of 21% comes from the paper's Saffire III value, for which PSI gives no number.
- PSI-98 lists the Saffire I sample as 40.6 cm long by 94 cm wide; the NASA release and the IV/V paper give about 94 cm long by 41 cm wide, so the PSI columns appear to be swapped. PSI-98 also lists investigation dates of 2001 to 2008, which do not match the 2016 flight.
- Suppression evidence is limited to ventilation-based extinction (reducing or stopping the air flow). No suppressant agent was tested in the sources consulted.
- Fire size is reported differently: the IV/V paper abstract states heat release rates up to 10 kW, while the Saffire VI paper states the tests it considers spanned 1.5 to 3.2 kW (its Table 2 peak is 3,217 W). Both are kept with their scope.
- Duct height: the IV/V paper text says the duct height was reduced from 25 cm to 15 cm, while its Table 2 lists 46 cm (I to III) and 30 cm (IV, V). The Saffire VI paper clarifies that these are half-heights (25 cm for I to III, 15 cm for IV to VI), which matches the 30 cm tunnel for IV to VI; the 46 cm versus 50 cm difference for I to III is not explained.
- On Saffire IV and V the outlet gas sensor was not at a fully mixed location, so those gas measurements were not useful and heat release for the thick PMMA samples was not determined on those flights.
- The 1 mg/m3 smoke alarm threshold was selected by the authors for analysis; it is not stated to be a flight system setting.
- Carbon dioxide scrubbing occurred only twice across the Saffire flights and carbon monoxide removal was limited, so reported concentration increases are per-test increases in the vehicle average.
- All burns were in microgravity in an uncrewed vehicle; no partial-gravity tests were made.
- Saffire II and III results in this record come only from the PSI experimental tables and Table 2 of the IV/V paper; the PSI Experimental Details files were not read.
- No PSI records for Saffire IV to VI were found in this review.

# Source Notes

- ntrs-20240002981: Urban, Ruff, Ferkul and others, "Preliminary Results from the Saffire VI Experiment", ICES-2024-365, July 2024 (NASA Glenn lead authors). Supports the objective, flow tunnel dimensions, sensors, Table 1 test conditions (pressure, oxygen, airflow, free volume), Table 2 heat release and gas increases, the 981 s alarm result, and the conclusions used in Key Findings.
- nasa-release-2016: NASA release 16-021 (June 15, 2016). Supports Saffire I launch and burn dates, the 3 ft by 3 ft by 5 ft module, the approximately 16 in by 37 in sample, and the planned Saffire II and III objectives.
- nasa-saffire-v-2021: NASA article (January 19, 2021). Supports the ribbed PMMA sample on Saffire V, venting and oxygen backfill, and the statements on thinner ribs and more energetic flames at elevated oxygen.
- nasa-saffire-vi-2024: NASA article (February 14, 2024). Supports Saffire VI launch (August 2023), conclusion (January 9, 2024), 19 Saffire VI runs, and the materials list.
- ntrs-20210011521: Urban, Ruff, Ferkul and others, "Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires", ICES-2021-266, July 2021 (NASA Glenn lead authors). Supports Table 1 (IV/V conditions), Table 2 (I to V thin-sample conditions and flame sizes), sample dimensions, the up-to-10 kW heat release statement, and the Summary of Results used in Key Findings (extinguishment, ignition deflagration, steady flame lengths, NASA-STD-6001 Test 1, 4.5 cm gap).
- psi-98: NASA PSI record for Saffire-I. Supports the two Saffire I samples (concurrent and opposed), 20 cm/s, about 21.5 to 21.7% O2, 0.37 cm SIBAL thickness, and the objectives (large-scale fire growth and low-g flammability limits compared with NASA's 1-g screening test).
- psi-99: NASA PSI record for Saffire-II. Supports the nine 5 cm wide samples (silicone, SIBAL, PMMA, PMMA/Nomex), 20 cm/s, about 21.5 to 22.1% O2 (derived from measured CO2 production), and the microgravity versus 1-g burn results.
- psi-100: NASA PSI record for Saffire-III. Supports the SIBAL sample material and the 30 cm/s concurrent or opposed flow.
