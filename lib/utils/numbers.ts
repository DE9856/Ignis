/** Text shown wherever a scientific value has not been recorded. */
export const UNKNOWN_LABEL = "Unknown";

const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

export function formatNumber(value: number | null, unit?: string): string {
  if (value === null || !Number.isFinite(value)) return UNKNOWN_LABEL;
  const text = formatter.format(value);
  return unit ? `${text} ${unit}` : text;
}

/** "18 – 21 %", "≥ 18 %", "≤ 21 %", or "Unknown". Never fills in a missing bound. */
export function formatRange(min: number | null, max: number | null, unit?: string): string {
  const suffix = unit ? ` ${unit}` : "";
  if (min === null && max === null) return UNKNOWN_LABEL;
  if (min !== null && max !== null) {
    return min === max
      ? `${formatter.format(min)}${suffix}`
      : `${formatter.format(min)} – ${formatter.format(max)}${suffix}`;
  }
  return min !== null
    ? `≥ ${formatter.format(min)}${suffix}`
    : `≤ ${formatter.format(max as number)}${suffix}`;
}

/** Parse a form field. Blank or non-numeric input is null, not zero. */
export function parseOptionalNumber(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function formatPercent(fraction: number | null): string {
  if (fraction === null || !Number.isFinite(fraction)) return UNKNOWN_LABEL;
  return `${Math.round(fraction * 100)}%`;
}
