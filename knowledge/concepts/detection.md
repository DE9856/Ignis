---
type: Concept
title: Fire Detection (spacecraft)
description: >-
  Sensing a spacecraft fire early, mainly through smoke particulate and combustion gases; one of
  the three fire safety categories used by IGNIS.
status: draft

tags:
  - safety-category
  - detection
  - spacecraft-fire-safety

sources:
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20080012612
    resource: https://ntrs.nasa.gov/citations/20080012612
    title: Spacecraft Fire Detection - Smoke Properties and Transport in Low-Gravity (Urban et al., AIAA 2008-806)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - concepts/smoke-detection
  - concepts/prevention
  - concepts/suppression
  - investigations/same
  - investigations/same-r
  - investigations/saffire

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Definition

In IGNIS, detection is the safety category for evidence about how a spacecraft fire can be sensed: the smoke and gases it produces, how they move through the cabin, and how detectors respond. It is one of the three values allowed in the `safetyCategories` field.

# NASA Evidence

- NASA states that spacecraft fire detection is significantly harder than on Earth because the properties of smoke from fires are affected by buoyancy, and that spacecraft require rapid detection with limited false alarms.
- NASA states that given the constrained space on any spacecraft, the detection target is necessarily the early phase of a fire, not established flaming fires, so the primary detection target is pyrolysis products rather than soot.
- NASA states that microgravity research highlighted the very different particulate size of flames in microgravity, so detectors that sense particulates would need different signatures; a NASA Glenn device that monitors particulates and chemical species together outperformed aircraft smoke detectors in joint FAA testing.
- Early crewed spacecraft relied on the crew to detect fires; Skylab carried about 30 UV-sensing fire detectors that were line-of-sight limited and had false alarm difficulties.

# Evidence in IGNIS Records

Summary of linked records tagged with detection (see each record for sources):

- SAME and SAME-R: microgravity smoke from overheated spacecraft materials is mostly sub-micron, larger than in 1 g, and varies with material, airflow and aging.
- Saffire: a typical smoke alarm threshold was reached only after much of the hazardous gas had been released in a large-scale test.

# Fire Safety Relevance

Team interpretation: detection evidence helps judge whether a scenario's detectors (type, placement, threshold) are suited to microgravity smoke and to the airflow in the habitat. Microgravity smoke results may not transfer directly to partial gravity, where some buoyant transport returns.

# Limitations

- This page is a definition and index, not a source of values; quantitative evidence lives in the linked investigation records.
- The FAA comparison is reported in a NASA overview without test details.

# Source Notes

- researchers-guide-combustion: supports the buoyancy, rapid-detection and false-alarm statements, the different particulate signatures, and the particulate-plus-species device tested with the FAA.
- ntrs-20080012612: supports the early-phase detection target (pyrolysis products rather than soot) and the Mercury, Gemini, Apollo and Skylab history.
