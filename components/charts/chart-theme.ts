/**
 * Recharts configuration shared by every chart, so charts read as one system.
 * Colours are CSS variables from app/globals.css; nothing here is a raw colour.
 *
 * Mark rules (see components/README.md): bars at most 24px thick with a 4px
 * rounded data end, a 2px surface-coloured gap between touching segments,
 * hairline solid gridlines, mono tick labels, text in ink tokens only.
 */

export const CHART_COLORS = {
  reviewed: "var(--color-mark-reviewed)",
  notReviewed: "var(--color-mark-muted)",
  evidenceDirect: "var(--color-evidence-direct)",
  evidenceRelated: "var(--color-evidence-related)",
  evidenceBounding: "var(--color-evidence-bounding)",
  surface: "var(--color-surface)",
  grid: "var(--color-line)",
  ink: "var(--color-ink)",
  inkMuted: "var(--color-ink-muted)",
  inkFaint: "var(--color-ink-faint)",
} as const;

export const BAR_SIZE = 14;
export const BAR_GAP_STROKE = { stroke: CHART_COLORS.surface, strokeWidth: 2 } as const;

const tickStyle = { fill: CHART_COLORS.inkFaint, fontSize: 11, fontFamily: "var(--font-mono)" };

export const axisProps = {
  stroke: CHART_COLORS.grid,
  tick: tickStyle,
  tickLine: false,
  axisLine: false,
} as const;

export const categoryAxisProps = {
  ...axisProps,
  tick: { ...tickStyle, fill: CHART_COLORS.inkMuted, fontFamily: "var(--font-sans)", fontSize: 12 },
} as const;

export const gridProps = { stroke: CHART_COLORS.grid, strokeWidth: 1 } as const;

export const tooltipCursor = { fill: "var(--color-raised)", opacity: 0.5 } as const;
