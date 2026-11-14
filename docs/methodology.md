# IGNIS methodology v1

Owner: Member 3 (scientific validation). Approved 2026-11-14 as `ignis-methodology-v1`.

Configuration: `lib/ranking/methodology.ts` (`IGNIS_METHODOLOGY_V1`). Rules: `lib/ranking/scoring.ts`. Tests: `tests/ranking/scoring.test.ts`. Change the code, this document and the tests in the same pull request, and record why below under "Change log".

## What the outputs mean

IGNIS compares a mission scenario with the **reviewed** NASA evidence in `knowledge/`. Only records with `status: stable` and a `verified` entry are scored.

| Output                              | Range         | Meaning                                                                                                   |
| ----------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| Relevance score                     | 0–100         | How closely an investigation's reviewed conditions resemble the scenario, weighted by dimension.          |
| Direct-condition coverage           | 0–100 %       | Share of the scenario's specified weight that the investigation covers **directly**. Reported separately. |
| Research coverage gap               | priority 0–20 | How poorly the whole reviewed corpus covers one scenario dimension.                                       |
| Project-generated research question | text          | A fixed template filled from a gap. Labelled `PROJECT-GENERATED RESEARCH QUESTION`.                       |

None of these is a fire-risk probability, a hazard rating or a certification result. Scores measure evidence similarity; gaps measure corpus coverage.

## Dimensions and weights

Weights sum to 100. A dimension is scored only when the scenario specifies it; both scores are normalised over the specified dimensions.

| Dimension        | Weight | Scenario input                  | Evidence used                           |
| ---------------- | ------ | ------------------------------- | --------------------------------------- |
| Safety objective | 20     | Safety goal                     | `safetyCategories`                      |
| Material / fuel  | 20     | Material and/or fuel type       | `material`, `fuelType`                  |
| Oxygen           | 15     | O2, % by volume                 | `oxygenMin`, `oxygenMax`                |
| Airflow          | 15     | Airflow, m/s                    | `airflowMin`, `airflowMax`              |
| Pressure         | 10     | Pressure, kPa                   | `pressureMin`, `pressureMax`            |
| Gravity          | 10     | Gravity, g                      | `gravityValue`, else `gravityCondition` |
| Measurement      | 10     | Safety goal (no separate input) | `measurements`                          |

## Evidence states

| State          | Multiplier | Meaning                                                               |
| -------------- | ---------- | --------------------------------------------------------------------- |
| `DIRECT`       | 1.00       | The reviewed conditions include the scenario value.                   |
| `RELATED`      | 0.65       | Close to the scenario value, or the same class but not the same item. |
| `BOUNDING`     | 0.40       | Evidence on one side of the scenario condition only.                  |
| `UNKNOWN`      | 0          | The record does not state the value. **Never earns credit.**          |
| `NOT_RELEVANT` | 0          | The reviewed conditions exclude the scenario value.                   |

Contribution = weight × multiplier.
Relevance = 100 × Σ contribution ÷ Σ weight of specified dimensions.
Direct-condition coverage = 100 × Σ weight of `DIRECT` dimensions ÷ Σ weight of specified dimensions.

## Rules per dimension

**Oxygen, pressure, airflow (range rule).**

- Both bounds stated and the value inside them (bounds included): `DIRECT`.
- Outside, but within 20 % of the nearest tested bound (|value − bound| ≤ 0.2 × bound): `RELATED`.
- Further outside: `NOT_RELEVANT`.
- Either bound missing: `UNKNOWN`. A half-open range is never a match.
- A bound of 0 (for example quiescent airflow, 0–0 m/s) has no 20 % band.

**Gravity.** The evidence level is `gravityValue`; if that is null, `microgravity` counts as 0 g and `normal_gravity` as 1 g. Other conditions without a value are `UNKNOWN`. A scenario at or below 0.01 g is microgravity; within 0.05 g of 1 g is normal gravity.

| Scenario                     | Microgravity evidence | Evidence at the same level (±0.02 g) | Evidence at another level |
| ---------------------------- | --------------------- | ------------------------------------ | ------------------------- |
| Microgravity (ISS)           | `DIRECT`              | –                                    | `NOT_RELEVANT`            |
| Partial gravity (Moon, Mars) | `BOUNDING`            | `DIRECT`                             | `BOUNDING`                |
| Normal or hypergravity       | `NOT_RELEVANT`        | `DIRECT`                             | `NOT_RELEVANT`            |

Microgravity evidence is never `DIRECT` for a Moon (~0.166 g) or Mars (~0.38 g) scenario.

**Safety objective.** The goal is in the record's `safetyCategories`: `DIRECT`. Not in it: `NOT_RELEVANT`. No category reviewed: `UNKNOWN`.

**Material / fuel.**

- The named material appears in the record's `material` text (whole words, case and punctuation ignored): `DIRECT`.
- Only a fuel type given and it matches: `DIRECT`. It differs: `NOT_RELEVANT`.
- The material is not found, but the fuel types match: `RELATED`. The fuel types differ: `NOT_RELEVANT`.
- The record gives neither material nor fuel type: `UNKNOWN`.

**Measurement.** Scored only when a safety goal is chosen. A record measurement containing a keyword for that goal: `DIRECT`. Measurements listed but none on the list: `RELATED`. No measurements listed: `UNKNOWN`.

| Goal        | Keywords                                                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prevention  | flame spread, spread rate, flammability, oxygen index, limiting oxygen, ignition, burning rate, regression, heat release, flame length, flame size, flame growth, flame shape |
| Detection   | smoke, particle, particulate, aerosol, carbon monoxide, carbon dioxide, CO2, detector, soot                                                                                   |
| Suppression | extinction, extinguish, suppress, quench, nitrogen, carbon dioxide, CO2, diluent, dilution, inert                                                                             |

## Research coverage gaps

For each specified dimension, take the strongest state any reviewed investigation reaches:

| Strongest state                   | Gap state  | Coverage |
| --------------------------------- | ---------- | -------- |
| `DIRECT`                          | `DIRECT`   | 1.00     |
| `RELATED`                         | `INDIRECT` | 0.65     |
| `BOUNDING`                        | `BOUNDING` | 0.40     |
| `UNKNOWN`, `NOT_RELEVANT` or none | `MISSING`  | 0        |

**Gap Priority = Importance Weight × (1 − Coverage)**, where the importance weight is the dimension weight. Gaps are listed highest priority first. A gap is a **research coverage gap** in the reviewed corpus, never a hazard.

## Research questions

One question per gap that is not `DIRECT`, in priority order, from fixed templates. Each ends with a sentence stating the gap state; a `MISSING` gap ends with "The reviewed evidence does not establish this." Every question carries the label `PROJECT-GENERATED RESEARCH QUESTION`. They are not NASA recommendations.

## Fixed principles

- Unknown is never credit, and a missing value is never filled with a typical value.
- Microgravity is at most `BOUNDING` evidence for partial gravity.
- Relevance and direct-condition coverage are separate outputs; neither is a probability.
- Deterministic: no randomness and no language model. The same inputs give the same scores and order (ties break on direct coverage, then record id).
- Draft and deprecated records are never scored.

## Limitations

- IGNIS is a research-navigation prototype. It does not estimate fire probability and is not a certification or safety-assessment tool.
- The weights, multipliers, 20 % band and keyword lists are team judgements, documented here, not NASA values.
- Single-value ranges are exact: a scenario value that differs from a stated single value only by rounding (101.3 versus 101.325 kPa) is `RELATED`, not `DIRECT`. Enter values at the precision the presets use.
- Keyword matching is literal; a measurement described in other words is `RELATED`, not `DIRECT`.

## Change log

| Date       | Version                | Change                     | By            |
| ---------- | ---------------------- | -------------------------- | ------------- |
| 2026-11-14 | `ignis-methodology-v1` | First approved methodology | human:member3 |
