---
type: Investigation
title: Smoke Aerosol Measurement Experiment - Reflight (SAME-R / SAME-2)
shortTitle: SAME-R
program: null
description: >-
  Reflight of SAME in the ISS Microgravity Science Glovebox during Expedition 24 (2010) that
  overheated spacecraft materials below their ignition point, aged the smoke for 11 to 1800 s, and
  measured particle size, morphology and the response of smoke detectors, including a prototype
  two-moment detector.
status: stable

safetyCategories:
  - detection

fuelType: solid
material: >-
  Teflon, Kapton, cotton (lamp wick / cellulose), silicone rubber and Pyrell; the results section
  also lists dibutyl-phthalate deposited on a porous wick
sampleShape: null
sampleSize: null

oxygenMin: null # percent O2 by volume
oxygenMax: null
pressureMin: null # kPa
pressureMax: null
airflowMin: 0 # m/s
airflowMax: 0.08

gravityCondition: microgravity
gravityValue: null

platform: International Space Station (Expedition 24)
hardware:
  - Microgravity Science Glovebox (MSG)
  - SAME smoke generation duct, piston aging chamber and diagnostics duct
sensors:
  - Condensation nuclei counter (TSI P-Trak), zeroth moment
  - Ionization chamber, first moment
  - Light-scattering aerosol monitor (TSI DustTrak), third moment
  - Multi-Parameter Aerosol Scattering Sensor (MPASS), prototype two-moment smoke detector
  - Space Shuttle ionization smoke detector
  - ISS light-scattering smoke detector
  - Thermal precipitator with TEM grids
measurements:
  - Smoke particle number concentration
  - Count mean diameter and diameter of average mass
  - Geometric mean diameter and geometric standard deviation (log-normal assumption)
  - Particle morphology (TEM)
  - Smoke detector response
variables:
  - Sample material
  - Sample heating temperature
  - Air flow past the sample during heating
  - Smoke aging time

tags:
  - microgravity
  - smoke
  - aerosol
  - smoke-detection
  - pyrolysis
  - particle-size

sources:
  - id: ntrs-20130000422
    resource: https://ntrs.nasa.gov/citations/20130000422
    title: >-
      Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2 (Urban
      et al., AIAA 2012-3536, ICES 2012)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: nasa-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/smoke-aerosol-measurement-experiment-same.pdf
    title: Smoke Aerosol Measurement Experiment (SAME) fact sheet (NASA; SAME-R section)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: investigations/same
    relation: predecessor
    note: SAME-R reflew the SAME hardware with added diagnostics and an expanded test matrix
  - id: hardware/msg
    relation: uses-hardware
  - id: investigations/saffire
    relation: shares-measurement
    note: Saffire measured smoke and detector response from large-scale fires
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

SAME-R (the Reflight of the Smoke Aerosol Measurement Experiment, also called SAME-2) measured the particle size distribution and morphology of smoke from overheated spacecraft materials in microgravity, to support the design of future spacecraft smoke detectors. NASA states that the reflight built on the original SAME flight (Expedition 15) by adding diagnostic measurements and expanding the test matrix. The objective was to make sufficient measurements of smoke from spacecraft fires to enable improved design of future detectors, because current spacecraft detectors were developed from terrestrial designs without spacecraft smoke data.

# Experimental Conditions

SAME-R was conducted in the Microgravity Science Glovebox on the ISS during Expedition 24 (July to September 2010).

- Gravity: microgravity (ISS).
- Smoke generation: materials were heated to temperatures below their ignition point (pyrolysis, not flaming), for approximately 60 seconds per sample. Baseline sample temperatures were material specific, chosen to produce 1 to 2 mg of weight loss in 60 seconds, with additional higher-temperature conditions.
- Airflow past the sample during heating ranged from quiescent to 8 cm/s (0 to 0.08 m/s). The baseline was 8 cm/s, with runs down to 2 cm/s and 11 tests with no airflow.
- Smoke aging: smoke was held in an aging chamber for 11 to 1800 s to simulate transport time from source to detector.
- Materials: the abstract lists five materials (Teflon, Kapton, cotton, silicone rubber and Pyrell); the results section states over 100 samples of six materials, adding dibutyl-phthalate on a porous wick and naming cellulose (lamp wick).
- Typical runs had particle concentrations of a few million particles per cm3 and mass concentrations of 2 to 15 mg/m3.
- Oxygen and pressure are not stated in the sources consulted.

# Variables

Independent variables reported for SAME-R:

- Sample material.
- Sample heating temperature (baseline and higher).
- Air flow past the sample during heating (0, 2 to 8 cm/s).
- Smoke aging time (11 to 1800 s).

Dependent variables: particle number concentration, count mean diameter, diameter of average mass, geometric mean diameter and standard deviation, particle morphology, and smoke detector response.

# Sensors and Measurements

SAME-R used the SAME "moment method": separate instruments measured the zeroth (number), first (diameter) and third (mass) moments of the particle size distribution. Instruments were a TSI P-Trak condensation nuclei counter, an ionization chamber from a residential smoke detector, and a TSI DustTrak light-scattering monitor. For SAME-2, one DustTrak was replaced by the Multi-Parameter Aerosol Scattering Sensor (MPASS), a prototype two-angle optical sensor that measures two moments at once. Space Shuttle and ISS smoke detectors were installed in the diagnostics duct. A thermal precipitator collected 72 particle samples on Transmission Electron Microscope (TEM) grids for post-flight imaging. Instruments were calibrated on the ground before flight.

# Key Findings

- Overall the majority of average smoke particle sizes were in the 200 nm to 400 nm range, with quiescent cases producing some substantially larger particles (abstract).
- Substantial differences in smoke size distributions were found among the spacecraft materials tested (conclusions).
- All samples produced significant numbers of sub-micron particles readily detected by an ionization smoke detector; aging results suggest some materials such as silicone rubber can produce smoke that grows to sizes better detected by light scattering (conclusions).
- Zero-flow conditions produced smoke particles 2 to 3 times larger than those produced at the nominal 8 cm/s flow (conclusions).
- Aging substantially increased observed diameters, mainly by removing the smallest particles through coagulation.
- The prototype two-moment detector (MPASS) reduced the relative variance of its response by roughly a factor of at least 2 compared with a single-output sensor, which the authors describe as showing potential to respond to a broad particle range while avoiding excessive false alarms from nuisance sources such as dust.
- TEM imaging showed liquid-like droplets for lamp wick, silicone rubber and Kapton smoke and fractal-like agglomerates for Teflon and Pyrell; Pyrell smoke changed from clusters at 8 cm/s to spherical particles with no airflow.

# Fire Safety Relevance

Team interpretation: SAME-R extends SAME's microgravity smoke data to more materials, flow conditions and aging times, which matter for where and how quickly smoke reaches a detector in a ventilated or still cabin. The results suggest that early pre-fire overheat smoke in a spacecraft can have a broad size range that depends on material and airflow, so a single-moment detector may miss some events or false-alarm on dust. This is directly relevant to detection design for spacecraft and habitats. SAME-R did not test flaming fires, flame spread or suppression, and all tests were in microgravity; IGNIS does not treat it as direct lunar or Martian evidence.

# Limitations

- Smoke came from overheated (pyrolysing) samples, not flaming fires.
- The number of materials differs within the source: five in the abstract, six (adding dibutyl-phthalate on a wick) in the results section.
- Sample shape, size, oxygen concentration and pressure are not stated in the sources consulted.
- Heating temperatures were material specific and are not tabulated in the sections consulted.
- Zero-flow tests were not in the original hardware design; about half the smoke was lost from the system in those tests.
- The log-normal distribution assumption used for geometric statistics could not be directly tested with the flight data; the 2012 paper gives two indications that it is a reasonable approximation. The fact sheet says later ground tests with a Scanning Mobility Particle Sizer were used to check it, but those results are not in the sources consulted.
- Silicone rubber and dibutyl-phthalate particles were not visible by TEM, presumably because liquid particles evaporated before imaging.

# Source Notes

- ntrs-20130000422: Urban, Ruff, Greenberg, Fischer, Meyer, Mulholland, Yuan, Bryg, Cleary and Yang, "Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2", AIAA 2012-3536, 42nd International Conference on Environmental Systems, July 2012 (NASA Glenn lead authors). Supports Expedition 24 dates, materials, quiescent to 8 cm/s airflow, 11 to 1800 s aging, 60 s heating, baseline temperature rule, concentrations, MPASS, 72 TEM samples, and all Key Findings.
- nasa-fact-sheet: NASA SAME fact sheet, SAME-R section. Supports Expedition 24 (July to September 2010), the five materials, the flight diagnostics (thermal precipitator, aerosol instruments, commercial smoke detector, ISS and Shuttle detectors) and the moment-based statistics.
- The NASA PSI record for SAME-R was not consulted. Member 3 should check it if available.
