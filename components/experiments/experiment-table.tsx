import { SafetyRole } from "@/components/shared/safety-badges";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { displayTitle, keyConditions } from "./experiment-fields";
import { ExperimentValue } from "./experiment-value";

interface ExperimentTableProps {
  investigations: Investigation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

/** Dense overview: one row per investigation, key conditions in fixed columns. */
export function ExperimentTable({ investigations, selectedId = null, onSelect }: ExperimentTableProps) {
  const columns =
    investigations.length > 0 ? keyConditions(investigations[0]).map((field) => field.label) : [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[60rem] border-collapse text-left text-sm2">
        <thead>
          <tr className="border-b border-line">
            {["Investigation", "Role", ...columns, "Review"].map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-mono text-2xs font-medium tracking-[0.06em] whitespace-nowrap text-ink-faint uppercase first:pl-4"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {investigations.map((investigation) => {
            const selected = investigation.id === selectedId;
            return (
              <tr
                key={investigation.id}
                className={cn("transition-colors", selected ? "bg-accent/[0.06]" : "hover:bg-raised/50")}
              >
                <th scope="row" className="py-2 pr-3 pl-4 font-medium">
                  {onSelect ? (
                    <button
                      type="button"
                      onClick={() => onSelect(investigation.id)}
                      aria-current={selected ? "true" : undefined}
                      className={cn("text-left hover:text-accent", selected ? "text-accent" : "text-ink")}
                    >
                      {displayTitle(investigation)}
                    </button>
                  ) : (
                    <a href={`#${investigation.id}`} className="text-ink hover:text-accent">
                      {displayTitle(investigation)}
                    </a>
                  )}
                  <span className="block text-2xs font-normal text-ink-faint">
                    {investigation.program ?? "Program not reported"}
                  </span>
                </th>
                <td className="px-3 py-2">
                  <SafetyRole objectives={investigation.safetyCategories} />
                </td>
                {keyConditions(investigation).map((field) => (
                  <td key={field.key} className={cn("px-3 py-2", field.numeric && "whitespace-nowrap")}>
                    <ExperimentValue value={field.value} numeric={field.numeric} />
                  </td>
                ))}
                <td className="px-3 py-2 pr-4">
                  <StatusBadge status={investigation.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
