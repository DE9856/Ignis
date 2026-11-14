# Source check: FLEX (`knowledge/investigations/flex.md`)

- Source check done in commit `d851303` by Akshita, with Claude assisting, against NASA/TP-2015-216046, the Researcher's Guide and PSI-69 (275-row test table).
- Record status: `draft`. Author: `human:member2`. Not verified (see `README.md`).
- This report summarises that review. **It was not repeated on 2026-11-14**; the record has not changed since.

## What the review changed

- Pressure set to 70.2–309.3 kPa from PSI-69 (not the TP summary's 70.9–309.0).
- Oxygen maximum set to 34%, not 40%: the TP's Table III lists tests 019–023 at 0.400, but PSI-69 and the TP's own figure captions give 0.34. The 40% in the guide is the MDCA facility limit.
- Droplet diameters 1.1–4.67 mm; helium diluent added from 50 PSI-69 tests in late 2011 that the TP does not cover.
- Airflow kept `null`; fiber translation and drift documented. All Researcher's Guide claims (LOI significantly lower, margin of safety, cool flames) confirmed.

## Open for the reviewer

- The TP explicitly does not interpret its data; LOI and margin-of-safety statements rest on the Researcher's Guide.
- Needle-coating contamination may explain some disruptive extinctions.
- One PSI-69 row (test 114, 0 mmHg) was excluded as a data-entry gap; SF6 is named in PSI-69's objectives but no SF6 test appears.
- The reviewer must confirm the PSI-69 values directly; the PSI site could not be read from this environment.
- The full list of known conflicts and caveats is in the record's Limitations section.

The reviewer who signs this record off must not be its author (Member 2). If Akshita is not the author, she may be the natural reviewer, since she has already worked through the sources.
