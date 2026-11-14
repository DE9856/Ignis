---
type: Concept
title: Flame Spread over Solid Materials
description: >-
  How a flame advances across a solid material, and how microgravity and low-speed airflow change
  spread rate, direction and flammability limits.
status: draft

tags:
  - flame-spread
  - solid-material
  - airflow

sources:
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - concepts/prevention
  - concepts/material-flammability-screening
  - investigations/bass
  - investigations/bass-ii
  - investigations/saffire

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Definition

Flame spread is the advance of a flame across the surface of a solid material. Spread is "opposed" when the flame moves against the airflow and "concurrent" when it moves with the airflow. In IGNIS records, flame spread rate, direction and the limits of steady spread are key measured outcomes for solid materials.

# NASA Evidence

- NASA states that space-based and ground-based low-gravity experiments revealed substantial differences in flame behaviour over solids in reduced gravity, and that the assumed margin of safety from reduced flammability in microgravity, based on quiescent tests, may not be valid for most spacecraft environments where ventilation strongly enhances flames.
- For flame spread over solids, NASA describes a flammability boundary of oxygen versus gas velocity: at low velocities radiative loss dominates and eventually causes extinction. The minimum of this boundary is at a characteristic gas velocity on the order of 10 cm/s, which also corresponds to a maximum in flame spread rate and, NASA notes, is typical of spacecraft ventilation.
- NASA states that, contrary to normal gravity, a flame on a thin fuel ignited mid-sample spreads upstream into the oncoming airflow in space when forced flow is low, whereas in normal gravity it always spreads downstream with the buoyant flow.
- Surface radiative heat loss reduces flammability, while an external radiant heat flux can cause materials to ignite and spread faster.

# Evidence in IGNIS Records

Summary of linked records (see each record for sources):

- BASS and BASS-II: spread rates and quenching and blowoff limits for thin and thick materials in 0 to about 55 cm/s flow.
- Saffire: large-scale spread over fabric and PMMA; flames reached nearly steady sizes rather than growing continuously.

# Fire Safety Relevance

Team interpretation: because the most flammable condition sits near typical spacecraft ventilation speeds, a habitat's airflow is itself a fire-risk variable. A scenario's airflow should be compared with the flows tested in the linked records before assuming a material will not spread.

# Limitations

- This page is a definition and index; quantitative values are in the linked investigation records.
- The ~10 cm/s minimum is a general NASA characterisation, not a value for any specific material.
- Evidence summarised here is from microgravity; partial gravity is not covered.

# Source Notes

- researchers-guide-combustion: supports the reduced-gravity flammability statements, the oxygen-versus-velocity flammability boundary with a minimum near 10 cm/s, the upstream spread observation, and the radiative heat loss and external heat flux statements.
