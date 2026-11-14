import { displayTitle } from "@/components/experiments/experiment-fields";
import { GrowIn } from "@/components/motion/grow-in";
import { EmptyState } from "@/components/shared/empty-state";
import { GRAVITY_LABELS } from "@/components/shared/labels";
import type { ScenarioAnalysis } from "@/lib/integration/scenario";
import type { Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { ConditionEnvelope, type EnvelopeRow } from "./condition-envelope";

const DEFAULT_LIMIT = 8;

function rowsFor(
  investigations: Investigation[],
  read: (investigation: Investigation) => Pick<EnvelopeRow, "min" | "max" | "note">,
): EnvelopeRow[] {
  return investigations.map((investigation) => ({
    id: investigation.id,
    label: displayTitle(investigation),
    href: `/explore#${investigation.id}`,
    ...read(investigation),
  }));
}

/**
 * Small multiples: oxygen, pressure, gravity and airflow envelopes for the
 * top-ranked reviewed investigations, each against the scenario value.
 */
export function ConditionEnvelopes({
  analysis,
  limit = DEFAULT_LIMIT,
  className,
}: {
  analysis: ScenarioAnalysis;
  limit?: number;
  className?: string;
}) {
  if (analysis.consideredCount === 0) {
    return (
      <EmptyState
        description="Tested oxygen, pressure, gravity and airflow ranges are drawn here from reviewed records."
        className={className}
      />
    );
  }

  const investigations = analysis.ranked.slice(0, limit).map((entry) => entry.investigation);
  const hidden = analysis.ranked.length - investigations.length;
  const { scenario } = analysis;

  return (
    <div className={cn("space-y-3", className)}>
      <GrowIn className="grid gap-3 2xl:grid-cols-2">
        <ConditionEnvelope
          title="Oxygen"
          unit="% O₂"
          scenarioValue={scenario.oxygenPercent}
          rows={rowsFor(investigations, (i) => ({ min: i.oxygenMin, max: i.oxygenMax }))}
        />
        <ConditionEnvelope
          title="Pressure"
          unit="kPa"
          scenarioValue={scenario.pressureKPa}
          rows={rowsFor(investigations, (i) => ({ min: i.pressureMin, max: i.pressureMax }))}
        />
        <ConditionEnvelope
          title="Gravity"
          unit="g"
          scenarioValue={scenario.gravityG}
          rows={rowsFor(investigations, (i) => ({
            min: i.gravityValue,
            max: i.gravityValue,
            note: i.gravityCondition
              ? `${GRAVITY_LABELS[i.gravityCondition]}, level not reported`
              : undefined,
          }))}
        />
        <ConditionEnvelope
          title="Airflow"
          unit="m/s"
          scenarioValue={scenario.airflowMetersPerSecond}
          rows={rowsFor(investigations, (i) => ({ min: i.airflowMin, max: i.airflowMax }))}
        />
      </GrowIn>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-4 rounded-full bg-evidence-direct" />
          Range includes the scenario value
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-4 rounded-full bg-mark-muted" />
          Range excludes it
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="w-4 border-t-2 border-dashed border-ink-faint/60" />
          One bound reported
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="h-3 w-0.5 rounded-full bg-accent" />
          Scenario value
        </li>
        {hidden > 0 ? (
          <li className="text-ink-faint">
            Top {investigations.length} by relevance; {hidden} more not drawn.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
