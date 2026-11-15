---
type: Mission
title: Lunar surface habitat, exploration atmosphere
description: >-
  A fire inside a long-duration lunar surface habitat at the nominal 8.0 psia, 32% oxygen
  atmosphere recommended by NASA's Exploration Atmospheres Working Group, in lunar gravity.
status: draft

tags:
  - preset
  - moon
  - partial-gravity
  - exploration-atmosphere

oxygenPercent: 32
pressureKPa: 55.2 # 8.0 psia
airflowMetersPerSecond: null
gravityG: 0.165
material: null
fuelType: null
safetyObjective: null
assumptionNotes: >-
  The 2010 working-group recommendation is used as one reference atmosphere; current lunar
  programme designs may differ. The challenge statement expects 30% oxygen or more at 10.2 psi or
  less, and this preset sits inside that range. Airflow, material, fuel and safety objective are
  left blank so they are not compared.
valueBasis:
  oxygenPercent: nasa_source
  pressureKPa: nasa_source
  gravityG: nasa_source

sources:
  - id: nasa-tp-2010-216134
    resource: https://www.nasa.gov/wp-content/uploads/2023/03/henninger-8.2-34-atm-tp216134-2010.pdf
    title: >-
      Recommendations for Exploration Spacecraft Internal Atmospheres: The Final Report of the NASA
      Exploration Atmospheres Working Group (NASA/TP-2010-216134)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15
  - id: nasa-moon-fact-sheet
    resource: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
    title: Moon Fact Sheet (NASA Space Science Data Coordinated Archive)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15
  - id: space-apps-2026-flame-in-freefall
    resource: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
    title: "Flame in Freefall challenge statement (NASA Space Apps Challenge 2026)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15

related:
  - missions/lunar-pressurized-rover

generated:
  by: human:member2
  at: 2026-11-15
  tool: claude-assisted extraction

verified: []
---

# Scenario

A cabin fire in a lunar surface habitat. Oxygen is raised and pressure lowered relative to the ISS so crews can start excursions with less pre-breathing; the challenge statement notes this makes materials more flammable.

# Value Sources

- Oxygen 32% and pressure 8.0 psia: NASA/TP-2010-216134, Executive Summary, p. 1: long-duration lunar and Mars surface habitats "should operate at both a nominal 8.0 psia, 32% oxygen" and at 7.6 psia, 32% oxygen. The nominal 8.0 psia value is used.
- Pressure conversion: 8.0 psia at 6.894757 kPa per psi is 55.16 kPa, entered as 55.2 kPa.
- Gravity 0.165 g: Moon Fact Sheet, surface gravity 1.62 m/s² against Earth's 9.80 m/s², ratio 0.165.

# Limitations

- No investigation in the IGNIS knowledge base was run in partial gravity, so microgravity evidence can only bound this scenario.
- The same report says this atmosphere needs materials flammability testing at an oxygen concentration outside the existing shuttle and ISS database.
