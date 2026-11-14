---
type: Investigation
title: Burning and Suppression of Solids (BASS)
shortTitle: BASS
program: NASA Space Life and Physical Sciences Research and Applications (SLPSRA)
description: >-
  ISS investigation in the Microgravity Science Glovebox that burned thin and thick flat samples,
  acrylic spheres and wax candles in a small flow tunnel to study flame spread, flame dynamics and
  extinction, including extinction attempts with a nitrogen jet.
status: draft

safetyCategories:
  - prevention
  - suppression

fuelType: solid
material: >-
  SIBAL cotton-fiberglass fabric blend; Nomex; Ultem; PMMA (acrylic); wax-saturated fiberglass
  fabric; paraffin and Japan wax candles
sampleShape: Thin flat sheets, thick flat slabs, solid spheres, candles within ceramic tubes
sampleSize: >-
  Thin flat 12 cm long by 1 and 2 cm wide; thick flat 5 cm long by 1 cm wide by 1 and 2 mm thick;
  PMMA spheres 1 and 2 cm diameter; candle tube 6 mm diameter by 25 mm long

oxygenMin: 17 # percent O2 by volume
oxygenMax: 22
pressureMin: 101.325 # kPa
pressureMax: 101.325
airflowMin: 0 # m/s
airflowMax: 0.4

gravityCondition: microgravity
gravityValue: null

platform: International Space Station
hardware:
  - Microgravity Science Glovebox (MSG)
  - Smoke Point In Co-flow Experiment (SPICE) hardware, slightly modified for solid samples
sensors:
  - Video camera
  - Digital still camera
  - Anemometer
  - Radiometer
measurements:
  - Flame shape and appearance as a function of flow speed
  - Flame spread rate
  - Flame dynamics (pulsations, oscillations)
  - Time to extinction
  - Fuel burning (regression) rate for spheres
variables:
  - Forced airflow speed (main variable)
  - Flow direction (opposed or concurrent)
  - Fuel type
  - Fuel thickness and geometry
  - Nitrogen suppressant flow rate
  - Flame distance from the nitrogen nozzle

tags:
  - combustion
  - microgravity
  - solid-material
  - flame-spread
  - extinction
  - nitrogen-suppression

sources:
  - id: nasa-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf
    title: Burning and Suppression of Solids (BASS) fact sheet (NASA; also covers BASS-II and BASS-M)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20140011099
    resource: https://ntrs.nasa.gov/citations/20140011099
    title: >-
      Thickness and Fuel Preheating Effects on Material Flammability in Microgravity from the BASS
      Experiment (Ferkul et al., ASGSR 2013 presentation)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: psi-26
    resource: "https://psi.nasa.gov/physci/repo/data/investigations/PSI-26"
    title: NASA PSI investigation record PSI-26 (BASS)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: investigations/bass-ii
    relation: follow-on
    note: BASS-II reused the same modified SPICE flow tunnel in the MSG and added oxygen vitiation as a main variable
  - id: hardware/msg
    relation: uses-hardware
  - id: investigations/spice
    relation: shares-hardware
    note: BASS used slightly modified on-orbit SPICE hardware
  - concepts/prevention
  - concepts/suppression
  - concepts/flame-spread

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Objective

BASS (Burning and Suppression of Solids) examined the burning and extinction characteristics of a wide variety of solid fuel samples in microgravity aboard the International Space Station. NASA states that BASS tests the hypothesis that materials in microgravity, with adequate ventilation, burn as well if not better than the same material in normal gravity with other conditions identical (pressure, oxygen concentration, temperature). The experiment was intended to guide strategies for extinguishing accidental fires in microgravity, and its results contribute to combustion models used in the design of fire detection and suppression systems.

# Experimental Conditions

BASS ran inside the sealed Microgravity Science Glovebox (MSG) on the ISS using slightly modified Smoke Point In Co-flow Experiment (SPICE) hardware: a small flow duct with a fan, an igniter and a small nitrogen nozzle.

- Gravity: microgravity (ISS).
- Oxygen: the results presentation states ambient oxygen atmospheres of 17% to 21.5% (cabin air); its material-flammability results slide reports tests at 21% to 22% O2. Nitrogen vitiation of the working volume is described as available "down to 16% O2". The oxygen range in the frontmatter (17 to 22) spans the two stated values.
- Pressure: test captions in the results presentation state 1 atm (converted to 101.325 kPa). Pressure was not a test variable.
- Airflow: the results presentation states the tunnel could impose airflow speeds up to 40 cm/s (0.4 m/s), and some tests reduced the flow to zero. The NASA fact sheet describes crew adjustment of airflow from 5 to 50 cm/s. The frontmatter uses the results presentation range (0 to 0.4 m/s).
- Samples: 41 fuel samples in three categories according to the fact sheet (flat, solid spheres, candles within tubes); the results presentation lists thin flat (17), spheres (12), thick flat (4) and candles (8), with 115 burns completed.
- Thin flat samples were 12 cm long by 1 and 2 cm wide (SIBAL cotton-fiberglass fabric as the principal thin fuel, plus Nomex and Ultem). Thick flat samples were 5 cm long by 1 cm wide by 1 and 2 mm thick (PMMA and wax-saturated fiberglass fabric). PMMA spheres were 1 and 2 cm in diameter. Candles were in a thin ceramic tube 6 mm in diameter by 25 mm long, using paraffin and "Japan wax".
- Suppression: a nitrogen suppressant was supplied through a mass flow controller from 0 to 500 cc/min.

# Variables

Independent variables reported for BASS:

- Forced airflow speed, described in the results presentation as the main variable.
- Flow direction relative to flame spread: opposed flow and concurrent flow.
- Fuel type (SIBAL fabric, Nomex, Ultem, PMMA, wax-saturated fabric, paraffin and Japan wax).
- Fuel thickness and geometry (thin flat, thick flat, sphere, candle).
- Nitrogen suppressant flow rate and the flame's distance from the nozzle, for suppression tests.

Dependent variables (outcomes) reported: flame shape and appearance, flame spread rate, flame dynamics, time to extinction, and fuel burning rate.

# Sensors and Measurements

BASS measurements came mainly from imaging, with supporting flow and radiation sensors:

- Video camera and digital still camera; the results presentation states these "provided bulk of the data" and that flame appearance, behavior, spread rate and extinction dynamics were measured from them.
- Anemometer to measure the actual flow rate in the duct.
- Radiometer to measure flame output.
- A mass flow controller set the nitrogen suppressant flow (0 to 500 cc/min).

Video was downlinked during or immediately after each test; stored images and data were returned to Earth for analysis.

# Key Findings

- Microgravity flames were found to be especially sensitive to air flow speed in the range 0 to 5 cm/s (results presentation summary).
- At the lowest speeds examined (less than 1 cm/s) all the flames tended to become dim blue and very stable; heat loss at these very low convective rates is small so the flames can burn for a long time.
- For thin fabric in opposed flow, the flame quickly reached steady spread and the spread rate was fastest at an intermediate flow speed. In concurrent flow, spread rate increased linearly with increasing flow and quenching extinction was observed around 1 cm/s.
- At about 10 cm/s, concurrent spread over the thin fabric was 2.55 mm/s versus 1.21 mm/s for opposed spread (single comparison shown in the results presentation).
- Ultem and Nomex HT90-40 samples did not burn in the ISS atmosphere (21% to 22% O2, flow around 15 cm/s), described as similar to 1-g behaviour with the note that ISS samples were narrower; a Nomex-III sample did burn.
- Thicker solids can store a great deal of heat even with only a small flame; extinction with the nitrogen jet was not possible for the given flow rate. In one wake-configuration sphere test, a nitrogen flow of 500 cc/min weakened but did not extinguish the flame.
- Only the smallest flames burning acrylic slabs appeared to be adversely influenced by solid conductive heat loss, but even these burned for over 5 minutes before self-extinguishing. The presenters state this has implications for spacecraft fire safety because a tiny flame might be undetected for a long time and could flare up if air convection suddenly increases.

# Fire Safety Relevance

Team interpretation: BASS is direct microgravity evidence about how small solid-material fires behave in low-speed forced airflow, which is the regime of a ventilated spacecraft cabin. The findings that small flames can persist for minutes at very low flow, and can intensify when flow increases, are relevant to prevention (material selection and ventilation design) and to suppression (a nitrogen jet did not always extinguish flames over thick, heat-soaked fuel). The evidence is from ISS microgravity only; it does not directly represent lunar or Martian partial gravity, and IGNIS does not treat it as a direct match for those environments.

# Limitations

- The results source is a conference presentation (ASGSR 2013), not a peer-reviewed final report; several results are shown as single examples or image sequences rather than tabulated data.
- Airflow ranges differ between sources: up to 40 cm/s in the results presentation versus 5 to 50 cm/s in the NASA fact sheet.
- Oxygen values differ between slides: 17% to 21.5% (approach slide) versus 21% to 22% (material flammability slide). The oxygen level of each individual test is not tabulated in the cited sources.
- Pressure is stated as 1 atm only in individual test captions; it was not varied.
- Sample sizes are small (centimetre scale), so results describe small flames, not large-scale spacecraft fires.
- All tests were in microgravity; no partial-gravity (lunar or Martian) conditions were tested.
- Nitrogen suppression was tested only at the hardware's limited flow rate (up to 500 cc/min); the sources do not give general suppressant requirements.
- The results presentation mentions nitrogen vitiation down to 16% O2, but the BASS-II summary report states BASS-II was the first ISS use of MSG nitrogen dilution; the frontmatter therefore uses only the stated BASS test values (17% to 22%).

# Source Notes

- nasa-fact-sheet: NASA fact sheet PDF covering BASS, BASS-II and BASS-M. Supports the objective, hypothesis, hardware (modified SPICE in MSG), sample counts and dimensions, materials, 5 to 50 cm/s airflow adjustment, 0 to 500 cc/min nitrogen flow, anemometer and radiometer, and the list of observations (flame shape, spread rate, dynamics, time to extinction). It contains no BASS results section.
- ntrs-20140011099: Ferkul, Olson, Takahashi, Endo, Johnston and T'ien, "Thickness and Fuel Preheating Effects on Material Flammability in Microgravity from the BASS Experiment", presented at the ASGSR 2013 Annual Meeting, supported by NASA SLPSRA. Supports 17% to 21.5% O2 cabin air, up to 40 cm/s airflow, 1 atm in captions, 41 samples and 115 burns, all Key Findings bullets, and the camera-based measurement approach.
- The NASA PSI repository lists this investigation as PSI-26 (confirmed via the PSI search index); the full PSI record was not read. Member 3 should check it if available.
