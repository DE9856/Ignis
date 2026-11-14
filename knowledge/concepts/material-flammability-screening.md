---
type: Concept
title: Material Flammability Screening (NASA-STD-6001 Test 1)
description: >-
  NASA's normal-gravity upward flame propagation test used to screen materials for spacecraft, and
  the microgravity evidence on whether it is conservative.
status: draft

tags:
  - prevention
  - material-flammability
  - nasa-std-6001
  - flammability-test

sources:
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20210011521
    resource: https://ntrs.nasa.gov/citations/20210011521
    title: >-
      Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large
      Scale Spacecraft Fires (Urban et al., ICES-2021-266)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20210011385
    resource: https://ntrs.nasa.gov/citations/20210011385
    title: Burning and Suppression of Solids-II (BASS-II) Summary Report (NASA/TM-20210011385)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - concepts/prevention
  - concepts/flame-spread
  - investigations/bass
  - investigations/bass-ii
  - investigations/saffire
  - investigations/acme-bre

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Definition

NASA screens materials for spacecraft use with NASA-STD-6001 (Flammability, Offgassing, and Compatibility Requirements and Test Procedures). Its Test 1 is an upward flammability test in normal gravity: a 30 cm long material sample is ignited at the bottom, and if the flame grows or spreads past 15 cm the material fails the test at that condition (Saffire IV/V paper). Upward burning is considered the worst-case geometry for flammability on Earth.

# NASA Evidence

- NASA states that upward burning may not be conservative for flammability in space, and that an objective of BASS-II was to identify the worst case for material flammability in spacecraft environments and compare it with the terrestrial upward-burning test.
- NASA's Researcher's Guide states that recent BASS results indicate NASA-STD-6001 Test 1 is not conservative, and that materials can burn at lower oxygen levels in microgravity than on Earth.
- The Saffire IV/V paper states that thick-fuel flame growth in low gravity was dissimilar from that seen in Test 1: in low gravity, flames on thick fuels did not grow or spread concurrently and spread was more likely to be opposed. The authors state this does not invalidate the test, which is quite successful at identifying highly flammable materials, but it cannot be assumed to indicate that a material will not burn under those conditions in low gravity.
- The same paper notes that surface structure matters: on a 10 mm thick ribbed PMMA sample, the relevant dimension for flame spread was the rib width, so relatively thin surface structures must be considered.

# Evidence in IGNIS Records

Summary of linked records (see each record for sources):

- BASS-II: a PMMA rod spread steadily at 13.6% oxygen in microgravity versus a 16% oxygen blowoff limit in 1 g.
- Saffire: large-scale thick-fuel flames pinned at the leading edge rather than spreading concurrently.
- ACME BRE: assessment of the relevance of flammability test methods using emulated fuels.

# Fire Safety Relevance

Team interpretation: a material that passes Test 1 is not proven safe in a ventilated microgravity cabin, especially at elevated oxygen. For a scenario, a material's 1-g screening result should be read together with microgravity evidence for similar materials and conditions.

# Limitations

- This page summarises NASA statements about Test 1; it does not reproduce the standard. The full test procedure is in NASA-STD-6001, not consulted for this draft.
- Evidence is from microgravity; partial-gravity behaviour relative to Test 1 is not covered.

# Source Notes

- researchers-guide-combustion: supports the statement that BASS results indicate Test 1 is not conservative and that materials can burn at lower oxygen in microgravity.
- ntrs-20210011521: supports the Test 1 description (30 cm sample, ignited at bottom, fails past 15 cm), the thick-fuel dissimilarity, the authors' statement on the usefulness and limits of the test, and the surface-structure finding.
- ntrs-20210011385: BASS-II Summary Report. Supports "upward burning … considered to be the worst-case geometry for flammability of the material on Earth", "it may not be conservative for flammability in space", and the BASS-II worst-case objective.
