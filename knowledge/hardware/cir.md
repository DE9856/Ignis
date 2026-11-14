---
type: Hardware
title: Combustion Integrated Rack (CIR)
description: >-
  NASA Glenn-developed rack facility in the ISS Destiny module that provides a sealed combustion
  chamber, gas supply and venting, and imaging diagnostics for gaseous, liquid and solid combustion
  experiments.
status: draft

tags:
  - facility
  - iss
  - combustion-chamber

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
  - id: ntrs-20210021781
    resource: https://ntrs.nasa.gov/citations/20210021781
    title: Recent Research on Flames of Gaseous Fuel Aboard the International Space Station (Stocker, JASMAC 2021)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: hardware/mdca
    relation: hosts
    note: The MDCA is an insert in the CIR combustion chamber
  - id: investigations/flex
    relation: hosts-investigation
  - id: investigations/flex-2
    relation: hosts-investigation
  - id: investigations/cfi
    relation: hosts-investigation
  - id: investigations/acme-bre
    relation: hosts-investigation
  - id: investigations/acme-cfi-g
    relation: hosts-investigation
  - id: investigations/acme-e-field
    relation: hosts-investigation

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Overview

The Combustion Integrated Rack (CIR) is an ISS rack facility developed at NASA Glenn Research Center for combustion experiments. NASA states the CIR was designed to test experiments that focus on fire prevention, detection and suppression of fires in space. The hardware was delivered to the ISS on STS-126 (November 2008) and installed in the U.S. Laboratory (Destiny module). FLEX was the first experiment conducted in the CIR. NASA states the facility was used from 2009 to 2017 for droplet combustion investigations and then for the ACME gaseous-flame experiments, with the SoFIE solid-fuel experiments planned to follow.

# Capabilities

- Combustion chamber: NASA's Researcher's Guide describes a 100-liter chamber with eight optical windows; the 2021 ACME paper says nominally 100 liters; the FLEX technical paper says a 90-liter chamber. With ACME hardware installed, the free volume is approximately 83 liters.
- Pressure: the FLEX technical paper states the chamber can operate at approximately 0 to 9 atm, although the maximum pressure for a given experiment is frequently much lower depending on a rigorous and very conservative safety analysis (about 3 atm for FLEX).
- Gas supply and venting: the CIR provides gas distribution and cleanup, venting, vacuum resources and water cooling, and its FOMA subsystem controls the gas mixture in the chamber (named the Fuel and Oxidizer Mixing Apparatus in the FLEX paper).
- Other resources: reconfigurable diagnostics, digital cameras and lighting with large data storage, and passive vibration isolation.
- Operations: experiments are configured by the ISS crew and commanded remotely from the Telescience Support Center at NASA Glenn.

# Diagnostics

CIR-provided diagnostics described in NASA sources include:

- High-Bit-Depth Multispectral (HiBMs) cameras, used for backlit droplet imaging, pyrometry with a liquid-crystal tunable filter, and soot volume fraction by light extinction.
- Low Light Level Ultra-Violet (LLL-UV / LLUV) intensified camera with a 310 nm filter for OH* chemiluminescence.
- An illumination package with fiber-coupled laser diodes.
- A gas chromatograph for pre- and post-test chamber atmosphere analysis (used by ACME).

Experiment inserts such as the MDCA and the ACME chamber insert add their own diagnostics.

# Investigations Using This Hardware

Records in this knowledge base that ran in the CIR (summary of the linked records):

- FLEX, FLEX-2 and CFI (droplet combustion, using the MDCA insert).
- ACME BRE, CFI-G and E-FIELD Flames (gaseous flames, using the ACME chamber insert).

# Fire Safety Relevance

Team interpretation: the CIR matters to IGNIS because it is the main ISS facility for long-duration, controlled-atmosphere combustion tests, including varied oxygen, pressure and diluent. Evidence from CIR investigations comes from small, controlled flames in a sealed chamber, not from fires in an open cabin, and all of it is microgravity evidence.

# Limitations

- Chamber volume differs between NASA sources (100 liters, nominally 100 liters, 90 liters; about 83 liters free with ACME hardware installed).
- Diagnostics available in any one test depend on the insert and configuration; this page does not list per-test diagnostics.
- This page describes the facility from NASA overview documents; it is not a full facility specification.

# Source Notes

- researchers-guide-combustion: supports the design purpose (prevention, detection, suppression), delivery on STS-126 in November 2008, U.S. Laboratory installation, 100-liter chamber with eight windows, diagnostics, gas distribution, vibration isolation, and the CIR and MDCA appendix entries.
- ntrs-20150023456: FLEX technical paper. Supports FLEX as the first CIR experiment, the 90-liter chamber, the approximately 0 to 9 atm operating range, the HiBMs and LLUV cameras, and remote operation from the Telescience Support Center.
- ntrs-20210021781: ACME 2021 paper. Supports nominally 100 liters, launch in 2008, use from 2009 to 2017 for droplet combustion, ~83 liter free volume with ACME hardware, crew configuration with ground commanding, and SoFIE following ACME.
