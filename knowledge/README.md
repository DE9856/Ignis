# Knowledge base

This folder is the canonical source of scientific content for IGNIS. Everything the application shows about NASA research comes from the Markdown files here.

NASA is the source of scientific evidence. These files are the team's cited transcription of it.

## Folders

| Folder            | Record type     | Contents                                             |
| ----------------- | --------------- | ---------------------------------------------------- |
| `investigations/` | `Investigation` | One file per combustion investigation or experiment  |
| `hardware/`       | `Hardware`      | Facilities, rigs and inserts                         |
| `concepts/`       | `Concept`       | Combustion and fire-safety terms                     |
| `missions/`       | `Mission`       | Reference mission scenarios                          |
| `_templates/`     |                 | Starting points. Never loaded by the app             |

## Format

Each file is YAML frontmatter followed by Markdown sections:

```markdown
---
type: Investigation
title: Example Investigation
status: draft

tags:
  - combustion

safety_category:
  - prevention

fuel_type: null
oxygen_min: null
oxygen_max: null

sources:
  - id: source-1
    resource: https://www.nasa.gov/

generated:
  by: human:member2

verified: []
---

# Objective

# Experimental Conditions

# Variables

# Sensors and Measurements

# Key Findings

# Fire Safety Relevance

# Limitations

# Source Notes
```

Keys are snake_case. Start from `_templates/investigation.md`, which lists every field.

The full field list, units and validation rules are in [docs/data-contract.md](../docs/data-contract.md).

## Rules

1. Record only what a cited NASA source states.
2. If the source does not state a value, write `null`. Do not estimate.
3. Every record lists its sources with URLs.
4. New records are `status: draft`.
5. Someone other than the author checks the record against the source, adds an entry under `verified`, and sets `status: stable`.
6. Keep `Fire Safety Relevance` clearly separate: it is the team's interpretation, not NASA's statement.

## Checking your work

```bash
npm run validate:knowledge     # PASS / WARN / ERROR for every file
npm run inspect:knowledge      # counts and completeness
```

An ERROR must be fixed before the file can merge; CI runs the same check. A WARN is worth a look and does not block a draft.

You can also run `npm run dev` and open the Evidence Explorer. Valid records appear in the table. Files with problems are listed at the top with the reason.
