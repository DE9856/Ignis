---
type: Investigation
title: Burning Rate Emulator (BRE)
shortTitle: ACME BRE
program: Advanced Combustion via Microgravity Experiments (ACME), NASA Glenn Research Center
description: >-
  ACME experiment in the ISS Combustion Integrated Rack that used a flat porous burner fed with
  gaseous fuel to emulate the burning of solid and liquid materials in still microgravity
  atmospheres, including elevated-oxygen and reduced-pressure atmospheres considered for future crew
  vehicles, to study material flammability and the relevance of existing flammability tests.
status: draft

safetyCategories:
  - prevention

fuelType: gas
material: Pure or nitrogen-diluted ethylene and methane (emulating condensed fuels such as plastics)
sampleShape: Flat porous burner (dome-shaped flame)
sampleSize: null

oxygenMin: null # percent O2 by volume
oxygenMax: null
pressureMin: null # kPa
pressureMax: null
airflowMin: 0 # m/s
airflowMax: 0

gravityCondition: microgravity
gravityValue: null

platform: International Space Station
hardware:
  - Combustion Integrated Rack (CIR)
  - ACME chamber insert
  - BRE flat porous burner
sensors:
  - Burner surface thermocouple
  - Heat flux transducers (two per BRE burner)
  - High-definition color camera
  - Thermopile radiometers
  - Photomultiplier tubes (OH* and CH*)
  - CIR gas chromatograph (pre- and post-test chamber atmosphere)
measurements:
  - Heat flux to the burner (thermal feedback)
  - Burner surface temperature
  - Flame duration and self-extinction
  - Flame size
variables:
  - Fuel (ethylene or methane, pure or nitrogen-diluted)
  - Fuel flow rate (flame size)
  - Ambient oxygen concentration
  - Ambient pressure

tags:
  - combustion
  - microgravity
  - material-flammability
  - extinction
  - oxygen-concentration
  - gaseous-fuel

sources:
  - id: ntrs-20210021781
    resource: https://ntrs.nasa.gov/citations/20210021781
    title: Recent Research on Flames of Gaseous Fuel Aboard the International Space Station (Stocker, JASMAC 2021)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20220007191
    resource: https://ntrs.nasa.gov/citations/20220007191
    title: Laminar Non-Premixed Flames of Gaseous Fuel Aboard the International Space Station (Stocker, CSS/CI 2022)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: nasa-acme-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf
    title: Advanced Combustion via Microgravity Experiments (ACME) fact sheet (NASA)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/cir
    relation: uses-hardware
  - id: investigations/acme-cfi-g
    relation: shares-hardware
    note: Same ACME modular hardware in the CIR
  - id: investigations/acme-e-field
    relation: shares-hardware
    note: Same ACME modular hardware in the CIR
  - concepts/prevention
  - concepts/material-flammability-screening

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Objective

The Burning Rate Emulator (BRE) is the ACME experiment focused on spacecraft fire prevention. NASA states its objective is to improve fundamental understanding of materials flammability in still atmospheres as a function of material properties, examining extinction behaviour, the conditions needed for sustained combustion, and the relevance of existing flammability test methods for low and partial-gravity environments. A flat porous burner fed with gaseous fuel emulates the burning of solid and liquid fuels, with measurements of the thermal feedback to the burner on which condensed-fuel vaporization depends.

# Experimental Conditions

BRE ran in the Combustion Integrated Rack (CIR) on the ISS using the modular ACME chamber insert, with ISS operations in January to April 2019 and July 2020 to January 2021.

- Gravity: microgravity (ISS).
- Fuel: pure or nitrogen-diluted ethylene and methane, chosen to emulate materials such as plastics by matching the heats of combustion and gasification, surface temperature and smoke point.
- Atmosphere: NASA states testing included atmospheres with elevated oxygen concentrations and reduced pressures being considered for future crew vehicles. The specific oxygen and pressure values are not stated in the sources consulted, so those fields are null.
- Airflow: NASA describes the study as burning in still atmospheres, in the absence of an air flow; airflow is recorded as 0 m/s.
- ACME tests are constant-volume; the chamber free volume is approximately 83 liters (depending on installed hardware), and tests are typically a few minutes long.
- Tests are configured by the ISS crew but commanded from NASA Glenn.

# Variables

Independent variables described for BRE:

- Fuel: ethylene or methane, pure or diluted with nitrogen.
- Fuel flow rate, which sets flame size.
- Ambient oxygen concentration, including elevated levels.
- Ambient pressure, including reduced levels.

Dependent variables: heat flux to the burner, burner surface temperature, flame size, and whether and when the flame self-extinguishes.

# Sensors and Measurements

The ACME fact sheet states most ACME burners carry a surface thermocouple and each BRE burner has two heat flux transducers. The ACME chamber insert also provides a high-definition color camera, thermopile radiometers, photomultiplier tubes for OH* and CH* emission, and chamber pressure measurement, and the CIR gas chromatograph analyses the chamber atmosphere before and after tests. The sources consulted do not state which of these were used in each BRE test.

# Key Findings

- Low-momentum microgravity flames can burn for minutes in the absence of an air flow or flame spread (NASA summaries, 2021 and 2022).
- While flames can burn for minutes in elevated oxygen concentrations like those being considered for future spacecraft, they were found to self-extinguish in concentrations below about 25% oxygen by volume.
- Smaller flames can burn for minutes at elevated oxygen, while larger flames were generally seen to self-extinguish within 1.5 minutes.
- Ethylene flames at elevated oxygen can burn for minutes, while methane flames were seen to self-extinguish within a minute.
- NASA states the significance is spacecraft fire prevention, including microgravity flammability conditions and assessment of flammability test methods for spacecraft materials.

# Fire Safety Relevance

Team interpretation: BRE is direct evidence that a small fire in a still, unventilated microgravity atmosphere can keep burning for minutes when oxygen is elevated, which matters for exploration vehicles that may use higher oxygen and lower pressure than the ISS. The roughly 25% oxygen threshold for self-extinction in these emulated-fuel tests is relevant to setting cabin oxygen limits and to material screening. BRE uses gaseous fuels to emulate condensed materials, so its results describe emulated burning, not a specific real material. All tests were in microgravity; the stated objective mentions partial gravity, but no partial-gravity tests are reported in the sources consulted, and IGNIS does not treat BRE as direct lunar or Martian evidence.

# Limitations

- The sources consulted are NASA overview papers that report "selected findings"; detailed BRE results are in peer-reviewed papers not consulted for this draft.
- Exact oxygen concentrations and pressures tested are not stated; the "~25%" self-extinction threshold is approximate.
- Gaseous fuels (ethylene, methane) emulate condensed fuels; they are not the actual spacecraft materials.
- The flat porous burner size is not stated in the sources consulted.
- Sensor descriptions come from the ACME fact sheet, written before flight in the future tense.
- All tests were in microgravity.

# Source Notes

- ntrs-20210021781: Stocker, "Recent Research on Flames of Gaseous Fuel Aboard the International Space Station", JASMAC 2021 (NASA Glenn). Supports the objective, fuels and emulation approach, elevated-oxygen and reduced-pressure atmospheres, Table 2 operations dates, ~83 liter free volume, constant-volume procedure, and the four BRE findings.
- ntrs-20220007191: Stocker, "Laminar Non-Premixed Flames of Gaseous Fuel Aboard the International Space Station", CSS/CI meeting, May 2022 (NASA Glenn presentation). Supports the same selected findings, the significance statement, and that ACME ISS operations ran from September 2017 to February 2022 with testing complete.
- nasa-acme-fact-sheet: NASA ACME fact sheet. Supports the BRE objective (including partial gravity), the porous burner with heat flux and surface temperature feedback, two heat flux transducers per BRE burner, and the ACME diagnostics.
- The NASA PSI record for BRE was not consulted. Member 3 should check it if available.
