---
type: Investigation
title: Cool Flames Investigation (CFI)
shortTitle: CFI
program: NASA Glenn Research Center ISS droplet combustion (MDCA)
description: >-
  ISS droplet combustion investigation in the MDCA that set out to study the low-temperature "cool
  flame" burning and extinction of alkane, bio-fuel and surrogate fuel droplets that follows hot
  flame extinction in microgravity.
status: stable

safetyCategories: []

fuelType: liquid
material: >-
  Planned: n-dodecane, farnesane (2,6,10-trimethyldodecane), dodecane/iso-alkane mixtures and
  other surrogate fuel mixtures
sampleShape: Spherical droplet (free or fiber-supported)
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
  - Multi-User Droplet Combustion Apparatus (MDCA)
sensors: []
measurements:
  - Droplet size history
  - Hot flame and cool flame burning and extinction
variables:
  - Fuel composition
  - Ambient pressure
  - Ambient oxygen concentration
  - Diluent (nitrogen, xenon, helium)

tags:
  - combustion
  - microgravity
  - droplet-combustion
  - cool-flames
  - liquid-fuel

sources:
  - id: grc-cfi-scr-2014
    resource: https://www1.grc.nasa.gov/wp-content/uploads/CFI_SCR_May_2014_Dietrich_v1.pdf
    title: Cool Flame Investigation - Science Concept Review, Objectives and Requirements Definition (NASA Glenn, May 2014)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20150023100
    resource: https://ntrs.nasa.gov/citations/20150023100
    title: NASA Microgravity Combustion Program (Urban, NASA Glenn, October 2015)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: iss-daily-2017-01-24
    resource: https://www.nasa.gov/blogs/stationreport/2017/01/24/iss-daily-summary-report-1-24-2017/
    title: ISS Daily Summary Report, 24 January 2017 (NASA)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/mdca
    relation: uses-hardware
  - id: hardware/cir
    relation: uses-hardware
  - id: investigations/flex
    relation: predecessor
    note: CFI follows from the cool flames first observed in FLEX droplet tests
  - id: investigations/flex-2
    relation: shares-hardware
  - id: investigations/acme-cfi-g
    relation: follow-on
    note: CFI-G studied cool flames with gaseous fuels on spherical burners
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

The Cool Flames Investigation (CFI) was designed to use the quasi-steady burning and extinction of cool flames, first observed in FLEX microgravity droplet tests, to further understanding of low-temperature combustion chemistry. NASA's 2014 science concept review lists three objectives: understand the combustion of normal alkanes in the low-temperature region with droplet tests in low gravity; investigate the low-temperature burning of pure fuels, bio-fuel constituents and surrogate fuels to relate cool-flame behaviour to octane and cetane behaviour; and explore low-temperature chemistry with fuel additives (ground-based only). NASA's 2017 station report describes CFI as giving new insight into fuels that burn very hot, appear to go out, and keep burning at a much lower temperature with no visible flame, which helps develop engines and fuels that are more efficient and less harmful to the environment.

# Experimental Conditions

CFI used the Multi-User Droplet Combustion Apparatus (MDCA) in the Combustion Integrated Rack (CIR). A NASA ISS daily report states the crew completed the MDCA reconfiguration to the CFI setup on 24 January 2017, replacing needles, igniters, the fiber arm and fuel reservoirs.

The values below are planned requirements from the 2014 science concept review and the 2015 program overview, not reported test conditions, so the frontmatter test fields are left null:

- Planned fuels: n-dodecane; farnesane (2,6,10-trimethyldodecane); n-dodecane mixtures with farnesane or 2,2,4,6,6-pentamethylheptane; n-dodecane/iso-octane/n-propyl benzene/1,3,5-trimethyl benzene mixtures; n-heptane/iso-octane mixtures.
- Planned pressure: 0.5 to 3.0 atm required, up to 5 atm desired (2014); the 2015 overview gives 0.50 to 5.0 atm.
- Planned oxygen mole fraction: 0.10 to 0.40, similar to FLEX.
- Planned diluents: primarily nitrogen, with helium and xenon (2014); the 2015 overview names nitrogen and xenon.
- Planned hardware changes: support fiber reduced from 80 um to 40 um, and the droplet-imaging field of view increased from 30 mm (FLEX) to 50 mm.
- Expected timeline per test: droplet deployment (~10 s), hot-flame burning (5 to 10 s), hot-flame extinction, cool-flame burning (5 to 60 s), cool-flame extinction.

# Variables

Planned independent variables: fuel composition, ambient pressure, ambient oxygen mole fraction and diluent type. Planned dependent variables: droplet size, droplet dynamics, soot volume fraction, hot-flame and cool-flame burning and extinction.

# Sensors and Measurements

The sources consulted give requirements, not the as-flown diagnostics. The 2014 review states there was no way to image cool flames with the CIR/MDCA cameras at the time and that cool flames were expected to be about half the size of the hot flame; the 2015 overview states cool flames are invisible to the CIR cameras as configured and that an intensified camera was being used to visualize them. The as-flown sensor list is therefore left empty.

# Key Findings

- No CFI flight results were found in the NASA sources consulted for this draft.
- Background (from FLEX, not CFI): NASA's 2014 review states that cool flames were prevalent in FLEX experiments and are a strong function of ambient pressure, ambient oxygen and diluent, and fuel composition.

# Fire Safety Relevance

Team interpretation: CFI is fundamental combustion research aimed at engine chemistry, and NASA does not state a fire-safety objective for it, so this draft assigns no safety category. Its indirect relevance is the same as for FLEX cool flames: a liquid fuel can keep reacting with no visible flame after the hot flame goes out. Without flight results, this record cannot support any scenario-specific evidence.

# Limitations

- No flight results were found; the record describes the planned investigation and confirms only that the MDCA was configured for CFI in January 2017.
- All conditions listed are pre-flight requirements and may differ from what was flown.
- The planned pressure and diluent lists differ slightly between the 2014 and 2015 sources.
- Until a NASA CFI results source is found, this record documents the planned investigation only and supports no findings.

# Source Notes

- grc-cfi-scr-2014: NASA Glenn Science Concept Review, May 2014. Supports the objectives, planned fuels, 0.5 to 3.0 atm (up to 5 atm desired), 0.10 to 0.40 oxygen, nitrogen, helium and xenon diluents, the 40 um fiber, the 30 mm to 50 mm field of view, the test timeline, the cool-flame imaging gap, and the FLEX cool-flame background statements.
- ntrs-20150023100: Urban, "NASA Microgravity Combustion Program", October 2015. Supports the CFI science team, fuels (dodecane, farnesane, dodecane/iso-dodecane), 0.50 to 5.0 atm, nitrogen and xenon dilution, and invisibility of cool flames to CIR cameras.
- iss-daily-2017-01-24: NASA ISS Daily Summary Report. Supports the January 2017 MDCA reconfiguration for CFI and the stated purpose.
- Member 3 should check the NASA PSI repository and NTRS for CFI results before verification.
