import type { Investigation } from "@/lib/okf/types";
import { formatNumber, formatRange, UNKNOWN_LABEL } from "@/lib/utils/numbers";

export interface ExperimentField {
  label: string;
  value: string;
  /** True for measured quantities, which render in the monospace face. */
  numeric?: boolean;
}

const GRAVITY_LABELS: Record<NonNullable<Investigation["gravityCondition"]>, string> = {
  microgravity: "Microgravity",
  partial_gravity: "Partial gravity",
  normal_gravity: "Normal gravity",
  hypergravity: "Hypergravity",
  variable: "Variable",
};

export function gravityLabel(investigation: Investigation): string {
  const condition = investigation.gravityCondition ? GRAVITY_LABELS[investigation.gravityCondition] : null;
  const value = investigation.gravityValue !== null ? formatNumber(investigation.gravityValue, "g") : null;
  if (condition && value) return `${condition} (${value})`;
  return condition ?? value ?? UNKNOWN_LABEL;
}

function list(values: string[]): string {
  return values.length > 0 ? values.join(", ") : UNKNOWN_LABEL;
}

/** Experimental conditions, in the order every view shows them. */
export function conditionFields(investigation: Investigation): ExperimentField[] {
  return [
    { label: "Fuel type", value: investigation.fuelType ?? UNKNOWN_LABEL },
    { label: "Material", value: investigation.material ?? UNKNOWN_LABEL },
    { label: "Sample shape", value: investigation.sampleShape ?? UNKNOWN_LABEL },
    { label: "Sample size", value: investigation.sampleSize ?? UNKNOWN_LABEL },
    {
      label: "Oxygen",
      value: formatRange(investigation.oxygenMin, investigation.oxygenMax, "% O2"),
      numeric: true,
    },
    {
      label: "Pressure",
      value: formatRange(investigation.pressureMin, investigation.pressureMax, "kPa"),
      numeric: true,
    },
    {
      label: "Airflow",
      value: formatRange(investigation.airflowMin, investigation.airflowMax, "m/s"),
      numeric: true,
    },
    { label: "Gravity", value: gravityLabel(investigation) },
    { label: "Platform", value: investigation.platform ?? UNKNOWN_LABEL },
    { label: "Hardware", value: list(investigation.hardware) },
    { label: "Sensors", value: list(investigation.sensors) },
    { label: "Measurements", value: list(investigation.measurements) },
    { label: "Variables", value: list(investigation.variables) },
    { label: "Safety categories", value: list(investigation.safetyCategories) },
  ];
}
