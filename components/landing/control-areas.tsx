import Link from "next/link";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { Disclosure } from "@/components/shared/disclosure";
import type { ControlAreaView } from "@/lib/integration/controls";

const SHOWN = 2;

function Statements({ statements }: { statements: string[] }) {
  const item = (text: string) => (
    <li key={text} className="border-l border-line-strong pl-3">
      {text}
    </li>
  );
  return (
    <>
      <ul className="space-y-2.5 text-[0.875rem] leading-relaxed text-ink">
        {statements.slice(0, SHOWN).map(item)}
      </ul>
      {statements.length > SHOWN ? (
        <Disclosure
          summary={`${statements.length - SHOWN} more NASA ${statements.length - SHOWN === 1 ? "statement" : "statements"}`}
          className="mt-3"
        >
          <ul className="space-y-2.5 pt-2 text-[0.875rem] leading-relaxed text-ink">
            {statements.slice(SHOWN).map(item)}
          </ul>
        </Disclosure>
      ) : null}
    </>
  );
}

/**
 * Fire-safety controls and equipment the reviewed evidence bears on. The
 * grouping is the team's; each statement is the concept record's own cited
 * NASA statement, shown with that record's review state.
 */
export function ControlAreas({ areas }: { areas: ControlAreaView[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {areas.map((area) => (
        <article
          key={area.id}
          aria-labelledby={`control-${area.id}`}
          className="flex flex-col rounded-lg border border-line bg-surface ticks p-6 lg:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 id={`control-${area.id}`} className="text-lg font-medium tracking-[-0.01em] text-ink">
              {area.title}
            </h3>
            {area.conceptReviewed ? null : <ProvenanceBadge value="UNVERIFIED" />}
          </div>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{area.question}</p>

          <div className="mt-5">
            {area.statements.length > 0 ? (
              <Statements statements={area.statements} />
            ) : (
              <p className="rounded-sm hatch px-3 py-2 text-xs text-ink-muted">
                No NASA statements recorded yet
              </p>
            )}
          </div>

          <div className="mt-6 border-t border-line pt-4 lg:mt-auto">
            <p className="text-2xs text-ink-faint">
              Evidence from <span className="text-ink-muted">{area.conceptTitle}</span>
              {area.conceptReviewed ? "" : ", a concept record awaiting review"}. Reviewed investigations:
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {area.investigations.length > 0 ? (
                area.investigations.map((investigation) => (
                  <li key={investigation.id}>
                    <Link
                      href={`/explore#${investigation.id}`}
                      className="inline-flex rounded-sm border border-line-strong px-2 py-1 font-mono text-2xs text-ink-muted transition-colors hover:border-reviewed/60 hover:text-ink"
                    >
                      {investigation.label}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="rounded-sm hatch px-2 py-1 text-xs text-ink-muted">None linked yet</li>
              )}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
