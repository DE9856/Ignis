---
type: Mission
title: Mars surface habitat, exploration atmosphere
description: >-
  A fire inside a long-duration Mars surface habitat at the nominal 8.0 psia, 32% oxygen
  atmosphere recommended by NASA's Exploration Atmospheres Working Group, in Martian gravity.
status: draft

tags:
  - preset
  - mars
  - partial-gravity
  - exploration-atmosphere

oxygenPercent: 32
pressureKPa: 55.2 # 8.0 psia
airflowMetersPerSecond: null
gravityG: 0.38
material: null
fuelType: null
safetyObjective: null
assumptionNotes: >-
  The 2010 working-group recommendation is used as one reference atmosphere; future Mars habitat
  designs may differ. Airflow, material, fuel and safety objective are left blank so they are not
  compared.
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
  - id: nasa-mars-fact-sheet
    resource: https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html
    title: Mars Fact Sheet (NASA Space Science Data Coordinated Archive)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15

related:
  - missions/lunar-surface-habitat

generated:
  by: human:member2
  at: 2026-11-15
  tool: claude-assisted extraction

verified: []
---

# Scenario

A cabin fire in a Mars surface habitat. The working group recommends the same nominal atmosphere for long-duration lunar and Mars surface habitats; the difference from the lunar preset is gravity.

# Value Sources

- Oxygen 32% and pressure 8.0 psia: NASA/TP-2010-216134, Executive Summary, p. 1: long-duration lunar and Mars surface habitats "should operate at both a nominal 8.0 psia, 32% oxygen" and at 7.6 psia, 32% oxygen. The nominal 8.0 psia value is used.
- Pressure conversion: 8.0 psia at 6.894757 kPa per psi is 55.16 kPa, entered as 55.2 kPa.
- Gravity 0.38 g: Mars Fact Sheet, mean surface gravity 3.73 m/s² against Earth's 9.82 m/s², ratio 0.380.

# Limitations

- No investigation in the IGNIS knowledge base was run in partial gravity, so microgravity evidence can only bound this scenario.
- The challenge statement notes that PSI holds no partial-gravity combustion data yet.
