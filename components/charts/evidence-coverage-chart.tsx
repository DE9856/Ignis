"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";

import {
  axisProps,
  BAR_GAP_STROKE,
  BAR_SIZE,
  categoryAxisProps,
  CHART_COLORS,
  gridProps,
  tooltipCursor,
} from "./chart-theme";

export interface CoverageDatum {
  /** Category label, e.g. a safety objective. */
  label: string;
  verified: number;
  unverified: number;
}

const ROW_HEIGHT = 34;
const AXIS_HEIGHT = 22;

/**
 * Investigation counts per category, split by review status, as horizontal
 * stacked bars. Only render this with real counts; the caller shows an empty
 * state otherwise, and also prints the numbers so the tooltip never gates them.
 */
export function EvidenceCoverageChart({ data }: { data: CoverageDatum[] }) {
  const height = data.length * ROW_HEIGHT + AXIS_HEIGHT + 8;
  return (
    <div className="w-full" style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 0, left: 0 }}
          barSize={BAR_SIZE}
        >
          <CartesianGrid {...gridProps} horizontal={false} />
          <XAxis type="number" allowDecimals={false} {...axisProps} height={AXIS_HEIGHT} />
          <YAxis type="category" dataKey="label" width={92} {...categoryAxisProps} />
          <Tooltip cursor={tooltipCursor} content={CoverageTooltip} isAnimationActive={false} />
          <Bar
            dataKey="verified"
            name="Human reviewed"
            stackId="status"
            fill={CHART_COLORS.reviewed}
            {...BAR_GAP_STROKE}
            isAnimationActive={false}
          />
          <Bar
            dataKey="unverified"
            name="Not yet reviewed"
            stackId="status"
            fill={CHART_COLORS.notReviewed}
            radius={[0, 4, 4, 0]}
            {...BAR_GAP_STROKE}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CoverageTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-line-strong bg-raised px-3 py-2 text-xs shadow-lg shadow-black/30">
      <p className="mb-1 font-medium text-ink">{label}</p>
      {payload.map((entry) => (
        <p key={String(entry.dataKey)} className="flex items-center gap-2 text-ink-muted">
          <span aria-hidden className="size-2 rounded-[2px]" style={{ background: entry.color }} />
          {entry.name}
          <span className="ml-auto pl-3 font-mono text-ink tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}
