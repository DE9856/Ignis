---
type: Mission
title: ISS cabin, nominal atmosphere
description: >-
  A fire inside the International Space Station at its nominal cabin atmosphere of 14.7 psia
  and 21% oxygen, in orbital free fall.
status: draft

tags:
  - preset
  - iss
  - microgravity

oxygenPercent: 21
pressureKPa: 101.4 # 14.7 psia
airflowMetersPerSecond: null
gravityG: 0
material: null
fuelType: null
safetyObjective: null
assumptionNotes: >-
  Orbital free fall is entered as 0 g; real residual accelerations aboard the station are small but
  not zero. Airflow, material, fuel and safety objective are left blank so they are not compared;
  set them for the fire you have in mind.
valueBasis:
  oxygenPercent: nasa_source
  pressureKPa: nasa_source
  gravityG: prototype_assumption

sources:
  - id: nasa-tp-2010-216134
    resource: https://www.nasa.gov/wp-content/uploads/2023/03/henninger-8.2-34-atm-tp216134-2010.pdf
    title: >-
      Recommendations for Exploration Spacecraft Internal Atmospheres: The Final Report of the NASA
      Exploration Atmospheres Working Group (NASA/TP-2010-216134)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15

generated:
  by: human:member2
  at: 2026-11-15
  tool: claude-assisted extraction

verified: []
---

# Scenario

A cabin fire aboard the ISS under normal operations. Most ISS combustion investigations in IGNIS were run near this atmosphere, so it is the reference case the other presets differ from.

# Value Sources

- Oxygen 21% and pressure 14.7 psia: NASA/TP-2010-216134, p. 19, refers to "the nominal ISS atmosphere of 14.7 psia and 21% oxygen".
- Pressure conversion: 14.7 psia at 6.894757 kPa per psi is 101.35 kPa, entered as 101.4 kPa.
- Gravity 0 g: team assumption for orbital free fall (see assumption notes).

# Limitations

- Nominal values only. The band the station controls around them is not entered.
- The report is from 2010 and cites the ISS atmosphere as a reference for exploration vehicles; it is not an ISS operations document.
