---
type: Investigation
title: Cool Flames Investigation with Gases (CFI-G)
shortTitle: ACME CFI-G
program: Advanced Combustion via Microgravity Experiments (ACME), NASA Glenn Research Center
description: >-
  ACME experiment in the ISS Combustion Integrated Rack that burned gaseous fuels on porous
  spherical burners to observe non-premixed, quasi-steady spherical cool flames, which cannot be
  produced in normal gravity or in ground-based microgravity facilities.
status: stable

safetyCategories: []

fuelType: gas
material: Ethane, propane and n-butane (normal and inverse flames)
sampleShape: Porous spherical burner
sampleSize: 6.35 mm porous spherical burner (shown in a 2022 NASA presentation)

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
  - Porous spherical burner
sensors:
  - Intensified camera filtered for formaldehyde (CH2O) emission
measurements:
  - Hot flame and cool flame appearance and size
variables:
  - Fuel (ethane, propane, n-butane)
  - Flame configuration (normal or inverse)
  - Fuel dilution

tags:
  - combustion
  - microgravity
  - cool-flames
  - spherical-flame
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
    title: Advanced Combustion via Microgravity Experiments (ACME) fact sheet (NASA; CFI-G section)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/cir
    relation: uses-hardware
  - id: investigations/flex
    relation: inspired-by
    note: NASA states the cool flames discovered in CIR droplet combustion research inspired CFI-G
  - id: investigations/acme-bre
    relation: shares-hardware
    note: Same ACME modular hardware in the CIR
  - concepts/droplet-combustion

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

The Cool Flames Investigation with Gases (CFI-G) aimed to observe non-premixed, quasi-steady spherical cool flames on porous burners. NASA states that cool diffusion flames were discovered during droplet combustion experiments aboard the ISS in 2012, but droplet experiments involve unsteady burning rates, so cool diffusion flames had never been observed as steady spherical flames. NASA states the motivation is that ignition and flame propagation in engines depend on cool flame chemistry while engine design models neglect it, so better cool-flame kinetics could enable cleaner, more efficient internal combustion engines. The experiment was selected for spaceflight by the Center for the Advancement of Science in Space (CASIS) and the National Science Foundation (NSF).

# Experimental Conditions

CFI-G ran in the Combustion Integrated Rack (CIR) on the ISS using the modular ACME chamber insert, with operations starting in March 2021 (Table 2 of the 2021 NASA paper lists March to June 2021 and June 2021 onward). The 2022 NASA presentation states ACME ISS testing was complete by February 2022.

- Gravity: microgravity (ISS). NASA states these tests cannot be performed in normal gravity or in ground-based microgravity facilities.
- Fuel and configuration: normal-flame and inverse-flame tests with ethane, propane and n-butane; cool flames were found in tests with diluted n-butane.
- Burner: a porous spherical burner; a 2022 NASA presentation labels a 6.35 mm porous spherical burner.
- ACME tests are constant-volume with approximately 83 liters of free chamber volume and typically last a few minutes.
- Oxygen, pressure and diluent concentrations are not stated in the sources consulted, so those fields are null.

# Variables

Independent variables described for CFI-G:

- Fuel: ethane, propane or n-butane.
- Flame configuration: normal flame (fuel from burner into oxidizer) or inverse flame (oxidizer from burner into fuel).
- Fuel dilution (the n-butane cool-flame test used diluted fuel; the diluent and level are not stated).

Dependent variables: appearance and size of hot and cool flames, and the transition from hot flame to cool flame.

# Sensors and Measurements

Cool flames were imaged with an intensified camera filtered for formaldehyde (CH2O) emissions, which are associated with cool flame chemistry. Other ACME diagnostics (high-definition color camera, thermopile radiometers, photomultiplier tubes, burner thermocouples) were available in the chamber insert; the sources consulted do not state which were used for CFI-G.

# Key Findings

- CFI-G observed the first spherical, quasi-steady, burner-supported cool flames (2022 NASA presentation).
- In a normal-flame test with diluted n-butane, a cool flame appeared after the hot flame quenched due to radiative heat loss, following a dark period of about 1 second (2022 presentation, composite image sequence).
- As expected, the cool flames were significantly smaller than the corresponding hot flames (2021 NASA paper).
- NASA states the significance is improved and quantitative understanding of cool flame chemistry for advanced engine designs that can increase efficiency and reduce pollutant emissions.

# Fire Safety Relevance

Team interpretation: CFI-G is fundamental combustion research aimed at engine chemistry, and NASA does not state a fire-safety objective for it, so this draft assigns no safety category. Its indirect relevance is that it shows a hydrocarbon flame can transition, after the visible flame goes out, to a much smaller, low-temperature cool flame that keeps reacting. A fire that appears extinguished in microgravity may therefore not be fully out. All tests were in microgravity; IGNIS does not treat them as lunar or Martian evidence.

# Limitations

- The sources consulted are NASA overview papers with "selected findings"; detailed CFI-G results (for example the peer-reviewed paper on spherical gas-fueled cool diffusion flames) were not consulted.
- Oxygen concentration, pressure, diluent and flow rates are not stated in the sources consulted.
- The end date of CFI-G operations is not stated precisely (listed as "June 2021 - ?" in the 2021 paper).
- The 6.35 mm burner size comes from a figure label in a presentation.
- All tests were in microgravity.

# Source Notes

- ntrs-20210021781: Stocker, JASMAC 2021 (NASA Glenn). Supports the objective, CASIS/NSF selection, fuels (ethane, propane, n-butane), normal and inverse flames, the cool flame discovery with diluted n-butane, formaldehyde-filtered imaging, smaller cool flames, operations dates (Table 2), and ~83 liter constant-volume procedure.
- ntrs-20220007191: Stocker, CSS/CI 2022 presentation (NASA Glenn). Supports "first spherical, quasi-steady, burner-supported cool flames", the ~1 s dark period sequence, the 6.35 mm porous spherical burner label, the significance statement, and ACME testing complete by February 2022.
- nasa-acme-fact-sheet: NASA ACME fact sheet, CFI-G section. Supports the 2012 droplet discovery of cool diffusion flames, the statement that tests cannot be performed in normal gravity or ground facilities, and the engine relevance.
- The NASA PSI record for CFI-G was not consulted. Member 3 should check it if available.
