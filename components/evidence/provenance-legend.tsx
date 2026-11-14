import { PROVENANCE_CLASSES, type ProvenanceClass } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { PROVENANCE_INFO, ProvenanceBadge } from "./provenance-badge";

interface ProvenanceLegendProps {
  /** Classes to list, in the standard order. Defaults to all of them. */
  classes?: readonly ProvenanceClass[];
  /** `inline` is a single wrapped row of badges; `table` adds each meaning. */
  variant?: "inline" | "table";
  className?: string;
}

/** Key to the provenance badges, for the foot of a page or the Methodology page. */
export function ProvenanceLegend({
  classes = PROVENANCE_CLASSES,
  variant = "inline",
  className,
}: ProvenanceLegendProps) {
  const ordered = PROVENANCE_CLASSES.filter((value) => classes.includes(value));

  if (variant === "table") {
    return (
      <dl className={cn("divide-y divide-line", className)}>
        {ordered.map((value) => (
          <div
            key={value}
            className="grid gap-x-4 gap-y-1 px-4 py-2.5 sm:grid-cols-[13rem_1fr] sm:items-center"
          >
            <dt>
              <ProvenanceBadge value={value} />
            </dt>
            <dd className="text-sm2 text-ink-muted">{PROVENANCE_INFO[value].meaning}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1.5", className)}>
      <span className="mr-1 font-mono text-2xs tracking-[0.08em] text-ink-faint uppercase">Provenance</span>
      {ordered.map((value) => (
        <ProvenanceBadge key={value} value={value} />
      ))}
    </div>
  );
}
