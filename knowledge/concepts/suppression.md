---
type: Concept
title: Fire Suppression (spacecraft)
description: >-
  Extinguishing a spacecraft fire, for example with inert gases, water mist or changes to
  ventilation; one of the three fire safety categories used by IGNIS.
status: draft

tags:
  - safety-category
  - suppression
  - spacecraft-fire-safety

sources:
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - concepts/prevention
  - concepts/detection
  - investigations/bass
  - investigations/flex
  - investigations/saffire

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Definition

In IGNIS, suppression is the safety category for evidence about putting out a spacecraft fire: suppressant agents, how they are applied, and whether changing ventilation extinguishes or feeds a flame. It is one of the three values allowed in the `safetyCategories` field.

# NASA Evidence

- NASA states that on Earth the best results generally come from attacking the base of the flame, but in microgravity the best point of application may not be apparent, especially for a partially obstructed or wake-stabilized flame. Depending on flame geometry and extinguisher characteristics, a suppressant stream may be ineffective or may make the flame worse by entraining oxygen; early BASS results showed nitrogen applied to a flame can strengthen it.
- NASA states that BASS findings show local application of suppressant is not adequate for flame extinguishment, because the local jet entrains air and sustains the flame even when the ambient airflow is turned off.
- NASA states that FLEX research found the flammability limit is lower in reduced gravity, with the implication that terrestrial standards for inert-gas suppressants do not offer the same margin of safety in low gravity.
- The Water Mist Fire Suppression experiment (Mist) flew on STS-107 in 2003. NASA states that water-mist portable fire extinguishers were later certified for spaceflight, with the first two of nine sent to the ISS in December 2015 to replace carbon dioxide units.

# Evidence in IGNIS Records

Summary of linked records tagged with suppression (see each record for sources):

- BASS: a nitrogen jet weakened but did not extinguish some flames over thick fuel.
- FLEX: inert-gas (nitrogen, carbon dioxide) dilution limits for liquid droplets.
- Saffire: turning off ventilation did not reliably extinguish thin charring fuels or bubbling polymers; reducing flow first helped.

# Fire Safety Relevance

Team interpretation: suppression evidence shows that microgravity fires can respond to suppressants and ventilation changes differently than on Earth, so a scenario that relies on shutting off airflow or on local suppressant jets should be checked against this evidence. None of the linked records tests suppression in partial gravity.

# Limitations

- This page is a definition and index, not a source of values; quantitative evidence lives in the linked investigation records.
- The water mist extinguisher statements come from a 2015 NASA guide; later deployment status is not covered.

# Source Notes

- researchers-guide-combustion: supports the flame-base versus microgravity application statements, oxygen entrainment, the BASS nitrogen strengthening and local-application findings, the FLEX suppressant margin statement, and the Mist experiment and water-mist extinguisher history.
