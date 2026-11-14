---
type: Concept
title: Fire Prevention (spacecraft)
description: >-
  Measures that stop a spacecraft fire from starting or growing, chiefly material flammability
  control, ignition-source control and atmosphere selection; one of the three fire safety
  categories used by IGNIS.
status: draft

tags:
  - safety-category
  - prevention
  - spacecraft-fire-safety

sources:
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - concepts/detection
  - concepts/suppression
  - concepts/material-flammability-screening
  - concepts/flame-spread
  - investigations/bass
  - investigations/bass-ii
  - investigations/saffire
  - investigations/flex
  - investigations/acme-bre

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Definition

In IGNIS, prevention is the safety category for evidence about whether, and under what conditions, a fire can start, sustain itself or grow. It covers material flammability, ignition, oxygen and pressure limits, and ventilation effects. It is one of the three values allowed in the `safetyCategories` field (prevention, detection, suppression).

# NASA Evidence

- NASA states that a fire requires all elements of the "fire triangle" (fuel, oxygen and an ignition source), and that crewed spacecraft by necessity contain all three. Spacecraft frequently operate at an oxygen mole fraction higher than air, have limited options for escape and almost no tolerance for damage to life support systems.
- NASA maintains fire safety through strict material controls, rigid design standards for electronic equipment and all possible ignition sources, and mandatory suppression systems on all spacecraft.
- NASA lists three past misconceptions about spacecraft fires: that a steady fire cannot exist in a quiescent microgravity environment, that a fire will self-extinguish if ventilation is shut off, and that terrestrial fire standards and tests are very conservative because reduced gravity is inherently safer. NASA states that research at Glenn Research Center demonstrates the fallacy of these assumptions.
- NASA states that in low-flow microgravity or partial gravity some materials are flammable at lower oxygen concentrations than in normal gravity, and materials are easier to ignite in low gravity because of reduced natural convective cooling.

# Evidence in IGNIS Records

Summary of linked records tagged with prevention (see each record for sources):

- BASS and BASS-II: small solid-material flames in low-speed airflow, including burning at lower oxygen in microgravity than the 1-g limit for PMMA rods.
- Saffire: large-scale fires in a Cygnus vehicle at elevated oxygen and reduced pressure.
- FLEX: lower limiting oxygen index for liquid droplets in microgravity.
- ACME BRE: emulated-fuel flames burning for minutes in still, elevated-oxygen atmospheres but self-extinguishing below about 25% oxygen.

# Fire Safety Relevance

Team interpretation: prevention evidence is the most directly useful category for comparing a mission scenario's atmosphere (oxygen, pressure, ventilation) with tested conditions. Because most evidence is from microgravity, it does not by itself establish behaviour in lunar or Martian partial gravity.

# Limitations

- This page is a definition and index, not a source of values; quantitative evidence lives in the linked investigation records.
- The category boundary is the team's: NASA sources discuss prevention, detection and suppression but do not define IGNIS's tagging rules.

# Source Notes

- researchers-guide-combustion: supports the fire triangle, spacecraft oxygen and escape statements, NASA's controls (materials, ignition sources, suppression systems), the three misconceptions, and the low-flow flammability and ignition statements.
- The Evidence in IGNIS Records section summarises the linked draft records and carries no new values.
