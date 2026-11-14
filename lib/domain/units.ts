/**
 * Unit conversion and null-safe numeric helpers.
 *
 * Engineering utilities only. Conversions use exact or standard definitions.
 * Nothing here decides what counts as "close", "similar" or "safe": any
 * tolerance is passed in by the caller and comes from the methodology.
 *
 * Internal units: pressure kPa, oxygen percent by volume, airflow m/s, gravity g.
 */

export const KPA_PER_PSI = 6.894757293168;
export const KPA_PER_ATM = 101.325;
export const KPA_PER_BAR = 100;
export const KPA_PER_MMHG = 101.325 / 760;
export const STANDARD_GRAVITY_MS2 = 9.80665;

export function isKnownNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export type PressureUnit = "kPa" | "Pa" | "psi" | "atm" | "bar" | "mmHg" | "torr";

const PRESSURE_TO_KPA: Record<PressureUnit, number> = {
  kPa: 1,
  Pa: 0.001,
  psi: KPA_PER_PSI,
  atm: KPA_PER_ATM,
  bar: KPA_PER_BAR,
  mmHg: KPA_PER_MMHG,
  torr: KPA_PER_MMHG,
};

/** Pressure in kPa, or null for a missing, non-finite or negative value. */
export function toKPa(value: number | null, unit: PressureUnit): number | null {
  if (!isKnownNumber(value) || value < 0) return null;
  return value * PRESSURE_TO_KPA[unit];
}

export function fromKPa(value: number | null, unit: PressureUnit): number | null {
  if (!isKnownNumber(value) || value < 0) return null;
  return value / PRESSURE_TO_KPA[unit];
}

export const psiToKPa = (psi: number | null) => toKPa(psi, "psi");
export const kPaToPsi = (kPa: number | null) => fromKPa(kPa, "psi");

export type OxygenUnit = "percent" | "fraction";

/** Oxygen as percent by volume. Null outside the physically possible 0 to 100 range. */
export function toOxygenPercent(value: number | null, unit: OxygenUnit): number | null {
  if (!isKnownNumber(value)) return null;
  const percent = unit === "fraction" ? value * 100 : value;
  return percent >= 0 && percent <= 100 ? percent : null;
}

export type AirflowUnit = "m/s" | "cm/s" | "mm/s" | "ft/s" | "ft/min";

const AIRFLOW_TO_MS: Record<AirflowUnit, number> = {
  "m/s": 1,
  "cm/s": 0.01,
  "mm/s": 0.001,
  "ft/s": 0.3048,
  "ft/min": 0.3048 / 60,
};

/** Flow speed in m/s, or null for a missing, non-finite or negative value. */
export function toMetersPerSecond(value: number | null, unit: AirflowUnit): number | null {
  if (!isKnownNumber(value) || value < 0) return null;
  return value * AIRFLOW_TO_MS[unit];
}

export type GravityUnit = "g" | "m/s2";

/** Gravity in g, or null for a missing, non-finite or negative value. */
export function toG(value: number | null, unit: GravityUnit): number | null {
  if (!isKnownNumber(value) || value < 0) return null;
  return unit === "g" ? value : value / STANDARD_GRAVITY_MS2;
}

/* ------------------------------- ranges ---------------------------------- */

export interface NumericRange {
  min: number | null;
  max: number | null;
}

export type RangeKnowledge = "closed" | "lower-bound-only" | "upper-bound-only" | "unknown";

export function describeRange(range: NumericRange): RangeKnowledge {
  const hasMin = isKnownNumber(range.min);
  const hasMax = isKnownNumber(range.max);
  if (hasMin && hasMax) return "closed";
  if (hasMin) return "lower-bound-only";
  if (hasMax) return "upper-bound-only";
  return "unknown";
}

/**
 * Three-valued containment: true, false, or null when the range does not say
 * enough to tell. A missing bound is never treated as "no limit".
 */
export function rangeContains(range: NumericRange, value: number | null): boolean | null {
  if (!isKnownNumber(value)) return null;
  if (isKnownNumber(range.min) && value < range.min) return false;
  if (isKnownNumber(range.max) && value > range.max) return false;
  return describeRange(range) === "closed" ? true : null;
}

/** Three-valued overlap of two ranges, with the same treatment of missing bounds. */
export function rangesOverlap(a: NumericRange, b: NumericRange): boolean | null {
  if (isKnownNumber(a.min) && isKnownNumber(b.max) && a.min > b.max) return false;
  if (isKnownNumber(b.min) && isKnownNumber(a.max) && b.min > a.max) return false;
  return describeRange(a) === "closed" && describeRange(b) === "closed" ? true : null;
}

/* ----------------------------- comparison -------------------------------- */

/** Sort comparator that puts unknown values last, whatever the direction. */
export function compareNullableNumbers(
  a: number | null,
  b: number | null,
  direction: "asc" | "desc" = "asc",
): number {
  const aKnown = isKnownNumber(a);
  const bKnown = isKnownNumber(b);
  if (!aKnown && !bKnown) return 0;
  if (!aKnown) return 1;
  if (!bKnown) return -1;
  return direction === "asc" ? a - b : b - a;
}

/**
 * Equality within a caller-supplied absolute tolerance. Null when either side
 * is unknown. There is deliberately no default tolerance.
 */
export function equalWithin(a: number | null, b: number | null, tolerance: number): boolean | null {
  if (!isKnownNumber(a) || !isKnownNumber(b)) return null;
  return Math.abs(a - b) <= tolerance;
}

/** Case- and whitespace-insensitive text equality. Null when either side is missing. */
export function sameText(a: string | null, b: string | null): boolean | null {
  if (a === null || b === null) return null;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
