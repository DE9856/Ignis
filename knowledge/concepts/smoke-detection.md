---
type: Concept
title: Smoke Detection in Spacecraft
description: >-
  Detecting fires by sensing smoke particles; covers the Space Shuttle and ISS detector designs and
  why microgravity smoke properties matter for them.
status: draft

tags:
  - detection
  - smoke
  - smoke-detection
  - aerosol

sources:
  - id: ntrs-20080012612
    resource: https://ntrs.nasa.gov/citations/20080012612
    title: Spacecraft Fire Detection - Smoke Properties and Transport in Low-Gravity (Urban et al., AIAA 2008-806)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - concepts/detection
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

Smoke detection senses a fire through the particles it produces. Smoke can include unburned or recondensed polymer and pyrolysis products (liquid or solid), soot, condensed water vapour and ash. NASA states that soot and ash dominate in established flaming fires, while pyrolysis products and recondensed polymer fragments are produced by smouldering and pyrolysis early in a fire.

# NASA Evidence

- When the Space Shuttle and ISS detectors were designed, no measurements of smoke from microgravity fires existed, so both designs were based on 1-g information and the state of the art. As a result they use different detection technologies with very different particle size sensitivities.
- Space Shuttle: particle-ionization smoke detectors (nine in the Orbiter, in avionics cooling air return lines), using a pump and a particle separator that rejects particulate larger than about 1 um. For a fixed smoke mass concentration, the ionization detector is more sensitive to smaller particles.
- ISS: laser-diode forward-scattering (30 degree) smoke detectors, most sensitive to particles larger than 1 um with sensitivity extending down to 0.6 um (minimum reported sensitivity 0.3 um). They draw 1.5 W versus 9 W for the Orbiter detector. ISS requirements call for two detectors in the open area of the U.S. Lab plus detectors in racks with cooling airflow.
- A NASA smoke transport model of the ISS U.S. Lab found that mixing dominates smoke transport in microgravity, so detection times are longer than in normal gravity and depend strongly on source location and obstructions.

# Evidence in IGNIS Records

Summary of linked records (see each record for sources):

- SAME and SAME-R: measured microgravity smoke particle sizes from overheated spacecraft materials and the response of Shuttle and ISS detector designs; a prototype two-moment detector was tested in SAME-R.
- Saffire: ionization and light-scattering detection of smoke from large-scale fires in a Cygnus vehicle.

# Fire Safety Relevance

Team interpretation: matching detector technology to the expected smoke particle size is a design choice a habitat scenario must make. The SAME results suggest that a single-technology detector may be sensitive to some smoke types and not others, so detectors that measure more than one property of the smoke may be more robust.

# Limitations

- This page describes Shuttle and ISS detector designs as reported in 2008; later changes are not covered.
- The smoke transport findings are from a numerical model, not flight measurements.

# Source Notes

- ntrs-20080012612: supports the smoke composition and fire-phase statements, the absence of microgravity smoke data at design time, the Shuttle and ISS detector designs, sensitivities, power figures and placement requirements, and the smoke transport model findings.
