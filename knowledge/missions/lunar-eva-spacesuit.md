---
type: Mission
title: Spacesuit on the lunar surface
description: >-
  A fire inside a spacesuit's pure-oxygen atmosphere at 4.3 psi, during a lunar surface
  excursion.
status: draft

tags:
  - preset
  - moon
  - partial-gravity
  - spacesuit

oxygenPercent: 100
pressureKPa: 29.6 # 4.3 psi
airflowMetersPerSecond: null
gravityG: 0.165
material: null
fuelType: null
safetyObjective: null
assumptionNotes: >-
  Suit pressure is the historical value; future suits may differ. A suit is a small enclosed
  volume, unlike a cabin, and no record in IGNIS tests a suit geometry. Airflow, material, fuel and
  safety objective are left blank so they are not compared.
valueBasis:
  oxygenPercent: challenge_context
  pressureKPa: nasa_source
  gravityG: nasa_source

sources:
  - id: space-apps-2026-flame-in-freefall
    resource: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
    title: "Flame in Freefall challenge statement (NASA Space Apps Challenge 2026)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15
  - id: nasa-std-3001-tb-037
    resource: https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-037-decompression-sickness.pdf
    title: NASA-STD-3001 Technical Brief, Decompression Sickness (OCHMO-TB-037)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15
  - id: nasa-moon-fact-sheet
    resource: https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
    title: Moon Fact Sheet (NASA Space Science Data Coordinated Archive)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-15

generated:
  by: human:member2
  at: 2026-11-15
  tool: claude-assisted extraction

verified: []
---

# Scenario

A fire inside a spacesuit during a lunar excursion. The challenge statement includes it because suit oxygen and pressure set one end of the range that lunar habitats and rovers are designed to sit within.

# Value Sources

- Oxygen 100%: the challenge statement says spacesuits "are filled with 100% oxygen to only 4.3 psi".
- Pressure 4.3 psia: NASA-STD-3001 Technical Brief OCHMO-TB-037, p. 2, describes the change "from cabin pressure to an EVA suit, historically 4.3 psia".
- Pressure conversion: 4.3 psi at 6.894757 kPa per psi is 29.65 kPa, entered as 29.6 kPa.
- Gravity 0.165 g: Moon Fact Sheet, surface gravity 1.62 m/s² against Earth's 9.80 m/s², ratio 0.165.

# Limitations

- The highest oxygen tested by any investigation in IGNIS is below 100%, so this preset is expected to show an oxygen gap; that gap is the result.
- No investigation in the IGNIS knowledge base was run in partial gravity, so microgravity evidence can only bound this scenario.
