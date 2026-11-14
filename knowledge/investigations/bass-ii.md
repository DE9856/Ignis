---
type: Investigation
title: Burning and Suppression of Solids - II (BASS-II)
shortTitle: BASS-II
program: NASA Space Life and Physical Sciences Research and Applications (SLPSRA)
description: >-
  Follow-on ISS investigation in the Microgravity Science Glovebox that burned acrylic (PMMA) films,
  slabs, rods and a spherical section and cotton-fiberglass fabric in a small flow tunnel, varying
  airflow speed and direction and reducing ambient oxygen by nitrogen vitiation, to measure flame
  spread and extinction limits for comparison with normal-gravity material screening.
status: draft

safetyCategories:
  - prevention

fuelType: solid
material: >-
  PMMA (acrylic) films, sheets and slabs, black and clear PMMA rods, PMMA spherical section; SIBAL
  cotton-fiberglass fabric (75% cotton, 25% fiberglass)
sampleShape: Thin and thick flat samples, cylindrical rods, section of a large solid sphere
sampleSize: >-
  PMMA rods 6.35 to 12.7 mm diameter; PMMA slabs 0.125 to 5 mm thick; section of a 4 cm diameter
  sphere; flat samples 1 or 2 cm wide (SIBAL fabric 1.2 or 2.2 cm wide, 10 cm exposed length)

oxygenMin: 14 # percent O2 by volume
oxygenMax: 21
pressureMin: 99.2 # kPa
pressureMax: 101.325
airflowMin: 0 # m/s
airflowMax: 0.55

gravityCondition: microgravity
gravityValue: null

platform: International Space Station
hardware:
  - Microgravity Science Glovebox (MSG)
  - Smoke Point In Co-flow Experiment (SPICE) hardware, slightly modified (small flow tunnel)
sensors:
  - Color video camera with data overlay (Panasonic WV-CP654)
  - Digital color still camera (Nikon D300s)
  - Omnidirectional airspeed transducer (TSI 8475)
  - Thermopile radiometer (Oriel 71768)
  - Compound Specific Analyzer-Combustion Products (CSA-CP), O2 and CO
  - Carbon Dioxide Monitor (CDM), CO2
measurements:
  - Flame shape and appearance
  - Flame growth and flame spread rate
  - Extinction limits (quenching and blowoff)
  - Ignition delay time
  - Solid fuel regression rate (rods)
  - O2 depletion and CO and CO2 production per test
  - Heat release rate (oxygen consumption calorimetry)
  - Sample mass loss (returned samples)
variables:
  - Forced flow velocity (speed and direction - opposed or concurrent)
  - Ambient oxygen concentration (via nitrogen vitiation of the MSG working volume)
  - Fuel type
  - Fuel thickness
  - Sample geometry (rods, spherical section, slabs, films, fabric sheets)
  - Degree of internal heating (fuel preheating)

tags:
  - combustion
  - microgravity
  - solid-material
  - flame-spread
  - extinction
  - flammability-limits
  - oxygen-concentration

sources:
  - id: ntrs-20210011385
    resource: https://ntrs.nasa.gov/citations/20210011385
    title: Burning and Suppression of Solids-II (BASS-II) Summary Report (Olson et al., NASA/TM-20210011385, 2021)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: nasa-fact-sheet
    resource: https://www.nasa.gov/wp-content/uploads/2025/07/burning-and-suppression-of-solids-bass.pdf
    title: Burning and Suppression of Solids (BASS) fact sheet (NASA; BASS-II section)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20160000593
    resource: https://ntrs.nasa.gov/citations/20160000593
    title: >-
      Combustion of Solids in Microgravity: Results from the BASS-II Experiment (Ferkul et al., ASGSR
      2014 poster)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: investigations/bass
    relation: predecessor
    note: BASS-II used the same modified SPICE flow tunnel in the MSG and extended BASS with oxygen vitiation
  - id: hardware/msg
    relation: uses-hardware
  - id: investigations/spice
    relation: shares-hardware
    note: BASS-II used slightly modified SPICE hardware
  - concepts/prevention
  - concepts/flame-spread
  - concepts/material-flammability-screening

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Objective

BASS-II (Burning and Suppression of Solids - II) examined the burning and extinction characteristics of a wide variety of solid fuel samples in microgravity aboard the International Space Station. The results poster lists the objectives as studying ignition, flame growth, flame spread and extinction limits for solid fuels burning in low-velocity forced flows in microgravity, and beginning to bridge the gap between the normal-gravity NASA-STD-6001 Test #1 method, ground-based microgravity tests and actual material flammability in microgravity. NASA states that one objective is to identify the worst case for material flammability in spacecraft environments and compare it with the terrestrial upward-burning test used to screen materials, and that many tests focus on finding a minimum oxygen concentration or flow velocity at which a material will burn in space.

# Experimental Conditions

BASS-II ran inside the sealed Microgravity Science Glovebox (MSG) in the ISS Destiny Lab. The hardware was a black anodized 7.6 by 7.6 by 17 cm rectangular flow duct, originally built for gas jet diffusion flame studies (SPICE) and adapted for solid samples, with a variable-speed fan, honeycomb flow straightener and a 17 cm test section. The NASA summary report states that 126 tests were conducted, more than the planned 103, because some samples were burned more than once.

- Gravity: microgravity (ISS).
- Oxygen: for the first time on the ISS, the MSG working volume was diluted with ISS gaseous nitrogen. The summary report states O2 concentrations were varied from ambient ISS levels (about 21% O2) down to about 14% O2 for very near-limit flames; this range (14 to 21) is used in the frontmatter. Dilution typically took 1 to 3 hours per target level, and O2 decreased during each burn.
- Pressure: not a test variable. One sub-study reports total pressure of 99.2 to 99.5 kPa in its tests, and others state 1 atm (101.325 kPa); the frontmatter range spans these stated values.
- Airflow: with no flow restrictors the maximum duct flow velocity was about 55 cm/s, reduced to about 35 cm/s with two restrictors; the rod sub-study states 0 to 55 cm/s flows. The frontmatter uses 0 to 0.55 m/s. Flow could be opposed or concurrent to flame spread.
- Samples: cast PMMA rods of 6.35 to 12.7 mm diameter (clear and black), PMMA slabs 0.125 to 5 mm thick, a section of a 4 cm diameter PMMA sphere, and flat cotton-fiberglass (SIBAL, 75% cotton / 25% fiberglass) fabric. Flat samples were 1 or 2 cm wide; one sub-study gives SIBAL widths of 1.2 and 2.2 cm with a 10 cm exposed length.
- Ignition: a Kanthal A-1 29-gauge hot-wire igniter coil deployed manually by the crew.

# Variables

Independent variables reported for BASS-II:

- Forced flow velocity, both speed and direction (opposed flow and concurrent flow).
- Ambient oxygen concentration, reduced below 21% by nitrogen vitiation of the MSG working volume.
- Fuel type (PMMA and SIBAL fabric), fuel thickness, and sample geometry (rods, spherical section, slabs, films, fabric sheets).
- Degree of internal heating of a thick fuel, listed in one sub-study objective.

Dependent variables (outcomes): flame appearance, flame growth, flame spread rate, ignition delay, solid fuel regression rate, quenching and blowoff extinction limits, O2 consumption, CO and CO2 production, heat release rate and sample mass loss.

# Sensors and Measurements

BASS-II measurements came mainly from imaging plus onboard gas sensors:

- A Nikon D300s 12.3-megapixel digital color still camera viewed the sample through the top window; a Panasonic WV-CP654 color video camera viewed through the front window with an overlay of N2 flow rate, fan voltage, airspeed and radiometer signal.
- An omnidirectional airspeed transducer (TSI 8475) measured steady-state duct flow (response time about 1 minute); fan voltage was calibrated against it at the end of each operations day.
- An Oriel 71768 thermopile radiometer viewed the flame; its signal was not calibrated but indicated flame dynamics and steadiness.
- The Compound Specific Analyzer-Combustion Products (CSA-CP) measured O2 (0.1% resolution) and CO (0 to 1,000 ppm, 1 ppm resolution), and the Carbon Dioxide Monitor (CDM) measured CO2 (0 to 5%, 0.1% resolution), before and after each test. The O2 sensor offset was corrected daily using the ISS Major Constituents Analyzer.
- Heat release rate was estimated from O2 consumption and burn time using 13.1 kJ per gram of O2 consumed (Huggett's constant).
- Burned samples were returned to Earth and weighed for mass loss.

# Key Findings

- BASS-II tests produced data on how ambient oxygen, ventilation and fuel affect combustion; with microgravity data, scientists determined thin and thick fuel spread rates and a formula for the transition from thin to thick fuels (NASA fact sheet, Science Results).
- NASA reports that models predict higher spread rates than observed, so models need improvement; data also allowed calculation of combustion completeness, heat release rates and fuel-to-oxygen global equivalence ratios and supported theoretical models for quenching boundaries.
- For a 1/4 in PMMA rod, the 1-g blowoff limit is at 16% oxygen, whereas steady spreading was obtained at 13.6% oxygen in BASS-II; the investigators state the material has a negative oxygen margin of safety of 2.4% O2 and that normal-gravity flammability limits should be de-rated by at least that much.
- The minimum oxygen in the PMMA rod flammability boundary occurs at low flow speed, on the order of diffusive flows.
- Flames are quite sensitive to air flow speed in the range 0 to 5 cm/s; they can be sustained at very low flow speeds of less than 1 cm/s, when they become dim blue and stable, but can flare up quickly with a sudden increase in air flow speed (NTRS abstract).
- For a 0.1 mm thick PMMA sample, radiative quenching was shown when opposed flow velocity went below 2 cm/s, and the flame neared blowoff extinction as flow velocity crossed 40 cm/s.
- For PMMA rods, flame spread rate decreased as sample diameter increased in both 1-g and microgravity tests, 1-g spread rates were higher than microgravity rates, and in microgravity spread rate increased with oxygen concentration (16% to 21%) when averaged over the tested flow velocities.
- For narrow SIBAL fabric samples in purely forced concurrent flow, the investigators report that steady spread with a limiting flame length can be readily observed in microgravity, along with low-speed quenching extinction.
- Sensor data showed O2 burning nearly stoichiometrically to CO2 for PMMA; CO levels appeared to depend on geometry and, in some cases, flow velocity. CO to CO2 ratios were an order of magnitude higher than for efficient flue gases, indicating the flames were not efficient (summary report).
- Most tests released well below 100 W of heat (oxygen consumption calorimetry); heat release generally increased with ambient O2 concentration (summary report).
- Using mass loss and O2 consumption from 19 returned samples, the global equivalence ratio was estimated at 1.3 on average, meaning the flames burned fuel-rich (under-ventilated) under the low-velocity forced-flow conditions (summary report).
- The summary report estimates that CO from a fire of the scale of a BASS-II test, diluted into the 106 m3 U.S. Lab, would reach only about 1.5 ppm, below the 10 ppm long-term spacecraft maximum allowable concentration.
- For concurrent PMMA rods, ignition delay time increased significantly as the limiting O2 concentration was approached and could be almost 10 times longer than the NASA-STD-6001 standard igniter on-time; ignition limits were at higher O2 concentrations than flammability limits (rod sub-study conclusions).
- For opposed flow over thin PMMA, a critical flow velocity below which steady spread cannot be sustained was found to be independent of fuel thickness and to increase as O2 decreases (sub-study conclusions).
- 126 tests were conducted in BASS-II; including earlier BASS-I results, the 2014 poster states well over one hundred tests had been conducted.

# Fire Safety Relevance

Team interpretation: BASS-II gives microgravity flammability-limit evidence for common solid materials that can be compared with the normal-gravity upward-burning screening test. The reported negative oxygen margin of safety for PMMA rods (steady spreading at 13.6% O2 in microgravity versus a 16% O2 blowoff limit at 1 g) suggests that normal-gravity screening may not be conservative for some materials in low-speed ventilated microgravity environments. This is most relevant to fire prevention through material selection and to setting cabin oxygen limits for spacecraft. The tests were in microgravity only; IGNIS does not treat them as direct evidence for lunar or Martian partial gravity.

# Limitations

- Oxygen limits are approximate: the summary report gives "~21" to "~14" percent, O2 dropped during each burn, and the O2 sensor was not recalibrated on orbit (offset corrected daily).
- Airflow figures differ between sources: about 55 cm/s maximum in the summary report and rod sub-study, "up to 40 cm/s" on the 2014 poster's approach slide, and 5 to 50 cm/s in the NASA fact sheet. The frontmatter uses the summary report value.
- Pressure was not a test variable; the frontmatter range spans values stated in individual sub-studies (99.2 to 99.5 kPa and 1 atm).
- Sample counts differ between sources: 126 tests (summary report), 100 samples (fact sheet), and the fact sheet's operational text repeats the BASS figures "forty-one test samples ... 89 test points".
- Heat release and equivalence ratio are estimates from before/after gas readings, burn times and mass loss of 19 of 34 returned samples.
- The radiometer signal was uncalibrated.
- Samples are centimetre-scale; results describe small flames.
- All tests were in microgravity; no partial-gravity conditions were tested.

# Source Notes

- ntrs-20210011385: Olson, Ferkul, Bhattacharjee, Miller, Fernandez-Pello, Link, T'ien and Wichman, "Burning and Suppression of Solids-II (BASS-II) Summary Report", NASA/TM-20210011385 (2021). Primary source for this record. Supports the hardware description, 126 tests, nitrogen dilution, the ~21% to ~14% O2 range, ~55 cm/s maximum flow, sample geometries and sizes, the sensors (CSA-CP, CDM, MCA offset, airspeed transducer, radiometer, cameras), heat release, CO/CO2, equivalence ratio and U.S. Lab dilution findings (Sections 1.1 to 1.6), the 99.2 to 99.5 kPa and 1 atm statements (Sections 2.3 and 7.1), and the sub-study conclusions on critical velocity (2.2.8) and rod ignition delay (6.1.6).
- nasa-fact-sheet: NASA fact sheet PDF, BASS-II section. Supports the objective and hypothesis, modified SPICE hardware in the MSG, 100 fuel samples in three categories, 10 cm by 1 and 2 cm thin flat samples, PMMA and SIBAL materials, nitrogen vitiation of the working volume, 5 to 50 cm/s airflow adjustment, anemometer and radiometer, and the Science Results paragraph used in the first two Key Findings bullets.
- ntrs-20160000593: Ferkul, Bhattacharjee, Fernandez-Pello, Miller, Olson, Takahashi and T'ien, "Combustion of Solids in Microgravity: Results from the BASS-II Experiment", poster at the 30th Annual ASGSR Conference, October 2014, supported by NASA SLPSRA. Supports the objectives list, oxygen "21% and below", airflow 0 to 55 cm/s and "up to 40 cm/s", the sub-study sample dimensions, the 13.6% O2 versus 16% O2 rod result, quenching and blowoff observations, rod spread-rate trends, and the abstract statements on flow sensitivity and test count.
- The NASA PSI repository lists this investigation as PSI-25 (confirmed via the PSI search index); the full PSI record was not read. Member 3 should check it if available.
