---
type: Investigation
title: Flame Extinguishment Experiment-2 (FLEX-2)
shortTitle: FLEX-2
program: null
description: >-
  Follow-on to FLEX in the ISS Combustion Integrated Rack that burns single droplets and droplet
  pairs of pure, bi-component and surrogate fuels to study burning rates, soot formation, slow
  convective flow effects and droplet-droplet interactions.
status: stable

safetyCategories: []

fuelType: liquid
material: Pure fuels, bi-component fuel mixtures and practical fuel surrogates (droplets)
sampleShape: Spherical droplet (single, binary array, or tethered on crossed fibers)
sampleSize: Droplets from 2 mm to 4 mm in diameter (as stated in the NASA fact sheet)

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
  - Multi-User Droplet Combustion Apparatus (MDCA)
sensors: []
measurements:
  - Droplet burning rate
  - Flame extinction
  - Soot formation
variables:
  - Fuel (pure, bi-component, surrogate)
  - Ambient gas environment
  - Single droplet versus binary droplet array
  - Sub-buoyant convective flow (tethered droplet translated through the gas)

tags:
  - combustion
  - microgravity
  - droplet-combustion
  - liquid-fuel
  - soot
  - cool-flames

sources:
  - id: nasa-flex-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/flame-extinguishment-experiment-flex.pdf
    title: Flame Extinguishment Experiment (FLEX) fact sheet (NASA; FLEX-2 section)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: nasa-acme-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/advanced-combustion-via-microgravity-experiments-acme.pdf
    title: Advanced Combustion via Microgravity Experiments (ACME) fact sheet (NASA; CFI-G section)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: investigations/flex
    relation: predecessor
    note: FLEX-2 uses the same CIR/MDCA hardware and extends FLEX to more complex fuels and droplet interactions
  - id: hardware/mdca
    relation: uses-hardware
  - id: hardware/cir
    relation: uses-hardware
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

FLEX-2 is the second experiment in the FLEX series on the International Space Station. NASA states that it uses fuels and environmental conditions that mimic real combustor conditions, studying the influence of sub-buoyant convective flows on combustion rates, the influence of a second burning droplet in a linear array, and the burning of bi-component and surrogate fuels as a start on practical fuels. NASA describes the motivation as better understanding droplet combustion for energy conversion, where liquid hydrocarbon fuels are a predominant energy source, and states that FLEX-2 data can help verify models of real fuels used in transportation and industry.

# Experimental Conditions

FLEX-2 uses the Multi-User Droplet Combustion Apparatus (MDCA) in the Combustion Integrated Rack (CIR) on the ISS.

- Gravity: microgravity (ISS).
- Droplets: NASA states that small droplets from 2 mm to 4 mm in diameter burn "one-dimensionally" in microgravity.
- Configurations: a single droplet or a pair of droplets is dispensed, deployed and ignited in a known, controlled gas environment. In binary-array tests two droplets are placed on a support fiber and ignited simultaneously. In convective-flow tests a single droplet is tethered at the intersection of two crossed fibers, which are moved through the quiescent atmosphere.
- Test groups: pure fuel, fuel mixture, convective flow and binary droplet array experiments, each with 30 to 60 separate tests using different fuels, ambient conditions or droplet configurations.
- The MDCA facility supports droplets of 1 to 5 mm in a 0 to 3 atm environment of up to 40 percent oxygen by volume (facility capability, not FLEX-2 test conditions).
- One NASA figure shows a FLEX-2 test with ethanol burning in 30 percent oxygen at 2.4 atm (single example).
- The oxygen, pressure and convective flow ranges actually used in FLEX-2 are not stated in the sources consulted, so those fields are null.

# Variables

Independent variables described for FLEX-2:

- Fuel type: pure fuels, mixtures of pure fuels (bi-component) and real-fuel surrogates.
- Ambient gas environment (composition and pressure; values not stated in the sources consulted).
- Droplet configuration: single droplet or binary droplet array.
- Sub-buoyant convective flow, imposed by moving a tethered droplet through the gas.

Dependent variables described: combustion (burning) rate, flame extinction (or burning to completion) and soot formation.

# Sensors and Measurements

The sources consulted do not list FLEX-2-specific diagnostics. They describe what FLEX-2 studies: combustion rates under sub-buoyant convective flow, whether droplets burn to completion or extinguish at a finite radius, soot formation, and droplet-droplet interactions (FLEX fact sheet; Researcher's Guide). The MDCA and CIR diagnostics used for FLEX are described in the FLEX record; this record does not assume they were identical for FLEX-2.

# Key Findings

- NASA's Researcher's Guide, describing FLEX and the follow-on FLEX-2 together, states that these experiments identified radiative and diffusive extinction limits for heptane and methanol droplets, a limiting oxygen index significantly lower than in normal gravity, and stable, quasi-steady cool flames after radiative extinction of the visible flame for heptane droplets. The source does not separate which of these results came from FLEX-2.
- NASA states that cool diffusion flames were discovered during droplet combustion experiments aboard the ISS in 2012 (ACME fact sheet, CFI-G section); the investigation is not named.
- No FLEX-2-specific quantitative results were found in the NASA sources consulted for this draft.

# Fire Safety Relevance

Team interpretation: FLEX-2 is primarily fundamental combustion research aimed at practical fuels and engines, not fire safety. Its relevance to spacecraft fire safety is indirect: the droplet burning, extinction and cool-flame behaviour it studies informs how liquid fuels might burn or appear extinguished in microgravity. This draft does not assign a safety category because the sources consulted do not state a fire-safety objective for FLEX-2. All tests were in microgravity; IGNIS does not treat them as lunar or Martian evidence.

# Limitations

- No NASA results report specific to FLEX-2 was found; Key Findings rely on a NASA summary that groups FLEX and FLEX-2 together.
- Oxygen, pressure and flow ranges for FLEX-2 tests are not stated in the sources consulted.
- Specific fuels are described only in general terms (pure, bi-component, surrogate) in the FLEX-2 fact sheet section.
- Diagnostics specific to FLEX-2 are not listed in the sources consulted.
- All tests were in microgravity.

# Source Notes

- nasa-flex-fact-sheet: NASA FLEX fact sheet PDF, FLEX-2 section. Supports the objective, 2 mm to 4 mm droplets, single and binary droplet configurations, tethered convective-flow tests, burning to completion or extinction at a finite radius, and the four test groups of 30 to 60 tests each. The PI team is listed there (lead: Prof. Forman Williams, UCSD).
- researchers-guide-combustion: NASA "A Researcher's Guide to: Combustion Science". Supports the FLEX-2 description (mixtures of pure fuels, real fuel surrogates, soot formation, slow sub-buoyant convective flow, droplet-droplet interactions), the energy-conversion motivation, the MDCA facility capability (1 to 5 mm, 0 to 3 atm, up to 40% O2), the Figure 3 FLEX-2 example (ethanol, 30% O2, 2.4 atm), and the combined FLEX/FLEX-2 statements in Key Findings.
- nasa-acme-fact-sheet: NASA ACME fact sheet, CFI-G section. Supports the 2012 cool flame discovery statement.
- Candidate sources not used: a 2014 NASA-authored conference paper on cool-flame extinction (NTRS 20140006750) attributes its results to "FLEX experiments" without naming FLEX-2, so it was not used here. The NASA PSI record for FLEX-2 was not consulted. Member 3 should check whether a FLEX-2-specific NASA results source exists.
