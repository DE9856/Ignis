"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface CoverageDatum {
  /** Category label, e.g. a safety objective. */
  label: string;
  verified: number;
  unverified: number;
}

/**
 * Investigation counts per category, split by review status.
 * Only render this with real counts; the caller shows an empty state otherwise.
 */
export function EvidenceCoverageChart({ data }: { data: CoverageDatum[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="30%">
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--color-line-strong)"
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            stroke="var(--color-line-strong)"
            tick={{ fill: "var(--color-ink-muted)", fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--color-raised)" }}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line-strong)",
              borderRadius: 6,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--color-ink)" }}
            itemStyle={{ color: "var(--color-ink-muted)" }}
          />
          <Legend
            iconType="square"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => <span style={{ color: "var(--color-ink-muted)" }}>{value}</span>}
          />
          <Bar
            dataKey="verified"
            name="Verified"
            stackId="status"
            fill="var(--color-reviewed)"
            isAnimationActive={false}
          />
          <Bar
            dataKey="unverified"
            name="Not yet verified"
            stackId="status"
            fill="var(--color-ink-faint)"
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
