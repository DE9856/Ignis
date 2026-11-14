import { GRAVITY_LABELS, NOT_REPORTED, SAFETY_LABELS } from "@/components/shared/labels";
import type { Investigation } from "@/lib/okf/types";
import { formatNumber, formatRange, UNKNOWN_LABEL } from "@/lib/utils/numbers";

export interface ExperimentField {
  key: string;
  label: string;
  /** Display text. A missing value is the string "Not reported", never blank. */
  value: string;
  /** True for measured quantities, which render in the monospace face. */
  numeric?: boolean;
}

/** "Microgravity (0 g)", "Microgravity", "0.16 g", or "Unknown" when neither is recorded. */
export function gravityLabel(investigation: Investigation): string {
  const condition = investigation.gravityCondition ? GRAVITY_LABELS[investigation.gravityCondition] : null;
  const value = investigation.gravityValue !== null ? formatNumber(investigation.gravityValue, "g") : null;
  if (condition && value && condition !== value) return `${condition} (${value})`;
  return condition ?? value ?? UNKNOWN_LABEL;
}

function text(value: string | null): string {
  return value ?? NOT_REPORTED;
}

function list(values: string[]): string {
  return values.length > 0 ? values.join(", ") : NOT_REPORTED;
}

function range(min: number | null, max: number | null, unit: string): string {
  const formatted = formatRange(min, max, unit);
  return formatted === UNKNOWN_LABEL ? NOT_REPORTED : formatted;
}

/** Experimental conditions, in the order every view shows them. Units are fixed per field. */
export function conditionFields(investigation: Investigation): ExperimentField[] {
  const gravity = gravityLabel(investigation);
  return [
    { key: "fuelType", label: "Fuel type", value: text(investigation.fuelType) },
    { key: "material", label: "Material", value: text(investigation.material) },
    { key: "sampleShape", label: "Sample shape", value: text(investigation.sampleShape) },
    { key: "sampleSize", label: "Sample size", value: text(investigation.sampleSize) },
    {
      key: "oxygen",
      label: "Oxygen",
      value: range(investigation.oxygenMin, investigation.oxygenMax, "% O₂"),
      numeric: true,
    },
    {
      key: "pressure",
      label: "Pressure",
      value: range(investigation.pressureMin, investigation.pressureMax, "kPa"),
      numeric: true,
    },
    {
      key: "airflow",
      label: "Airflow",
      value: range(investigation.airflowMin, investigation.airflowMax, "m/s"),
      numeric: true,
    },
    { key: "gravity", label: "Gravity", value: gravity === UNKNOWN_LABEL ? NOT_REPORTED : gravity },
    { key: "platform", label: "Platform", value: text(investigation.platform) },
    { key: "hardware", label: "Hardware", value: list(investigation.hardware) },
    { key: "sensors", label: "Sensors", value: list(investigation.sensors) },
    { key: "measurements", label: "Measurements", value: list(investigation.measurements) },
    { key: "variables", label: "Variables", value: list(investigation.variables) },
    {
      key: "safetyCategories",
      label: "Fire-safety role",
      value: list(investigation.safetyCategories.map((objective) => SAFETY_LABELS[objective])),
    },
  ];
}

/** The handful of conditions a card shows. */
export const KEY_CONDITION_KEYS = [
  "material",
  "fuelType",
  "oxygen",
  "pressure",
  "airflow",
  "gravity",
] as const;

export function keyConditions(investigation: Investigation): ExperimentField[] {
  const fields = conditionFields(investigation);
  return KEY_CONDITION_KEYS.map((key) => fields.find((field) => field.key === key)).filter(
    (field): field is ExperimentField => field !== undefined,
  );
}

/** The first sentence of the objective, for one-line summaries on cards. */
export function oneLineObjective(investigation: Investigation): string | null {
  const source = investigation.objective ?? investigation.description;
  if (!source) return null;
  const flat = source.replace(/\s+/g, " ").trim();
  const sentence = /^(.+?[.!?])(\s|$)/.exec(flat)?.[1] ?? flat;
  return sentence.length > 180 ? `${sentence.slice(0, 177).trimEnd()}…` : sentence;
}

export function displayTitle(investigation: Pick<Investigation, "shortTitle" | "title">): string {
  return investigation.shortTitle ?? investigation.title;
}
