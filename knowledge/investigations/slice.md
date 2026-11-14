---
type: Investigation
title: Structure and Liftoff In Combustion Experiment (SLICE)
shortTitle: SLICE
program: NASA ISS combustion research (precursor to ACME CLD Flame)
description: >-
  ISS investigation in the Microgravity Science Glovebox that used the SPICE flow duct to burn
  methane and ethylene coflow jet flames, from weak diluted flames near extinction to strongly
  sooting flames, to study liftoff, blowout and soot formation in microgravity.
status: stable

safetyCategories: []

fuelType: gas
material: >-
  Methane (100%, 70% and 40%) and ethylene (100% and 20%) by volume, diluted with nitrogen
sampleShape: Coflow jet diffusion flame from an interchangeable nozzle
sampleSize: Nozzle inner diameters 0.41, 0.77, 1.59, 2.14 and 3.23 mm

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
  - Microgravity Science Glovebox (MSG)
  - SPICE coflow duct (76 mm by 76 mm, 174 mm tall)
sensors:
  - Analog color video camera with test-condition overlay
  - Digital SLR camera (Nikon D300s) with BG-7 filter
  - Omni-directional hot-sphere anemometer
measurements:
  - Flame shape and size
  - Lift-off height
  - Soot temperature (color-ratio pyrometry)
  - Soot volume fraction
variables:
  - Fuel and nitrogen dilution
  - Nozzle diameter
  - Fuel flow rate
  - Coflow air velocity

tags:
  - combustion
  - microgravity
  - soot
  - flame-liftoff
  - jet-flame
  - gaseous-fuel

sources:
  - id: ntrs-20140017780
    resource: https://ntrs.nasa.gov/citations/20140017780
    title: >-
      An Experimental and Computational Study on Soot Formation in a Coflow Jet Flame Under
      Microgravity and Normal Gravity (Ma et al., with NASA Glenn co-authors)
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
  - id: investigations/spice
    relation: shares-hardware
    note: SLICE used the SPICE hardware in the MSG

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

SLICE investigated the structure of lifting and lifted coflow jet diffusion flames, where flow conditions and combustion chemistry cause the flame to detach from the burner and stabilize downstream. NASA states the twin purposes are increased fuel efficiency and reduced pollutant emission in practical combustion devices, by advancing combustion modeling capability. SLICE was a precursor to the Coflow Laminar Diffusion Flame (CLD Flame) experiment of the ACME project.

# Experimental Conditions

SLICE was conducted in the Microgravity Science Glovebox (MSG) on the ISS in 2012, using the SPICE hardware; the NASA-co-authored paper states it was completed in March 2012, with tests conducted by astronaut Donald Pettit. A replica of the flight hardware was used for normal-gravity comparison tests at Yale University.

- Gravity: microgravity (ISS).
- Duct: 76 mm by 76 mm square cross-section with rounded corners, 174 mm tall, with a DC fan, honeycomb and wire mesh to straighten the coflow. The setup was originally used in the Enclosed Laminar Flames (ELF) investigation on STS-87.
- Nozzles: five interchangeable fuel nozzles with inner diameters of 0.41, 0.77, 1.59, 2.14 and 3.23 mm.
- Fuels: 100%, 70% and 40% methane and 100% and 20% ethylene by volume, diluted with nitrogen.
- Fuel flow: manually adjustable from 0 to 500 sccm (nitrogen-equivalent) by mass flow controller.
- Coflow: air velocity varied by fan voltage. One example test used an average fuel velocity of 46 cm/s with a nominal 18 cm/s coflow; the full coflow range is not stated, so the airflow fields are null.
- Oxygen and pressure are not stated in the sources consulted.

# Variables

Independent variables reported for SLICE:

- Fuel type and nitrogen dilution (methane or ethylene at several dilutions).
- Nozzle inner diameter (five sizes).
- Fuel flow rate.
- Coflow air velocity.

Dependent variables: flame shape and size, lift-off height, blowout, soot temperature and soot volume fraction.

# Sensors and Measurements

An analog color video camera monitored the flame, with fuel flow, fan setting, anemometer reading and a timer superimposed on the video. A Nikon D300s digital SLR camera with a BG-7 filter took still images used for color-ratio pyrometry (soot temperature); soot volume fraction was obtained by absolute light calibration using the incandescence of a flame-heated S-type thermocouple. An omni-directional hot-sphere anemometer gave a reference coflow velocity.

# Key Findings

- SLICE produced a comprehensive and unique set of microgravity coflow diffusion flame data, from weak flames near extinction to strong, highly sooting flames, enabling study of gravitational effects on liftoff, blowout and soot formation (NASA-co-authored paper, abstract).
- For 100% methane coflow flames, microgravity flames were found to be sootier than normal-gravity flames by a factor of approximately 4 to 8 in peak soot volume fraction.
- The location of peak soot shifted from the flame centerline in normal gravity to the flame wings in microgravity.
- Microgravity flame temperature was lower than in normal gravity, attributed to higher soot loading and radiative loss; the peak soot temperature in microgravity was about 200 K lower than at 1 g.
- Computations matched flame shape and the shift of soot toward the wings. The predicted soot volume fraction was the same order of magnitude as measured at 1 g, but the computation did not capture the large increase in microgravity.

# Fire Safety Relevance

Team interpretation: SLICE is fundamental combustion research aimed at efficiency and emissions, and NASA does not state a fire-safety objective for it, so this draft assigns no safety category. Its indirect relevance is that small gaseous flames in microgravity can be several times sootier and cooler than on Earth, which affects how much heat and smoke a microgravity fire produces. All tests were in microgravity; IGNIS does not treat them as lunar or Martian evidence.

# Limitations

- The quantitative findings come from one paper focused on 100% methane flames with 1.59 and 3.23 mm nozzles; results for the other fuels are not covered here.
- The coflow velocity range, oxygen and pressure are not stated in the sources consulted.
- The paper notes the flight and engineering units' coflow profiles may differ, and the coflow near the nozzle was not perfectly symmetric.
- Soot temperature depends on an assumed soot dispersion exponent, which affects the 4 to 8 range.
- All tests were in microgravity.

# Source Notes

- ntrs-20140017780: Ma, Cao, Giassi, Stocker (NASA Glenn), Takahashi (NCSER at NASA Glenn), Bennett, Smooke and Long, "An experimental and computational study on soot formation in a coflow jet flame under microgravity and normal gravity". Supports completion in March 2012, Don Pettit, MSG, the duct and nozzle dimensions, fuels, 0 to 500 sccm, the example 46 cm/s fuel and 18 cm/s coflow, the diagnostics, and all Key Findings. Most authors are at Yale University; it is listed on NASA NTRS.
- researchers-guide-combustion: supports the objective (lifting and lifted flames, efficiency and emissions), use of the SPICE hardware in the MSG, operations in 2012, and SLICE as a precursor to CLD Flame.
- The NASA PSI record for SLICE was not consulted.
