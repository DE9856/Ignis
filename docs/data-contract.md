# Data contract

How knowledge records are written, and what the code guarantees about them. The schema in `lib/okf/schema.ts` is authoritative; if this document and the schema disagree, fix one of them in the same pull request.

Check your files at any time with `npm run validate:knowledge`.

## File layout

```
knowledge/investigations/<id>.md   type: Investigation
knowledge/hardware/<id>.md         type: Hardware
knowledge/concepts/<id>.md         type: Concept
knowledge/missions/<id>.md         type: Mission
knowledge/_templates/              starting points, never loaded
```

- One record per file. The file name without `.md` is the record id unless `id` is set in the frontmatter. Do not rename a file after it is merged: other records and the retrieval index refer to it by id.
- Use lower-case, hyphenated file names.
- Files starting with `_`, and any `README.md`, are ignored.
- Files named `zz-local-*.md` are git-ignored synthetic records for layout work. They load in development only and are never validated or deployed.

## Key style

Frontmatter keys are written in snake_case: `fuel_type`, `oxygen_min`, `safety_category`. The parser converts them to the camelCase names used in TypeScript (`fuelType`, `oxygenMin`, `safetyCategories`). camelCase keys are accepted too.

An Investigation with a key the schema does not know is rejected with an error naming the key. This is deliberate: a misspelt field must never be silently dropped and shown as "Unknown".

## Frontmatter: all record types

| Field         | Type                                           | Required | Notes                                         |
| ------------- | ---------------------------------------------- | -------- | --------------------------------------------- |
| `type`        | `Investigation` `Hardware` `Concept` `Mission` | yes      | Must match the folder                         |
| `title`       | text                                           | yes      |                                               |
| `id`          | text                                           | no       | Defaults to the file name                     |
| `description` | text or null                                   | no       | One or two sentences                          |
| `resource`    | URL or null                                    | no       | Primary source, usually the NASA PSI record   |
| `status`      | `draft` `stable` `deprecated`                  | no       | Defaults to `draft`                           |
| `tags`        | list of text                                   | no       |                                               |
| `sources`     | list of source entries                         | no       | Required for a `stable` record                |
| `related`     | list of links                                  | no       | See "Related records" below                   |
| `generated`   | `{ by, at, tool }`                             | no       | Who wrote the record                          |
| `verified`    | list of `{ by, at, note }`                     | no       | One entry per reviewer. Required for `stable` |

Source entry: `id` and `resource` (an http or https URL) are required. `title`, `accessed` (YYYY-MM-DD) and `source_class` are optional; `source_class` defaults to `UNVERIFIED`.

`by` values use a prefix: `human:member2`, or `llm:<model>` if a model drafted the text.

Hardware, Concept and Mission records may carry extra fields for now. They are kept, and `validate:knowledge` lists them as a warning until they are added to the schema.

### Status

| Status       | Meaning                                                        | Ranked and retrieved |
| ------------ | -------------------------------------------------------------- | -------------------- |
| `draft`      | Written, not yet checked against the source by a second person | No                   |
| `stable`     | Checked by a reviewer, who added a `verified` entry            | Yes                  |
| `deprecated` | Kept for history                                               | No                   |

A record is human reviewed only when `status: stable` **and** `verified` is non-empty. Changing a value in a stable record means setting it back to `draft` so it is verified again.

### Related records

`related` links a record to other records: an investigation to the hardware it ran in, to a concept page, or to another investigation that shares hardware, fuel class or measurement approach.

```yaml
related:
  - hardware/msg
  - id: investigations/bass
    relation: follow-on
    note: Same hardware, extended test matrix
```

- The target is written `<folder>/<record-id>`, where the folder is `investigations`, `hardware`, `concepts` or `missions` and the id is the target's file name without `.md`.
- A bare id is enough. `relation` and `note` are optional free text.
- A link may point at a record that has not been written yet; `validate:knowledge` warns about it until the target exists.
- Only add a link for a real relationship the sources support. No decorative links.

## Frontmatter: Investigation only

All optional. All default to `null` (or an empty list).

| Field                          | Type                         | Unit / values                                                               |
| ------------------------------ | ---------------------------- | --------------------------------------------------------------------------- |
| `short_title`, `program`       | text                         |                                                                             |
| `safety_category`              | list                         | `prevention`, `detection`, `suppression`                                    |
| `fuel_type`, `material`        | text                         |                                                                             |
| `sample_shape`, `sample_size`  | text                         | Keep the source's wording and units for size                                |
| `oxygen_min`, `oxygen_max`     | number                       | percent O2 by volume                                                        |
| `pressure_min`, `pressure_max` | number                       | kPa                                                                         |
| `airflow_min`, `airflow_max`   | number                       | m/s                                                                         |
| `gravity_condition`            | one of                       | `microgravity` `partial_gravity` `normal_gravity` `hypergravity` `variable` |
| `gravity_value`                | number                       | g                                                                           |
| `platform`                     | text                         |                                                                             |
| `hardware`, `sensors`          | name, list of names, or null |                                                                             |
| `measurements`, `variables`    | name, list of names, or null |                                                                             |

If a source gives a single value rather than a range, set min and max to the same number. If it gives a value in other units, convert it (helpers in `lib/domain/units.ts`) and note the original in the Experimental Conditions section. Write numbers as plain numbers, without units.

## Markdown body

Sections are split on `#` and `##` headings. An investigation uses these eight headings, exactly as written:

```
# Objective
# Experimental Conditions
# Variables
# Sensors and Measurements
# Key Findings
# Fire Safety Relevance
# Limitations
# Source Notes
```

| Section                  | Read into `Investigation` as             | Evidence class      | Chunked for retrieval |
| ------------------------ | ---------------------------------------- | ------------------- | --------------------- |
| Objective                | `objective` (whole text)                 | NASA source         | Yes                   |
| Experimental Conditions  | kept on the parsed document              | NASA source         | Yes                   |
| Variables                | kept on the parsed document              | NASA source         | Yes                   |
| Sensors and Measurements | kept on the parsed document              | NASA source         | Yes                   |
| Key Findings             | `keyFindings` (one per top-level bullet) | NASA source         | Yes                   |
| Fire Safety Relevance    | `fireSafetyRelevance` (whole text)       | Team interpretation | Yes, labelled         |
| Limitations              | `limitations` (one per top-level bullet) | NASA source         | Yes                   |
| Source Notes             | kept on the parsed document              | n/a                 | No                    |

Each section must make sense read on its own, because it is retrieved on its own. Begin Fire Safety Relevance with "Team interpretation:".

## What `validate:knowledge` reports

Errors fail CI. Warnings do not.

| Check                                                            | Draft   | Stable  |
| ---------------------------------------------------------------- | ------- | ------- |
| Unreadable YAML, missing frontmatter                             | error   | error   |
| Missing `title` or `type`, invalid `status`, unknown key         | error   | error   |
| A min greater than its max                                       | error   | error   |
| Record in the wrong folder for its `type`                        | error   | error   |
| Duplicate id within a folder                                     | error   | error   |
| Source `resource` or top-level `resource` not an http(s) URL     | error   | error   |
| Malformed `verified` or `generated` entry                        | error   | error   |
| `stable` with no `verified` entry                                | n/a     | error   |
| Verified only by its own author                                  | n/a     | error   |
| No sources                                                       | warning | error   |
| Placeholder text (TODO, TBD, "...", "NASA PSI URL", example.com) | warning | error   |
| Empty section                                                    | warning | error   |
| Missing recommended section                                      | warning | warning |
| Link to a record that does not exist                             | warning | warning |
| Missing `generated.by`                                           | warning | warning |

Validation is structural. It never judges whether a scientific statement is correct.

## Rules people enforce

- **Unknown is `null`.** Never fill a field with a guess, a typical value or a default.
- **Every value traces to a listed source.**
- **The author does not verify their own record.**

## Provenance classes

| Class                 | Meaning                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `NASA_SOURCE`         | Taken directly from a cited NASA publication, dataset or page      |
| `HUMAN_REVIEWED`      | Entered by a team member and checked against the source by another |
| `COMPUTED`            | Produced by deterministic code from reviewed data                  |
| `TEAM_INTERPRETATION` | The team's own reading of the evidence                             |
| `GENERATED_SUMMARY`   | Written by a language model from retrieved evidence                |
| `UNVERIFIED`          | Not yet reviewed                                                   |

The rules for what each class may be used for live in `lib/domain/provenance.ts` and nowhere else.

## TypeScript shapes

- `Investigation`, `SourceReference`, `RelatedReference`, `OkfDocument`, `OkfSection`: `lib/okf/types.ts`
- `MissionScenario`, `RelevanceResult`, `GapFinding`, and the draft `RelevanceBreakdown`, `GapResult`: `lib/ranking/types.ts`
- `MethodologyConfig`: `lib/ranking/methodology.ts`
- `EvidenceChunk`, `RetrievalQuery`, `EvidenceRetriever`: `lib/retrieval/types.ts`
- `EvidenceChunkRow`, `Database`: `lib/supabase/types.ts`
- View models: `lib/integration/*.ts`

Changing any of these is a contract change. `tests/contract/` will fail; update it in the same pull request, put `contract:` in the title, and tell the team.
