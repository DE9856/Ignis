---
type: Investigation
title: Smoke Point In Co-flow Experiment (SPICE)
shortTitle: SPICE
program: NASA Exploration Systems Mission Directorate (supporting organization)
description: >-
  ISS investigation in the Microgravity Science Glovebox that burned small gas-jet flames in a
  co-flowing air duct to find the laminar smoke point (the largest flame that does not emit soot)
  for several fuels, nozzle sizes and co-flow speeds in microgravity.
status: draft

safetyCategories:
  - prevention

fuelType: gas
material: Gaseous fuels and fuel mixtures, including propylene, propane and ethylene
sampleShape: Gas-jet diffusion flame from a nozzle in a co-flow duct
sampleSize: null

oxygenMin: null # percent O2 by volume
oxygenMax: null
pressureMin: null # kPa
pressureMax: null
airflowMin: null # m/s
airflowMax: null

gravityCondition: microgravity
gravityValue: null

platform: International Space Station (Increments 18 to 20)
hardware:
  - Microgravity Science Glovebox (MSG)
  - SPICE small flow duct with igniter and interchangeable nozzles
sensors:
  - Video camera with sensor-data overlay
  - High-resolution digital still camera
measurements:
  - Laminar smoke point (fuel flow at onset of soot emission)
  - Luminous flame shape and dimensions
  - Flame stabilization height
variables:
  - Fuel
  - Nozzle (burner tube) diameter
  - Co-flow air velocity

tags:
  - combustion
  - microgravity
  - soot
  - smoke-point
  - jet-flame
  - gaseous-fuel

sources:
  - id: nasa-spice-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/smoke-point-in-co-flow-experiment-spice.pdf
    title: Smoke Point in Co-flow Experiment (SPICE) fact sheet (NASA)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20090014827
    resource: https://ntrs.nasa.gov/citations/20090014827
    title: Smoke Point In Co-flow Experiment (SPICE) investigation summary (NASA, last updated February 2009)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/msg
    relation: uses-hardware
  - id: investigations/bass
    relation: shares-hardware
    note: BASS used slightly modified SPICE hardware
  - id: investigations/bass-ii
    relation: shares-hardware
    note: BASS-II used slightly modified SPICE hardware
  - id: investigations/slice
    relation: shares-hardware
    note: SLICE used the SPICE hardware
  - concepts/prevention

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Objective

SPICE determined the point at which small gas-jet flames, similar to a butane-lighter flame, begin to emit soot in microgravity. NASA states it would determine the laminar smoke point properties of non-buoyant jet diffusion flames (the properties of the largest laminar jet diffusion flames that do not emit soot) for several fuels and nozzle diameter / co-flow velocity configurations, measure flame shape and stabilization height, and continue work begun by the Laminar Soot Processes (LSP) experiment on STS-94. NASA states that soot dominates heat emitted from flames in normal gravity and microgravity fires, so understanding soot is important to fire spread, to predicting heat release in microgravity fires, and to improved flammability criteria for selecting spacecraft materials.

# Experimental Conditions

SPICE was conducted inside the sealed Microgravity Science Glovebox (MSG) on the ISS, assigned to Increments 18, 19 and 20; a NASA image shows the experiment during Expedition 18. NASA's Researcher's Guide states it was conducted in 2009.

- Gravity: microgravity (ISS).
- Hardware: a small flow duct with an igniter and a small nozzle, with two cameras, the fuel supply bottle and electronics outside the duct. The duct had fan-driven co-flowing air.
- Procedure: for each test point the crew set the burner diameter and air flow before ignition, then adjusted the fuel flow until the flame was just at the smoke point (the size where it begins to emit a small stream of soot from the tip).
- Plan: six test sequences covering six fuels with three burner tubes, 54 test points. NASA later reports 250 combustion tests were completed.
- Fuels: NASA names propylene, propane and ethylene among the fuel mixtures tested.
- Co-flow velocities, nozzle diameters, oxygen and pressure values are not stated in the sources consulted, so those fields are null.

# Variables

Independent variables described for SPICE:

- Fuel (six fuels planned; propylene, propane and ethylene named).
- Nozzle (burner tube) diameter (three planned).
- Co-flow air velocity.

Dependent variables: fuel flow at the smoke point, luminous flame shape and dimensions, and flame stabilization height.

# Sensors and Measurements

SPICE used a video camera, with sensor data overlaid on the downlinked video, and a high-resolution digital still camera triggered by the crew at the smoke point. Video was downlinked during or after each test so the ground team could help identify the smoke point; stored images and data were returned to Earth.

# Key Findings

- SPICE completed 250 combustion tests with various fuel mixtures, including propylene, propane and ethylene, in microgravity (NASA fact sheet, Science Results).
- Researchers identified more than 70 smoke points, which yielded estimates of soot-forming conditions and flame dimensions.
- NASA states the data will help researchers understand how smoke points are affected by microgravity and by co-flowing air speed.
- The predecessor LSP experiment showed that the onset of the microgravity smoke point in a quiescent environment is very different from normal gravity (NASA investigation summary).

# Fire Safety Relevance

Team interpretation: soot controls how much heat a flame radiates, and NASA links SPICE to predicting heat release in microgravity fires and to improved material flammability criteria, so this draft tags it as prevention. The evidence is from small, controlled gas-jet flames, not burning solids, and gives smoke-point conditions rather than direct fire-spread data. All tests were in microgravity; IGNIS does not treat SPICE as lunar or Martian evidence.

# Limitations

- The sources consulted are NASA summaries; the smoke-point values and co-flow speeds themselves are not given.
- Only three of the six fuels are named.
- The planned 54 test points and the reported 250 tests differ; the sources do not explain the difference (repeats or added conditions are possible but not stated).
- Oxygen and pressure are not stated; the MSG normally operates with ISS air.
- All tests were in microgravity.

# Source Notes

- nasa-spice-fact-sheet: supports the objective, LSP heritage, the soot and heat-emission rationale, the material flammability application, and the Science Results (250 tests, propylene, propane, ethylene, more than 70 smoke points).
- ntrs-20090014827: NASA investigation summary (last updated 17 February 2009). Supports Increments 18 to 20, Expedition 18 image, hardware (flow duct, igniter, nozzle, two cameras), crew procedure, the plan of six fuels, three burner tubes and 54 test points, the ESMD supporting organization, and the LSP smoke-point statement.
- researchers-guide-combustion: supports SPICE being conducted in 2009 in the MSG in a fan-driven flow duct and its goal of simple predictions of soot emissions.
- A NASA slide deck (NTRS 20150023100) also lists the experiment as "Soot Processes In Coflow Experiment"; this record uses the name on the NASA fact sheet and investigation summary. The NASA PSI record for SPICE was not consulted.
