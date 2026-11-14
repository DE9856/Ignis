---
type: Hardware
title: Multi-User Droplet Combustion Apparatus (MDCA)
description: >-
  Insert for the ISS Combustion Integrated Rack that dispenses, deploys and ignites liquid fuel
  droplets, free-floating or fiber-supported, for droplet combustion experiments such as FLEX and
  FLEX-2.
status: draft

tags:
  - facility
  - iss
  - droplet-combustion
  - cir-insert

sources:
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20150023456
    resource: https://ntrs.nasa.gov/citations/20150023456
    title: Detailed Results from the Flame Extinguishment Experiment (FLEX) March 2009 to December 2011 (NASA/TP-2015-216046)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/cir
    relation: installed-in
  - id: investigations/flex
    relation: hosts-investigation
  - id: investigations/flex-2
    relation: hosts-investigation
  - id: investigations/cfi
    relation: hosts-investigation
  - concepts/droplet-combustion

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Overview

The Multi-User Droplet Combustion Apparatus (MDCA) is a CIR insert that deploys and ignites liquid fuel droplets inside the CIR combustion chamber and provides some of the diagnostics. NASA's Researcher's Guide lists FLEX, FLEX-2, FLEX-ICE-GA and FLEX-2J as experiments supported by the MDCA. The MDCA communicates through the CIR to ground controllers at NASA Glenn.

# Capabilities

- Droplets: NASA's Researcher's Guide states the MDCA allows dispensing, deployment and ignition of droplets ranging from 1 to 5 mm, either free floating or fiber supported.
- Atmosphere: a 0 to 3 atm ambient environment of up to 40 percent oxygen by volume, balance a range of inert gases and inert gas mixtures (Researcher's Guide). The FLEX technical paper states that, for FLEX, a rigorous and very conservative safety analysis reduced the maximum working pressure of the CIR chamber to approximately 3 atm.
- Deployment: two opposed stainless-steel needles (250 um outside diameter) fed from crew-replaceable fuel reservoirs form the droplet; two opposed hot-wire igniters ignite it. A fine support fiber (80 um in FLEX) can tether the droplet and move it at a programmable low velocity.
- Fuel quantity: limited by safety analysis; in FLEX, approximately 2.5 ml of methanol or 1.25 ml of heptane per reservoir.
- Appendix figures in the Researcher's Guide: up mass 254 kg, volume 0.48 m3, power 0.73 kW, data volume 72 GB.

# Diagnostics

The MDCA provides a color camera (with an LED for droplet formation, zoomed out during burning) and radiometers (broadband and water-vapour band). The Researcher's Guide lists its diagnostics as an analog color camera, radiometer, low light level UV camera and two HiBMs cameras; the UV and HiBMs cameras are CIR facility cameras. The FLEX technical paper states the MDCA radiometers in its early tests were not sensitive enough for reliable quantitative data and that a replacement radiometer package would be provided.

# Investigations Using This Hardware

Records in this knowledge base that used the MDCA (summary of the linked records): FLEX, FLEX-2 and CFI (the MDCA was reconfigured for CFI in January 2017).

# Fire Safety Relevance

Team interpretation: the MDCA produces the cleanest available microgravity data on how isolated liquid fuel droplets burn and extinguish, including limiting oxygen and inert-gas effects. Droplet results describe idealised single droplets, not pools, sprays or real spills.

# Limitations

- Capability figures come from a NASA overview guide and may not match every test configuration.
- The upper pressure stated in the facility summary (3 atm) and the FLEX test maximum (3.05 atm) differ slightly; the FLEX paper attributes the ~3 atm limit to a conservative safety analysis rather than the chamber's 9 atm capability.
- Radiometer data were unreliable in the early FLEX tests.

# Source Notes

- researchers-guide-combustion: supports the 1 to 5 mm droplets, free or fiber-supported, 0 to 3 atm, up to 40% oxygen, the supported experiments list, and the appendix mass, volume, power, data and diagnostics figures.
- ntrs-20150023456: FLEX technical paper. Supports needles, reservoirs, igniters, the 80 um support fiber, fuel quantities, the color camera and radiometers, the radiometer sensitivity problem, and the ~3 atm limit set by safety analysis.
