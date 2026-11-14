# Data contract

How knowledge records are written, and what the code guarantees about them. The schema in `lib/okf/schema.ts` is authoritative; if this document and the schema disagree, fix one of them in the same pull request.

## File layout

```
knowledge/investigations/<id>.md   type: Investigation
knowledge/hardware/<id>.md         type: Hardware
knowledge/concepts/<id>.md         type: Concept
knowledge/missions/<id>.md         type: Mission
knowledge/_templates/              starting points, never loaded
```

- One record per file. The file name without `.md` is the record id unless `id` is set in the frontmatter.
- Use lower-case, hyphenated file names.
- Files starting with `_`, and any `README.md`, are ignored by the loader.

## Frontmatter: all record types

| Field         | Type                                           | Required | Notes                              |
| ------------- | ---------------------------------------------- | -------- | ---------------------------------- |
| `type`        | `Investigation` `Hardware` `Concept` `Mission` | yes      | Must match the folder              |
| `title`       | text                                           | yes      |                                    |
| `id`          | text                                           | no       | Defaults to the file name          |
| `description` | text or null                                   | no       | One or two sentences               |
| `status`      | `draft` `in_review` `verified` `deprecated`    | no       | Defaults to `draft`                |
| `tags`        | list of text                                   | no       |                                    |
| `sources`     | list of source entries                         | no       | Required in practice before review |
| `related`     | list of links                                  | no       | See "Related records" below        |
| `generated`   | `{ by, at, tool }`                             | no       | Who wrote the record               |
| `verified`    | list of `{ by, at, scope }`                    | no       | One entry per reviewer             |

Source entry: `id` and `resource` (URL) are required. `title`, `accessed` (YYYY-MM-DD) and `sourceClass` are optional; `sourceClass` defaults to `UNVERIFIED`.

`by` values use a prefix: `human:member2`, or `llm:<model>` if a model drafted the text.

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
- A link may point at a record that has not been written yet; it is shown as plain text until the target exists.
- Only add a link for a real relationship the sources support. No decorative links.

## Frontmatter: Investigation only

All optional. All default to `null` (or an empty list).

| Field                        | Type         | Unit / values                                                               |
| ---------------------------- | ------------ | --------------------------------------------------------------------------- |
| `shortTitle`, `program`      | text         |                                                                             |
| `safetyCategories`           | list         | `prevention`, `detection`, `suppression`                                    |
| `fuelType`, `material`       | text         |                                                                             |
| `sampleShape`, `sampleSize`  | text         | Keep the source's wording and units for size                                |
| `oxygenMin`, `oxygenMax`     | number       | percent O2 by volume                                                        |
| `pressureMin`, `pressureMax` | number       | kPa                                                                         |
| `airflowMin`, `airflowMax`   | number       | m/s                                                                         |
| `gravityCondition`           | one of       | `microgravity` `partial_gravity` `normal_gravity` `hypergravity` `variable` |
| `gravityValue`               | number       | g                                                                           |
| `platform`                   | text         |                                                                             |
| `hardware`, `sensors`        | list of text |                                                                             |
| `measurements`, `variables`  | list of text |                                                                             |

If a source gives a single value rather than a range, set min and max to the same number. If it gives a value in other units, convert it and note the original in the Experimental Conditions section.

## Markdown body

Sections are split on `#` and `##` headings. Recommended headings for an investigation:

```
# Objective
# Experimental Conditions
# Measurements
# Key Findings
# Fire Safety Relevance
# Limitations
```

The parser currently reads three of them into the `Investigation` object:

- `Objective` becomes `objective` (whole section text).
- `Key Findings` becomes `keyFindings` (one entry per top-level `-` bullet).
- `Limitations` becomes `limitations` (one entry per top-level `-` bullet).

All sections are kept on the parsed document for future chunking.

`Fire Safety Relevance` is the team's reading of the evidence. Treat it as `TEAM_INTERPRETATION`.

## Rules the schema enforces

- `title` and a valid `type` are present.
- Numbers are finite numbers, not strings.
- A min is not greater than its max.
- `status: verified` requires at least one `verified` entry.
- Enumerated fields contain only the listed values.

A file that fails is excluded and reported in the app with its path and the reason.

## Rules people enforce

- **Unknown is `null`.** Never fill a field with a guess, a typical value or a default.
- **Every value traces to a listed source.**
- **The author does not verify their own record.**
- A record counts as verified only when `status: verified` and `verified` is non-empty. Only those records are ranked and, later, embedded.

## Provenance classes

| Class                 | Meaning                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `NASA_SOURCE`         | Taken directly from a cited NASA publication, dataset or page      |
| `HUMAN_REVIEWED`      | Entered by a team member and checked against the source by another |
| `COMPUTED`            | Produced by deterministic code from reviewed data                  |
| `TEAM_INTERPRETATION` | The team's own reading of the evidence                             |
| `GENERATED_SUMMARY`   | Written by a language model from retrieved evidence                |
| `UNVERIFIED`          | Not yet reviewed                                                   |

## TypeScript shapes

- `Investigation`, `SourceReference`, `OkfDocument`, `OkfSection`: `lib/okf/types.ts`
- `MissionScenario`, `RelevanceResult`, `GapFinding`: `lib/ranking/types.ts`
- `EvidenceChunk`, `RetrievalQuery`, `EvidenceRetriever`: `lib/retrieval/types.ts`
- `EvidenceChunkRow`, `Database`: `lib/supabase/types.ts`

Changing any of these is a contract change. Say so in the pull request title so the other four notice.
