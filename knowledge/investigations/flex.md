---
type: Investigation
title: Flame Extinguishment Experiment (FLEX)
shortTitle: FLEX
program: NASA Glenn Research Center ISS combustion research (Combustion Integrated Rack)
description: >-
  ISS droplet combustion experiment in the Combustion Integrated Rack that burned isolated methanol
  and n-heptane droplets in oxygen atmospheres diluted with nitrogen, carbon dioxide or helium, to
  determine the limiting oxygen index and how inert-gas suppressants affect flammability in
  microgravity.
status: draft

safetyCategories:
  - prevention
  - suppression

fuelType: liquid
material: Methanol and n-heptane droplets
sampleShape: Spherical droplet, free-floating or fiber-supported
sampleSize: >-
  Initial droplet diameters of 1.1 to 4.67 mm in the PSI-69 test table (the report summary states 2 to
  5 mm)

oxygenMin: 12.5 # percent O2 by volume
oxygenMax: 34
pressureMin: 70.2 # kPa
pressureMax: 309.3
airflowMin: null # m/s
airflowMax: null

gravityCondition: microgravity
gravityValue: null

platform: International Space Station (Destiny module)
hardware:
  - Combustion Integrated Rack (CIR)
  - Multi-User Droplet Combustion Apparatus (MDCA)
sensors:
  - High-Bit-Depth Multispectral (HiBMs) backlit camera
  - Low Light Level Ultra-Violet (LLUV) camera, 310 nm OH* chemiluminescence filter
  - MDCA color camera
  - MDCA radiometers (data not reported; insufficient sensitivity)
  - CIR chamber pressure and gas composition records
measurements:
  - Droplet diameter history
  - Flame diameter history
  - Burning-rate constant
  - Extinction droplet diameter (radiative and diffusive extinction)
  - Limiting oxygen index (LOI)
variables:
  - Fuel (methanol or n-heptane)
  - Initial droplet diameter
  - Ambient pressure
  - Oxygen mole fraction
  - Diluent type and amount (nitrogen, carbon dioxide, helium, mixtures)
  - Free-floating versus fiber-supported droplet, with optional fiber translation

tags:
  - combustion
  - microgravity
  - droplet-combustion
  - liquid-fuel
  - extinction
  - limiting-oxygen-index
  - inert-gas-suppression
  - cool-flames

sources:
  - id: ntrs-20150023456
    resource: https://ntrs.nasa.gov/citations/20150023456
    title: >-
      Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011
      (Dietrich et al., NASA/TP-2015-216046)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: psi-69
    resource: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-69"
    title: NASA PSI investigation record PSI-69 (FLEX)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/mdca
    relation: uses-hardware
  - id: hardware/cir
    relation: uses-hardware
    note: MDCA is an insert in the CIR combustion chamber
  - id: investigations/flex-2
    relation: follow-on
    note: FLEX-2 used the same CIR/MDCA hardware for a wider range of fuels and droplet interactions
  - concepts/suppression
  - concepts/prevention
  - concepts/droplet-combustion

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Objective

FLEX (Flame Extinguishment Experiment) studied the combustion of isolated liquid fuel droplets in microgravity aboard the International Space Station. NASA's Researcher's Guide states that the objective was to study heptane and methanol droplets in ambient mixtures of oxygen and nitrogen diluted with a second inert gas, and to examine how adding an inert-gas suppressant influences the flammability limit of the two fuels, with the application being an improved quantitative understanding of how flammability limits change in reduced gravity as it relates to fire safety. The FLEX technical paper states that a principal objective was to determine the limiting oxygen index (LOI), the oxygen percentage below which combustion would not occur, reflecting the FLEX focus on spacecraft fire safety.

# Experimental Conditions

FLEX ran in the Multi-User Droplet Combustion Apparatus (MDCA) inside the chamber of the Combustion Integrated Rack (CIR) in the ISS Destiny module. The technical paper documents the first 284 tests, from March 2009 to December 2011, run remotely from the Telescience Support Center at NASA Glenn.

- Gravity: microgravity (ISS).
- Fuels: methanol and n-heptane.
- Droplets: initial diameters of 1.1 to 4.67 mm in the PSI-69 test table (the report summary states 2 to 5 mm); free-floating, or tethered on an 80 um support fiber that could be translated after ignition.
- Pressure: the PSI-69 test table lists ambient pressures from 526.3 to 2319.9 mmHg (70.2 to 309.3 kPa), used in the frontmatter. The report summary states 0.70 to 3.05 atm (70.9 to 309.0 kPa), and its Table VI lists one test at 0.69 atm; most tests were between 0.7 and 1 atm.
- Oxygen: the PSI-69 test table lists initial oxygen mole fractions from 0.12 to 0.34 (two decimal places); the report tables give the lowest value as 0.125, so the frontmatter range is 12.5% to 34%. The report's Table III lists tests 019 to 023 at 0.400 oxygen, but PSI-69 lists the same tests at 0.34, as do the report's own figure captions for the 0.7 atm nitrogen-diluted tests (see Limitations).
- Diluents: oxygen diluted with nitrogen, with carbon dioxide, and with mixtures. PSI-69 also lists 50 tests from September to December 2011 with helium in the initial ambient (helium mole fraction up to 0.45, about 1 atm, oxygen 0.13 to 0.24); these are not in the report's test matrices. Carbon-dioxide-diluted tests were run in a 1.0 atm, initially 0.21 oxygen environment and a 0.70 atm, 0.30 oxygen environment, which the report describes as representing the nominal ISS environment and the ISS EVA pre-breathe environment and maximum proposed oxygen on future exploration vehicles.
- Ambient temperature: ambient (no numeric value stated in the summary).
- Airflow: droplets burned in a quiescent atmosphere unless the fiber was translated. The report's figure captions give fiber translation speeds of about 3 mm/s and free-droplet drift speeds of up to about 8 mm/s; a Researcher's Guide figure shows a FLEX droplet in a carbon-dioxide-diluted ambient translated at 3 cm/s. No source gives a test-matrix airflow range, so the airflow fields are null.

# Variables

Independent variables reported for FLEX:

- Fuel (methanol or n-heptane).
- Initial droplet diameter.
- Ambient pressure.
- Oxygen mole fraction.
- Diluent type and amount: nitrogen, carbon dioxide, or mixtures. Testing typically started at the highest oxygen level and added diluent until quasi-steady burning was no longer observed, which defined the LOI.
- Droplet mounting: free-floating, or fiber-supported with a brief translation of the fiber.

Dependent variables: droplet diameter history, flame diameter history, burning-rate constant, extinction droplet diameter, extinction mode (radiative, diffusive or disruptive) and the LOI.

# Sensors and Measurements

FLEX diagnostics were provided mainly by the CIR facility and the MDCA:

- High-Bit-Depth Multispectral (HiBMs) camera with backlit illumination, used to measure droplet diameter versus time.
- Low Light Level Ultra-Violet (LLUV) camera with a filter centred at 310 nm to image OH* chemiluminescence, giving a flame diameter.
- MDCA color camera giving an overview of flame size, shape and color.
- MDCA radiometers (broadband and water-vapour band); the report states they were not sensitive enough to give reliable quantitative data for these tests, so their data are not reported.
- CIR records of chamber pressure and gas composition.

The report states that color-camera flame diameters are approximately three-fourths of the LLUV flame diameters.

# Key Findings

- More than 100 useful combustion histories were obtained from the first 284 tests (March 2009 to December 2011), with droplet and flame diameter histories, burning-rate constants and extinction diameters catalogued (NASA/TP-2015-216046).
- Observed limiting oxygen index values for methanol and heptane appear slightly lower than initially expected (technical paper summary).
- NASA's Researcher's Guide states the experiments identified an LOI that is significantly lower than in normal gravity and lower than previously predicted, and that the flammability limit is lower in reduced gravity; it states the implication that terrestrial standards for inert-gas suppressants in low gravity do not offer the same margin of safety as in normal gravity.
- Both radiative extinction (at higher dilutions) and diffusive extinction (at lower dilutions) were documented for both fuels, along with disruptive extinctions; the results also provided information on soot production for heptane.
- For large heptane droplets, after the visible hot flame underwent radiative extinction, the droplet continued to vaporize, supported by a low-temperature "cool flame" that was not visible; NASA describes this as the most significant observation from these experiments.

# Fire Safety Relevance

Team interpretation: FLEX is direct microgravity evidence that liquid-fuel flames can be sustained at lower oxygen levels than normal-gravity limits suggest, and that inert-gas suppressants (nitrogen, carbon dioxide) may need higher concentrations in microgravity to achieve the same margin of safety. This is relevant to suppression (sizing inert-gas or carbon dioxide systems) and to prevention (cabin oxygen limits, including the elevated-oxygen, reduced-pressure atmospheres proposed for exploration vehicles). The observation of invisible cool flames after visible extinction suggests that a fire which appears extinguished may still be reacting. These are single-droplet results in microgravity; they do not directly describe pool, spray or solid-material fires, or partial-gravity environments, and IGNIS does not treat them as direct lunar or Martian evidence.

# Limitations

- The technical paper explicitly does not interpret its data; the LOI and margin-of-safety statements come from the higher-level NASA Researcher's Guide.
- Droplet needles in these tests had a conformal coating that partly dissolved into some droplets; the report states disruptive extinction of methanol is probably due to this contaminant and that disruptive extinction of heptane may be, while burning rates and radiative extinction diameters were minimally or not influenced.
- The MDCA radiometer data were not reliable enough to report, so no flame radiant output is given for these tests.
- Individual LOI values are not summarised in the sections consulted; per-test values are in the report's appendix tables and data DVD.
- Oxygen conflict: the report's Table III lists tests 019 to 023 at 0.400 oxygen and 0.600 nitrogen, while PSI-69 lists the same tests (same dates and fuels) at 0.34 oxygen and 0.66 nitrogen. Following the IGNIS source ranking, PSI-69 is used and the oxygen maximum is 34%, not 40%. The 40% figure in the Researcher's Guide is the MDCA facility capability, not a FLEX test condition.
- Pressure conflict: the PSI-69 range (70.2 to 309.3 kPa) is used over the report summary (70.9 to 309.0 kPa). One PSI-69 row (test 114) lists a pressure of 0 mmHg and was excluded as a data-entry gap.
- The report's title covers March 2009 to December 2011, but its text says it archives results to December 2010 and its test matrices end in December 2010. The 2011 tests, including the helium tests, appear only in PSI-69.
- PSI-69 also names sulfur hexafluoride (SF6) as a suppressant of interest in its objectives, but no SF6 column or test appears in its table.
- Tests are single, isolated droplets of two pure fuels (methanol, n-heptane) only.
- All tests were in microgravity; no partial-gravity conditions were tested.

# Source Notes

- ntrs-20150023456: Dietrich, Ferkul, Bryg, Nayagam, Hicks, Williams, Dryer, Shaw, Choi and Avedisian, "Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011", NASA/TP-2015-216046, November 2015. Supports hardware, diagnostics, procedures, the 284 tests, fuels, 2 to 5 mm droplets, 0.70 to 3.05 atm, diluents, the oxygen mole fractions in Tables I to VIII (0.125 to 0.400), the LOI summary statement, extinction modes, contamination caveats, and the conclusion of more than 100 useful histories.
- researchers-guide-combustion: NASA ISS Program Science Office, "A Researcher's Guide to: Combustion Science" (NP-2015-10-034-JSC). Supports the FLEX objective and the inert-gas diluents named (nitrogen, carbon dioxide, helium or xenon), the statements that the flammability limit and LOI are lower in reduced gravity, the suppressant margin-of-safety implication, the cool flame finding, and the MDCA facility description.
- Pressure conversion: PSI-69 values in mmHg converted at 0.133322 kPa per mmHg (526.3 mmHg = 70.2 kPa; 2319.9 mmHg = 309.3 kPa); report values in atm converted at 101.325 kPa per atm.
- psi-69: NASA PSI record for FLEX. Supports the objectives (flammability limits, suppressant effectiveness, LOI as a function of pressure), the LOI test procedure, the slow translation tests, and the 275-row test table (March 2009 to December 2011) used for the pressure, oxygen, droplet diameter and helium values.
