---
type: Mission
title: Lunar pressurized rover, challenge oxygen floor
description: >-
  A fire inside a pressurized lunar rover at the edge of the range the challenge statement
  expects: 30% oxygen at 10.2 psi, in lunar gravity.
status: draft

tags:
  - preset
  - moon
  - partial-gravity
  - rover

oxygenPercent: 30
pressureKPa: 70.3 # 10.2 psi
airflowMetersPerSecond: null
gravityG: 0.165
material: null
fuelType: null
safetyObjective: null
assumptionNotes: >-
  The challenge gives a range, not a single value: 30% oxygen or greater at 10.2 psi or less. This
  preset takes the lowest oxygen and highest pressure in that range; a real rover may run richer in
  oxygen and at lower pressure. Airflow, material, fuel and safety objective are left blank so they
  are not compared.
valueBasis:
  oxygenPercent: challenge_context
  pressureKPa: challenge_context
  gravityG: nasa_source

sources:
  - id: space-apps-2026-flame-in-freefall
    resource: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
    title: "Flame in Freefall challenge statement (NASA Space Apps Challenge 2026)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15
  - id: nasa-moon-fact-sheet
    resource: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
    title: Moon Fact Sheet (NASA Space Science Data Coordinated Archive)
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

A cabin fire in a pressurized rover on the lunar surface. The challenge statement expects the Moon Base and pressurized rovers to use an atmosphere between a spacesuit's and Earth's, to shorten pre-breathing before excursions.

# Value Sources

- Oxygen 30% and pressure 10.2 psi: the challenge statement says the intermediate oxygen concentration "will likely be 30% or greater, with a corresponding pressure of 10.2 psi or less".
- Pressure conversion: 10.2 psi at 6.894757 kPa per psi is 70.33 kPa, entered as 70.3 kPa.
- Gravity 0.165 g: Moon Fact Sheet, surface gravity 1.62 m/s² against Earth's 9.80 m/s², ratio 0.165.

# Limitations

- The oxygen and pressure are a bound from the challenge text, not a rover design value.
- No investigation in the IGNIS knowledge base was run in partial gravity, so microgravity evidence can only bound this scenario.
