---
type: Investigation
title: Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames)
shortTitle: ACME E-FIELD Flames
program: Advanced Combustion via Microgravity Experiments (ACME), NASA Glenn Research Center
description: >-
  ACME experiment in the ISS Combustion Integrated Rack that applied electric fields of up to 10 kV
  between the burner and a downstream mesh to gas-jet and coflow flames of methane and ethylene, to
  study flame ion production and how ions can be used to control non-premixed flames.
status: stable

safetyCategories: []

fuelType: gas
material: Pure and diluted methane and ethylene
sampleShape: Gas-jet and coflow burners
sampleSize: null

oxygenMin: null # percent O2 by volume
oxygenMax: null
pressureMin: null # kPa
pressureMax: null
airflowMin: null # m/s
airflowMax: null

gravityCondition: microgravity
gravityValue: null

platform: International Space Station
hardware:
  - Combustion Integrated Rack (CIR)
  - ACME chamber insert
  - High-voltage supply and electrode mesh (+10 to -10 kV)
sensors:
  - Ion current measurement (voltage drop across a known resistor)
  - High-definition color camera
  - Analog color camera
measurements:
  - Ion current through the flame
  - Flame size and shape response to electric forcing
  - Flame luminosity
variables:
  - Electric field strength and polarity
  - Fuel (methane or ethylene)
  - Fuel dilution
  - Burner configuration (gas jet or coflow)

tags:
  - combustion
  - microgravity
  - electric-field
  - ion-current
  - soot
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
    title: Advanced Combustion via Microgravity Experiments (ACME) fact sheet (NASA; E-FIELD Flames section)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/cir
    relation: uses-hardware
  - id: investigations/acme-bre
    relation: shares-hardware
    note: Same ACME modular hardware in the CIR
  - id: investigations/acme-cfi-g
    relation: shares-hardware
    note: Same ACME modular hardware in the CIR

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

E-FIELD Flames studied how electric fields affect non-premixed flames in microgravity. NASA states that an electric field can strongly influence flames through its effect on chemi-ions produced by combustion, and that direct ion transport and the induced ion wind can modify flame shape, alter soot or flammability limits, direct heat transfer and reduce pollutant emission. The experiment's purpose was to improve understanding of chemi-ionization in flames and the interplay between ion generation and ion-driven flows, and to explore how electric fields can be used to control non-premixed flames.

# Experimental Conditions

E-FIELD Flames ran in the Combustion Integrated Rack (CIR) on the ISS using the modular ACME chamber insert, with ISS operations in March to May 2018 and September to November 2018. NASA states it was the first ACME study to complete ISS testing.

- Gravity: microgravity (ISS).
- Fuels and burners: pure and diluted methane and ethylene, burned with both gas-jet and coflow flame configurations.
- Electric field: a high-voltage differential of up to 10 kV, of either polarity, between the burner and a flat circular mesh downstream of it. The ACME fact sheet states the mesh can be set between +10 and -10 kV and is positioned at about 35 or 50 mm downstream of the insulated burner.
- ACME tests are constant-volume with approximately 83 liters of free chamber volume and typically last a few minutes.
- Oxygen, pressure, dilution levels and coflow velocities are not stated in the sources consulted, so those fields are null.

# Variables

Independent variables described for E-FIELD Flames:

- Electric field strength and polarity (up to 10 kV).
- Fuel: methane or ethylene.
- Fuel dilution.
- Burner configuration: gas jet or coflow.

Dependent variables: ion current through the flame, flame size and shape, flame luminosity, soot presence and the flame's response to electric forcing.

# Sensors and Measurements

The ion current between the burner and the electrode mesh was determined by measuring the voltage drop across a known resistor and applying Ohm's law (ACME fact sheet). The ACME chamber insert provides a high-definition color camera and an analog color camera, among other diagnostics; the sources consulted do not state which were used for each E-FIELD test.

# Key Findings

- In contrast to normal-gravity tests, the microgravity flames exhibit a distinct peak ion current that corresponds to the most compact flame (2021 NASA paper; 2022 presentation).
- There are clear correlations between flame luminosity, combustion intensity and ion current in the ISS data.
- Highly diluted flames can be stabilized with very weak electric fields.
- Soot generation could be suppressed; when soot is present, electric fields create a wide range of behaviours.
- At high field strengths, the flames exhibited corona and arc discharges.
- E-FIELD Flames data were the first ACME data made available online through NASA's Physical Sciences Informatics system (2021 NASA paper).

# Fire Safety Relevance

Team interpretation: E-FIELD Flames is primarily aimed at combustion control and pollutant reduction, and NASA does not state a fire-safety objective for it, so this draft assigns no safety category. Its indirect relevance is that electric fields measurably change flame size, stability and soot in microgravity, and that ion current tracks combustion intensity, which could in principle inform future flame sensing. The stabilization of highly diluted flames by weak fields is also a reminder that electrical environments can affect near-limit flames. All tests were in microgravity; IGNIS does not treat them as lunar or Martian evidence.

# Limitations

- The sources consulted are NASA overview papers with "selected findings"; peer-reviewed E-FIELD results papers were not consulted.
- Oxygen concentration, pressure, dilution levels and flow velocities are not stated in the sources consulted.
- The ACME fact sheet description of the electrode hardware was written before flight. It also gives the chamber free volume as about 90 liters, where the 2021 paper gives approximately 83 liters; this record uses the later value.
- All tests were in microgravity.

# Source Notes

- ntrs-20210021781: Stocker, JASMAC 2021 (NASA Glenn). Supports the objective, fuels, gas-jet and coflow configurations, up to 10 kV of either polarity, operations dates (Table 2), the findings on peak ion current, correlations, soot suppression, weak-field stabilization and corona/arc discharges, and that E-FIELD data are available online.
- ntrs-20220007191: Stocker, CSS/CI 2022 presentation (NASA Glenn). Supports the objective wording, the selected findings (including soot behaviour), and the significance statement.
- nasa-acme-fact-sheet: NASA ACME fact sheet, E-FIELD Flames section and Experiment-Unique Equipment. Supports +10 to -10 kV, mesh positions of ~35 or ~50 mm, and the ion current measurement method.
- The NASA PSI record for E-FIELD Flames was not consulted (the 2021 paper states its data are on NASA's Physical Sciences Informatics site). Member 3 should check it if available.
