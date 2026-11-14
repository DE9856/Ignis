"use client";

import { useState } from "react";

import { conditionFields } from "@/components/experiments/experiment-fields";
import { ExperimentValue } from "@/components/experiments/experiment-value";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

const MAX_SELECTED = 4;

/** Side-by-side conditions for up to four investigations. */
export function ComparisonTable({ investigations }: { investigations: Investigation[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    investigations.slice(0, 2).map((investigation) => investigation.id),
  );

  if (investigations.length < 2) {
    return (
      <EmptyState description="Comparison needs at least two investigation records. Add them under knowledge/investigations." />
    );
  }

  const toggle = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : current.length < MAX_SELECTED
          ? [...current, id]
          : current,
    );

  const selected = investigations.filter((investigation) => selectedIds.includes(investigation.id));
  const rows = selected.map((investigation) => conditionFields(investigation));
  const labels = rows[0]?.map((field) => field.label) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs text-ink-muted">Select up to {MAX_SELECTED} investigations</p>
        <ul className="flex flex-wrap gap-1.5">
          {investigations.map((investigation) => {
            const active = selectedIds.includes(investigation.id);
            return (
              <li key={investigation.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(investigation.id)}
                  className={cn(
                    "rounded border px-2 py-1 text-xs",
                    active
                      ? "border-accent bg-raised text-ink"
                      : "border-line-strong text-ink-muted hover:text-ink",
                  )}
                >
                  {investigation.shortTitle ?? investigation.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected.length < 2 ? (
        <EmptyState title="Select at least two investigations" />
      ) : (
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[40rem] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-raised/40">
                <th scope="col" className="w-40 px-3 py-2 text-[11px] font-medium text-ink-muted uppercase">
                  Field
                </th>
                {selected.map((investigation) => (
                  <th key={investigation.id} scope="col" className="px-3 py-2 align-top">
                    <span className="block font-semibold text-ink">
                      {investigation.shortTitle ?? investigation.title}
                    </span>
                    <StatusBadge status={investigation.status} className="mt-1" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {labels.map((label, rowIndex) => (
                <tr key={label}>
                  <th scope="row" className="px-3 py-1.5 font-normal text-ink-muted">
                    {label}
                  </th>
                  {rows.map((fields, columnIndex) => (
                    <td key={selected[columnIndex].id} className="px-3 py-1.5">
                      <ExperimentValue value={fields[rowIndex].value} numeric={fields[rowIndex].numeric} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
