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
status: stable

safetyCategories:
  - detection

fuelType: solid
material: >-
  Teflon, Kapton, silicone rubber, cellulose (lamp wick), and dibutyl-phthalate deposited on a
  porous wick
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
  - id: ntrs-20120012884
    resource: "https://ntrs.nasa.gov/citations/20120012884"
    title: >-
      Properties of Smoke from Overheated Materials in Low-Gravity (Urban et al., AIAA 2009-0956)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: psi-102
    resource: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-102"
    title: NASA PSI investigation record PSI-102 (SAME)
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

verified:
  - by: human:member3
    at: 2026-11-14
    note: "Scope: all. Checked against the cited NASA sources, using the docs/reviews source-check report."
---

# Objective

SAME (Smoke Aerosol Measurement Experiment) measured the size distribution of smoke particles produced in microgravity by materials found on spacecraft, to evaluate the two existing U.S. spacecraft smoke detector designs (the ionization detector used on the Space Shuttle and the photoelectric light-scattering detector used on the ISS) and to provide data for predicting smoke particle growth and evaluating alternative detection devices. NASA states that no measurements of smoke from microgravity fires had been made when the Shuttle and ISS detectors were designed, so their designs were based on 1-g information; the objective was to make sufficient measurements of spacecraft smoke to enable improved design of future detectors.

# Experimental Conditions

SAME was conducted in the Microgravity Science Glovebox (MSG) on the International Space Station during Expedition 15.

- Gravity: microgravity (ISS).
- Smoke generation: smoke was produced by overheating a small sample of material in a smoke generation duct for approximately 60 seconds; the cited sources describe pyrolysis smoke, not flaming combustion.
- Samples: 30 samples in total, six samples each of five materials: Teflon, Kapton, silicone rubber, cellulose (lamp wick), and dibutyl-phthalate deposited on a porous wick.
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
- Preliminary baseline count mean diameters (AIAA 2008, zeroth- and first-moment instruments only): silicone rubber 263 nm (53% larger than 1 g), Teflon 223 nm, lamp wick 248 nm (65% larger than 1 g), Kapton 114 nm (58% larger than 1 g).
- Later baseline results with all three moment instruments (AIAA 2009, Table 1): arithmetic mean diameters of 105 nm (Kapton), 227 nm (lamp wick) and 205 nm (Teflon); diameters of average mass of 172 nm, 420 nm and 219 nm respectively; the silicone results did not converge. The authors state that the small Kapton and Teflon particles will make detection challenging for light-scattering devices, while the large lamp wick and silicone particles suggest detection against the background will need a system measuring more than one moment of the size distribution.
- NASA's later summary states that a substantial portion of the aerosol mass is in particles larger than 1 micron, that Teflon smoke comprised primarily particles below 1 um, and that aging was consistent with particle coagulation with limited wall loss (number count decreased substantially while mass concentration stayed relatively steady).
- NASA's fact sheet states that although arithmetic mean diameters were all in the 100 to 200 nm range, the AMD for silicone rubber was 227 nm and almost half its particle mass was in particles larger than 1000 nm (see Limitations: this value conflicts with the paper it summarises).
- All samples produced significant numbers of sub-micron particulate that are better detected using an ionization smoke detector, although a light-scattering detector would perform very well for most cases; results suggest that detection methods measuring a wider spectrum of particle sizes may be more reliable.
- A companion smoke transport model of the ISS US Laboratory module showed that mixing dominates smoke transport in microgravity, so detection times are longer than in normal gravity and strongly dependent on source location and obstructions (model result, not a flight measurement).

# Fire Safety Relevance

Team interpretation: SAME is direct microgravity evidence about the smoke that spacecraft detectors must sense in the early, pre-flaming stage of a fire, which NASA identifies as the primary detection target in a confined spacecraft. The findings that microgravity smoke particles from overheated materials are larger than in 1 g but mostly sub-micron, and that much of the smoke mass can still be above 1 um, are relevant to choosing detector technologies and particle-size sensitivity for future spacecraft and habitats. SAME addresses detection only; it did not test flaming fires, flame spread or suppression. The tests were in microgravity; IGNIS does not treat them as direct lunar or Martian evidence.

# Limitations

- SAME measured smoke from overheated (pyrolysing) materials, not from flaming fires; it does not describe soot from established flames.
- The specific heating temperatures, airflow rates and aging times of each test are not stated in the sources consulted.
- Oxygen concentration and pressure are not reported; tests ran in the MSG on the ISS, but no values are given.
- The AIAA 2008 paper reports only zeroth- and first-moment results; third-moment (mass) and TEM analyses were still underway when it was written.
- Particle-size statistics conflict across the three sources. Both papers define the count mean diameter as the arithmetic mean diameter, so the values are the same statistic. The AIAA 2008 paper gives preliminary values up to 263 nm (silicone rubber) and "all below 300 nm". The AIAA 2009 paper gives lower, recalibrated values (Kapton 105 nm, Teflon 205 nm, lamp wick 227 nm) and reports no converged result for silicone rubber. The NASA fact sheet, which cites the 2009 paper, says arithmetic mean diameters were "in the 100 to 200 nm range" and gives 227 nm for silicone rubber; in the 2009 table, 227 nm is the lamp wick value and two values exceed 200 nm. Under the IGNIS source ranking the fact sheet (official NASA page) outranks the papers, so its statements are kept with attribution, but the 227 nm silicone value should not be used as a silicone measurement without this caveat.
- PSI-102 has no experimental table. Its Approach text (igniter run for 15 to 60 s, thermophoretic soot samplers, a Far Field Box, combustion events of about 2 minutes) and its hardware entry (Comparative Soot Diagnostic hardware) do not match the SAME hardware described in both papers and appear to describe the earlier Comparative Soot Diagnostics experiment; only the PSI-102 objectives and hypothesis are used here.
- The smoke transport findings come from a numerical model (Fire Dynamics Simulator) of the US Lab module, not from flight measurements.

# Source Notes

- nasa-fact-sheet: NASA fact sheet PDF covering SAME and SAME-R. Supports the objective, the evaluation of Shuttle ionization and ISS photoelectric detectors, Expedition 15 in the MSG, 30 samples of five materials, the tested variables (airflow, heating temperature, aging), and the results paragraphs on mass above 1 um, Teflon smoke, aging, 100 to 200 nm AMD, 227 nm silicone AMD, and ionization versus light-scattering detection.
- ntrs-20080012612: Urban, Ruff, Brooker, Cleary, Yang, Mulholland and Yuan, "Spacecraft Fire Detection: Smoke Properties and Transport in Low-Gravity", AIAA 2008-806 (46th Aerospace Sciences Meeting). Supports the moment method, instrument details and ranges, the 60 s overheating procedure, Table 1 count mean diameters, the "50% larger" and "below 300 nm" conclusion, the "below 500 nm" abstract result, and the smoke transport model findings.
- ntrs-20120012884: Urban, Ruff, Sheredy, Cleary, Yang, Mulholland and Yuan, "Properties of Smoke from Overheated Materials in Low-Gravity", AIAA 2009-0956 (47th Aerospace Sciences Meeting). Supports cellulose being the lamp wick sample, the third-moment calibration method, Table 1 baseline diameters, the non-convergence of the silicone results, and the detection conclusions for Kapton, Teflon, lamp wick and silicone. This is the "Urban et al. 2009" paper the fact sheet cites for its results.
- psi-102: NASA PSI record for SAME. Supports the objective of quantifying liquid smoke particle sizes in low gravity and the hypothesis that microgravity liquid aerosol smoke will have larger droplets than in 1 g, possibly affecting detector response. It gives no oxygen, pressure or airflow values.
