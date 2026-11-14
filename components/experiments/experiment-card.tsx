import { StatusBadge } from "@/components/shared/status-badge";
import type { Investigation } from "@/lib/okf/types";

import { conditionFields } from "./experiment-fields";
import { ExperimentValue } from "./experiment-value";

const SUMMARY_FIELDS = ["Fuel type", "Material", "Oxygen", "Pressure", "Gravity"];

/** Compact summary of one investigation, for grids and result lists. */
export function ExperimentCard({ investigation }: { investigation: Investigation }) {
  const fields = conditionFields(investigation).filter((field) => SUMMARY_FIELDS.includes(field.label));

  return (
    <article className="rounded-md border border-line bg-surface p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">
            {investigation.shortTitle ?? investigation.title}
          </h3>
          <p className="truncate text-xs text-ink-faint">{investigation.program ?? "Program unknown"}</p>
        </div>
        <StatusBadge status={investigation.status} />
      </header>
      <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-xs">
        {fields.map((field) => (
          <div key={field.label} className="contents">
            <dt className="text-ink-muted">{field.label}</dt>
            <dd>
              <ExperimentValue value={field.value} numeric={field.numeric} />
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
