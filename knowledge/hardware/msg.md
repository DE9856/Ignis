---
type: Hardware
title: Microgravity Science Glovebox (MSG)
description: >-
  ISS rack facility in the U.S. Laboratory with a sealed, negative-pressure work volume used for
  small-scale experiments, including the BASS, BASS-II, SAME and SAME-R fire safety investigations.
status: draft

tags:
  - facility
  - iss
  - glovebox

sources:
  - id: researchers-guide-combustion
    resource: https://www.nasa.gov/wp-content/uploads/2016/05/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf
    title: "A Researcher's Guide to: Combustion Science (NASA ISS Program Science Office, NP-2015-10-034-JSC)"
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14
  - id: ntrs-20210011385
    resource: https://ntrs.nasa.gov/citations/20210011385
    title: Burning and Suppression of Solids-II (BASS-II) Summary Report (NASA/TM-20210011385)
    sourceClass: NASA_SOURCE
    accessed: 2026-11-14

related:
  - id: investigations/bass
    relation: hosts-investigation
  - id: investigations/bass-ii
    relation: hosts-investigation
  - id: investigations/same
    relation: hosts-investigation
  - id: investigations/same-r
    relation: hosts-investigation
  - id: investigations/spice
    relation: hosts-investigation
  - id: investigations/slice
    relation: hosts-investigation

generated:
  by: human:member2
  at: 2026-11-14
  tool: claude-assisted extraction

verified: []
---

# Overview

The Microgravity Science Glovebox (MSG) is an ISS rack facility for fundamental and applied research, operating since July 2002 in the U.S. Laboratory (Destiny). NASA describes it as providing a workbench-type environment with an enclosed working volume held at negative pressure relative to the ISS cabin, giving two levels of containment for small parts, particulates, fluids and gases to protect the crew. NASA's Researcher's Guide states the MSG has been used for over 10,000 hours of payload operations and that the combustion program conducted SAME (2007 and 2010), SPICE (2009), SLICE (2012) and BASS (from 2012) in it.

# Capabilities

- Work volume: an enclosed work space of 255 liters (Researcher's Guide); the BASS-II summary report uses 0.25 m3 for the MSG working volume.
- Power and cooling: 1,000 W of dc power (120, 28, +12 and 5 Vdc) and 1,000 W of cooling.
- Data: video and data recording, real-time downlink and ground commanding.
- Gas and vacuum: access to ISS vacuum exhaust and vacuum resource systems and a gaseous nitrogen supply. BASS-II used this nitrogen supply, for the first time on the ISS, to dilute the work volume below normal ISS oxygen levels.
- Atmosphere: NASA states the glovebox is normally limited to ISS "air", nominally 21 percent oxygen by volume and one atmosphere.
- Filtration: the BASS-II report states the MSG filter banks capture particulates and convert CO to CO2 using an ambient-temperature catalyst.

# Diagnostics

The MSG provides video and data recording; investigation-specific diagnostics are supplied by each experiment (for example the BASS flow duct cameras and radiometer, or the SAME aerosol instruments). The Researcher's Guide appendix lists the combustion "MSG mini-facility" diagnostics as digital still camera, video camera, air flow, fuel flow and radiometer.

# Investigations Using This Hardware

Records in this knowledge base that ran in the MSG (summary of the linked records): BASS, BASS-II, SAME, SAME-R, SPICE and SLICE. BASS, BASS-II and SLICE all used the SPICE flow duct.

# Fire Safety Relevance

Team interpretation: the MSG is where most small-scale ISS solid-material flammability and smoke tests in this knowledge base were run. Its containment and filtration make it possible to burn or overheat materials safely aboard a crewed station, but tests are limited to small samples and to near-cabin atmospheres (or nitrogen-diluted ones), so MSG evidence describes small fires, not cabin-scale ones.

# Limitations

- Atmosphere options are limited: ISS air, or nitrogen dilution to lower oxygen; elevated oxygen and reduced pressure are not described for the MSG in the sources consulted.
- Capability figures come from NASA overview documents and may have changed over the facility's life.

# Source Notes

- researchers-guide-combustion: supports operation since July 2002 in the U.S. Laboratory, negative-pressure containment, the 255-liter work volume, power, cooling, data, vacuum and nitrogen resources, the 10,000 hours figure, the list of combustion experiments, the ISS "air" limitation, and the appendix diagnostics.
- ntrs-20210011385: BASS-II summary report. Supports the 0.25 m3 working volume, first ISS use of MSG nitrogen dilution, and the filter banks with CO catalyst.
