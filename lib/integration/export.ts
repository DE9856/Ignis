import { canUseForAnalytics } from "@/lib/domain/provenance";
import { DISCLAIMER } from "@/lib/navigation";
import type { Investigation } from "@/lib/okf/types";

/**
 * Machine-readable export of the reviewed test conditions, for people building
 * flammability or fire-scenario models from the evidence.
 *
 * Only human-reviewed records are exported. A value the sources do not state
 * stays null (an empty CSV cell); nothing is filled in or averaged.
 */

export const EXPORT_PATHS = {
  csv: "/api/export/investigations.csv",
  json: "/api/export/investigations.json",
} as const;

export interface ExportRecord {
  id: string;
  title: string;
  shortTitle: string | null;
  safetyCategories: string[];
  fuelType: string | null;
  material: string | null;
  sampleShape: string | null;
  sampleSize: string | null;
  oxygenMinPercent: number | null;
  oxygenMaxPercent: number | null;
  pressureMinKPa: number | null;
  pressureMaxKPa: number | null;
  airflowMinMetersPerSecond: number | null;
  airflowMaxMetersPerSecond: number | null;
  gravityCondition: string | null;
  gravityG: number | null;
  platform: string | null;
  hardware: string[];
  sensors: string[];
  measurements: string[];
  variables: string[];
  reviewedBy: string[];
  primarySource: string | null;
  sources: string[];
}

/** Column order for both formats. */
export const EXPORT_COLUMNS: (keyof ExportRecord)[] = [
  "id",
  "title",
  "shortTitle",
  "safetyCategories",
  "fuelType",
  "material",
  "sampleShape",
  "sampleSize",
  "oxygenMinPercent",
  "oxygenMaxPercent",
  "pressureMinKPa",
  "pressureMaxKPa",
  "airflowMinMetersPerSecond",
  "airflowMaxMetersPerSecond",
  "gravityCondition",
  "gravityG",
  "platform",
  "hardware",
  "sensors",
  "measurements",
  "variables",
  "reviewedBy",
  "primarySource",
  "sources",
];

export function toExportRecords(investigations: Investigation[]): ExportRecord[] {
  return investigations
    .filter((investigation) => canUseForAnalytics(investigation))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((investigation) => ({
      id: investigation.id,
      title: investigation.title,
      shortTitle: investigation.shortTitle,
      safetyCategories: investigation.safetyCategories,
      fuelType: investigation.fuelType,
      material: investigation.material,
      sampleShape: investigation.sampleShape,
      sampleSize: investigation.sampleSize,
      oxygenMinPercent: investigation.oxygenMin,
      oxygenMaxPercent: investigation.oxygenMax,
      pressureMinKPa: investigation.pressureMin,
      pressureMaxKPa: investigation.pressureMax,
      airflowMinMetersPerSecond: investigation.airflowMin,
      airflowMaxMetersPerSecond: investigation.airflowMax,
      gravityCondition: investigation.gravityCondition,
      gravityG: investigation.gravityValue,
      platform: investigation.platform,
      hardware: investigation.hardware,
      sensors: investigation.sensors,
      measurements: investigation.measurements,
      variables: investigation.variables,
      reviewedBy: investigation.verified.map((entry) => entry.by),
      primarySource: investigation.resource,
      sources: investigation.sources.map((source) => source.resource),
    }));
}

function csvCell(value: ExportRecord[keyof ExportRecord]): string {
  if (value === null) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  // Quote every text cell; also neutralise a leading formula character for spreadsheets.
  if (typeof value === "number") return text;
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** RFC 4180 CSV. Lists are joined with "; ". Empty cell = not stated in the sources. */
export function toCsv(records: ExportRecord[]): string {
  const lines = [EXPORT_COLUMNS.join(",")];
  for (const record of records) lines.push(EXPORT_COLUMNS.map((column) => csvCell(record[column])).join(","));
  return `${lines.join("\r\n")}\r\n`;
}

export interface ExportDocument {
  description: string;
  disclaimer: string;
  units: Record<string, string>;
  nullMeans: string;
  count: number;
  records: ExportRecord[];
}

export function toExportDocument(investigations: Investigation[]): ExportDocument {
  const records = toExportRecords(investigations);
  return {
    description:
      "Tested condition ranges of human-reviewed NASA microgravity combustion investigations, transcribed by IGNIS from cited NASA sources. Ranges span the tests in each investigation; they are not per-test values.",
    disclaimer: DISCLAIMER,
    units: {
      oxygen: "percent by volume",
      pressure: "kPa, absolute",
      airflow: "m/s, forced flow speed",
      gravity: "g (1 = Earth surface)",
    },
    nullMeans: "Not stated in the reviewed sources. Never an estimate.",
    count: records.length,
    records,
  };
}
