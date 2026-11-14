---
type: Investigation
title: Smoke Aerosol Measurement Experiment (SAME)
shortTitle: SAME
program: ISS Exploration Research Project, Exploration Technology Development Program
description: >-
  ISS investigation in the Microgravity Science Glovebox that overheated common spacecraft
  materials to produce smoke, measured the smoke particle size distribution with three moment
  instruments, and exposed the smoke to Space Shuttle and ISS smoke detectors, to inform the design
  of spacecraft smoke detectors.
status: draft

safetyCategories:
  - detection

fuelType: solid
material: >-
  Teflon, Kapton, silicone rubber, cellulose, and dibutyl-phthalate deposited on a porous wick
  (lamp wick)
sampleShape: null
sampleSize: null

oxygenMin: null # percent O2 by volume
oxygenMax: null
pressureMin: null # kPa
pressureMax: null
airflowMin: null # m/s
airflowMax: null

gravityCondition: microgravity
gravityValue: null

platform: International Space Station (Expedition 15)
hardware:
  - Microgravity Science Glovebox (MSG)
  - SAME smoke generation duct, piston aging chamber and diagnostics duct
sensors:
  - Condensation nuclei counter (TSI P-Trak), zeroth moment
  - Ionization chamber from a residential smoke detector, first moment
  - Light-scattering aerosol monitors (TSI DustTrak, 1 um and 10 um impactors), third moment
  - Space Shuttle ionization smoke detector
  - ISS light-scattering smoke detector
  - Thermal precipitator with TEM grids
  - Video camera
measurements:
  - Smoke particle number concentration
  - Count mean diameter of smoke particles
  - Mass concentration and fraction of particulate larger than 1 um
  - Smoke detector response (Shuttle and ISS designs)
variables:
  - Sample material
  - Sample heating (pyrolysis) temperature
  - Airflow rate over the sample
  - Smoke aging (residence) time

tags:
  - microgravity
  - smoke
  - aerosol
  - smoke-detection
  - pyrolysis
  - particle-size

sources:
  - id: nasa-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf
    title: Smoke Aerosol Measurement Experiment (SAME) fact sheet (NASA; also covers SAME-R)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20080012612
    resource: https://ntrs.nasa.gov/citations/20080012612
    title: >-
      Spacecraft Fire Detection: Smoke Properties and Transport in Low-Gravity (Urban et al., AIAA
      2008-806)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: investigations/same-r
    relation: follow-on
    note: SAME-R (SAME-2) reflew the experiment in 2010 with a revised material set
  - id: hardware/msg
    relation: uses-hardware
  - id: investigations/saffire
    relation: shares-measurement
    note: Saffire measured smoke and detector response from large-scale fires in a spacecraft
  - concepts/detection
  - concepts/smoke-detection

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Objective

SAME (Smoke Aerosol Measurement Experiment) measured the size distribution of smoke particles produced in microgravity by materials found on spacecraft, to evaluate the two existing U.S. spacecraft smoke detector designs (the ionization detector used on the Space Shuttle and the photoelectric light-scattering detector used on the ISS) and to provide data for predicting smoke particle growth and evaluating alternative detection devices. NASA states that no measurements of smoke from microgravity fires had been made when the Shuttle and ISS detectors were designed, so their designs were based on 1-g information; the objective was to make sufficient measurements of spacecraft smoke to enable improved design of future detectors.

# Experimental Conditions

SAME was conducted in the Microgravity Science Glovebox (MSG) on the International Space Station during Expedition 15.

- Gravity: microgravity (ISS).
- Smoke generation: smoke was produced by overheating a small sample of material in a smoke generation duct for approximately 60 seconds; the cited sources describe pyrolysis smoke, not flaming combustion.
- Samples: 30 samples in total, six samples each of five materials: Teflon, Kapton, silicone rubber, cellulose, and dibutyl-phthalate deposited on a porous wick.
- Test matrix: samples were tested at different airflow rates, heating (pyrolysis) temperatures and smoke aging durations. The specific values are not stated in the sources consulted, so the airflow, oxygen and pressure fields are null.
- Smoke handling: a moving piston drew smoke into an aging chamber, held it for a predetermined time to allow coagulation, then pushed it into a diagnostics duct holding the measurement instruments and the Shuttle and ISS smoke detectors.

# Variables

Independent variables reported for SAME:

- Sample material (Teflon, Kapton, silicone rubber, cellulose, dibutyl-phthalate on a wick).
- Sample heating (pyrolysis) temperature.
- Airflow rate over the sample.
- Smoke aging time (residence time before measurement).

Dependent variables: particle number concentration, count mean diameter, mass concentration and fraction of particulate above 1 um, and the response of the Shuttle and ISS smoke detectors.

# Sensors and Measurements

SAME used a "moment method": three instruments measured separate moments of the particle size distribution, from which mean diameters and the width of an assumed log-normal distribution can be computed.

- Zeroth moment (number concentration): TSI P-Trak condensation nuclei counter, modified for low gravity; range 0 to 10^5 particles/cm3 and 20 nm to 1 um diameter.
- First moment (diameter concentration): the ionization chamber from a residential smoke detector.
- Third moment (mass concentration): two TSI DustTrak light-scattering monitors, one with a 1 um impactor and one with a 10 um impactor; range 0.001 to 100 mg/m3.
- A thermal precipitator deposited smoke particles on Transmission Electron Microscope (TEM) grids for return to Earth.
- Space Shuttle and ISS smoke detectors were installed in the diagnostics duct.
- Signals were digitized at 1 Hz; a video camera viewed the sample.

# Key Findings

- For the materials tested, a substantial portion of the smoke particles are below 500 nm in diameter (AIAA 2008 paper abstract).
- Smoke particulate produced in low gravity was typically 50% larger in count mean diameter than under similar conditions in normal gravity, and the resulting sizes were all below 300 nm, suggesting that discriminating smoke from spacecraft dust could possibly be achieved by detecting in the sub-micrometer range (AIAA 2008 paper conclusion).
- Baseline count mean diameters reported: silicone rubber 263 nm (53% larger than 1 g), Teflon 223 nm, lamp wick 248 nm (65% larger than 1 g), Kapton 114 nm (58% larger than 1 g).
- NASA's later summary states that a substantial portion of the aerosol mass is in particles larger than 1 micron, that Teflon smoke comprised primarily particles below 1 um, and that aging was consistent with particle coagulation with limited wall loss (number count decreased substantially while mass concentration stayed relatively steady).
- NASA's summary states that although arithmetic mean diameters were all in the 100 to 200 nm range, almost half the particle mass of silicone rubber smoke was in particles larger than 1000 nm.
- All samples produced significant numbers of sub-micron particulate that are better detected using an ionization smoke detector, although a light-scattering detector would perform very well for most cases; results suggest that detection methods measuring a wider spectrum of particle sizes may be more reliable.
- A companion smoke transport model of the ISS US Laboratory module showed that mixing dominates smoke transport in microgravity, so detection times are longer than in normal gravity and strongly dependent on source location and obstructions (model result, not a flight measurement).

# Fire Safety Relevance

Team interpretation: SAME is direct microgravity evidence about the smoke that spacecraft detectors must sense in the early, pre-flaming stage of a fire, which NASA identifies as the primary detection target in a confined spacecraft. The findings that microgravity smoke particles from overheated materials are larger than in 1 g but mostly sub-micron, and that much of the smoke mass can still be above 1 um, are relevant to choosing detector technologies and particle-size sensitivity for future spacecraft and habitats. SAME addresses detection only; it did not test flaming fires, flame spread or suppression. The tests were in microgravity; IGNIS does not treat them as direct lunar or Martian evidence.

# Limitations

- SAME measured smoke from overheated (pyrolysing) materials, not from flaming fires; it does not describe soot from established flames.
- The specific heating temperatures, airflow rates and aging times of each test are not stated in the sources consulted.
- Oxygen concentration and pressure are not reported; tests ran in the MSG on the ISS, but no values are given.
- The AIAA 2008 paper reports only zeroth- and first-moment results; third-moment (mass) and TEM analyses were still underway when it was written.
- The two sources give different summary statistics: the AIAA 2008 paper reports count mean diameters up to 263 nm (silicone rubber) and "all below 300 nm", while the NASA fact sheet reports arithmetic mean diameters "in the 100 to 200 nm range" and 227 nm for silicone rubber. The sources do not explain the difference; it may reflect later re-analysis.
- The smoke transport findings come from a numerical model (Fire Dynamics Simulator) of the US Lab module, not from flight measurements.

# Source Notes

- nasa-fact-sheet: NASA fact sheet PDF covering SAME and SAME-R. Supports the objective, the evaluation of Shuttle ionization and ISS photoelectric detectors, Expedition 15 in the MSG, 30 samples of five materials, the tested variables (airflow, heating temperature, aging), and the results paragraphs on mass above 1 um, Teflon smoke, aging, 100 to 200 nm AMD, 227 nm silicone AMD, and ionization versus light-scattering detection.
- ntrs-20080012612: Urban, Ruff, Brooker, Cleary, Yang, Mulholland and Yuan, "Spacecraft Fire Detection: Smoke Properties and Transport in Low-Gravity", AIAA 2008-806 (46th Aerospace Sciences Meeting). Supports the moment method, instrument details and ranges, the 60 s overheating procedure, Table 1 count mean diameters, the "50% larger" and "below 300 nm" conclusion, the "below 500 nm" abstract result, and the smoke transport model findings.
- The NASA PSI record for SAME was not consulted because the PSI site could not be read by the tools used to draft this record. Member 3 should check it if available.
