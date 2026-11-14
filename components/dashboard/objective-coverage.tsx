import { EvidenceCoverageChart } from "@/components/charts/evidence-coverage-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { SAFETY_LABELS, SAFETY_LETTERS } from "@/components/shared/labels";
import type { CoverageByObjective } from "@/lib/integration/dashboard";

/**
 * Investigation records per fire-safety objective, split by review status.
 * Counts of records, straight from the knowledge base; the numbers are printed
 * beside the chart so the tooltip never gates them.
 */
export function ObjectiveCoverage({ coverage }: { coverage: CoverageByObjective[] }) {
  const hasData = coverage.some((entry) => entry.humanReviewed + entry.notReviewed > 0);

  if (!hasData) {
    return (
      <EmptyState
        size="compact"
        description="Counted from investigation records tagged prevention, detection or suppression."
      />
    );
  }

  return (
    <div className="space-y-2">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px] bg-mark-reviewed" />
          Human reviewed
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px] bg-mark-muted" />
          Not yet reviewed
        </li>
      </ul>
      <EvidenceCoverageChart
        data={coverage.map((entry) => ({
          label: SAFETY_LABELS[entry.objective],
          verified: entry.humanReviewed,
          unverified: entry.notReviewed,
        }))}
      />
      <table className="w-full text-left text-xs">
        <caption className="sr-only">Investigation records per fire-safety objective</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Objective</th>
            <th scope="col">Human reviewed</th>
            <th scope="col">Not yet reviewed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line border-t border-line">
          {coverage.map((entry) => (
            <tr key={entry.objective}>
              <th scope="row" className="py-1.5 font-normal text-ink-muted">
                <span aria-hidden className="mr-2 font-mono text-2xs text-ink-faint">
                  {SAFETY_LETTERS[entry.objective]}
                </span>
                {SAFETY_LABELS[entry.objective]}
              </th>
              <td className="py-1.5 text-right font-mono text-ink tabular-nums">
                {entry.humanReviewed}
                <span className="sr-only"> human reviewed</span>
              </td>
              <td className="w-24 py-1.5 text-right font-mono text-ink-faint tabular-nums">
                +{entry.notReviewed}
                <span className="font-sans"> draft</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
