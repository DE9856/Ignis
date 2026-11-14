import { sameText } from "@/lib/domain/units";
import type { Investigation } from "@/lib/okf/types";
import { formatNumber, formatRange, UNKNOWN_LABEL } from "@/lib/utils/numbers";

/**
 * Investigation[] -> rows for a side-by-side comparison.
 * Unknown values stay unknown; a row is only "same" when every value is known and equal.
 */

export interface ComparisonCell {
  display: string;
  isUnknown: boolean;
}

export interface ComparisonRow {
  key: string;
  label: string;
  cells: ComparisonCell[];
  /** true: all known and equal. false: known values differ. null: cannot tell. */
  allSame: boolean | null;
}

export interface ComparisonViewModel {
  columns: { id: string; title: string; status: Investigation["status"] }[];
  rows: ComparisonRow[];
}

const cell = (display: string): ComparisonCell => ({ display, isUnknown: display === UNKNOWN_LABEL });
const textCell = (value: string | null) => cell(value ?? UNKNOWN_LABEL);
const listCell = (values: string[]) => cell(values.length > 0 ? values.join(", ") : UNKNOWN_LABEL);

const ROWS: { key: string; label: string; read: (investigation: Investigation) => ComparisonCell }[] = [
  { key: "safetyCategories", label: "Fire-safety role", read: (i) => listCell(i.safetyCategories) },
  { key: "fuelType", label: "Fuel type", read: (i) => textCell(i.fuelType) },
  { key: "material", label: "Material", read: (i) => textCell(i.material) },
  { key: "sampleShape", label: "Sample shape", read: (i) => textCell(i.sampleShape) },
  { key: "sampleSize", label: "Sample size", read: (i) => textCell(i.sampleSize) },
  { key: "oxygen", label: "Oxygen", read: (i) => cell(formatRange(i.oxygenMin, i.oxygenMax, "% O2")) },
  { key: "pressure", label: "Pressure", read: (i) => cell(formatRange(i.pressureMin, i.pressureMax, "kPa")) },
  { key: "airflow", label: "Airflow", read: (i) => cell(formatRange(i.airflowMin, i.airflowMax, "m/s")) },
  { key: "gravityCondition", label: "Gravity condition", read: (i) => textCell(i.gravityCondition) },
  { key: "gravityValue", label: "Gravity level", read: (i) => cell(formatNumber(i.gravityValue, "g")) },
  { key: "platform", label: "Platform", read: (i) => textCell(i.platform) },
  { key: "hardware", label: "Hardware", read: (i) => listCell(i.hardware) },
  { key: "sensors", label: "Sensors", read: (i) => listCell(i.sensors) },
  { key: "measurements", label: "Measurements", read: (i) => listCell(i.measurements) },
  { key: "variables", label: "Variables", read: (i) => listCell(i.variables) },
];

function allSame(cells: ComparisonCell[]): boolean | null {
  if (cells.length < 2 || cells.some((entry) => entry.isUnknown)) return null;
  return cells.every((entry) => sameText(entry.display, cells[0].display) === true);
}

export function buildComparisonViewModel(investigations: Investigation[]): ComparisonViewModel {
  return {
    columns: investigations.map((investigation) => ({
      id: investigation.id,
      title: investigation.shortTitle ?? investigation.title,
      status: investigation.status,
    })),
    rows: ROWS.map(({ key, label, read }) => {
      const cells = investigations.map(read);
      return { key, label, cells, allSame: allSame(cells) };
    }),
  };
}
