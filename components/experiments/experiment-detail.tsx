import { ArrowUpRight, Columns3 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { EvidenceSource } from "@/components/evidence/evidence-source";
import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { NOT_REPORTED } from "@/components/shared/labels";
import { SafetyRole } from "@/components/shared/safety-badges";
import { StatusBadge } from "@/components/shared/status-badge";
import { getEffectiveProvenance, isHumanReviewed } from "@/lib/domain/provenance";
import type { Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { primarySourceUrl } from "./experiment-card";
import { conditionFields, displayTitle } from "./experiment-fields";
import { ExperimentValue } from "./experiment-value";

function Block({
  title,
  badge,
  children,
  className,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h3 className="mb-2 flex flex-wrap items-center gap-2 font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
        {title}
        {badge}
      </h3>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-sm2 text-ink-faint italic">{NOT_REPORTED}</p>;
  return (
    <ul className="space-y-1.5 text-sm2 leading-snug text-ink">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-ink-faint" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The full record for one investigation: objective, every condition, findings
 * and limitations as the source states them, the team's interpretation kept
 * visibly apart, related records, sources and the review trail.
 */
export function ExperimentDetail({
  investigation,
  className,
}: {
  investigation: Investigation;
  className?: string;
}) {
  const reviewed = isHumanReviewed(investigation);
  const sourceBadge = <ProvenanceBadge value={getEffectiveProvenance("NASA_SOURCE", reviewed)} />;
  const sourceUrl = primarySourceUrl(investigation);
  const showFullTitle = investigation.shortTitle !== null && investigation.shortTitle !== investigation.title;

  return (
    <article
      aria-label={`Record: ${displayTitle(investigation)}`}
      className={cn("rounded-lg border border-line bg-surface ticks", className)}
    >
      <header className="border-b border-line px-5 pt-4 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-2xs tracking-[0.1em] text-ink-faint uppercase">
              {investigation.program ?? "Program not reported"}
            </p>
            <h2 className="mt-1 text-lg leading-tight font-medium text-ink">{displayTitle(investigation)}</h2>
            {showFullTitle ? <p className="mt-0.5 text-xs text-ink-muted">{investigation.title}</p> : null}
          </div>
          <StatusBadge status={investigation.status} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <SafetyRole objectives={investigation.safetyCategories} variant="list" />
          <div className="ml-auto flex items-center gap-3 text-xs">
            <Link
              href={`/compare?ids=${encodeURIComponent(investigation.id)}`}
              className="inline-flex items-center gap-1 text-ink-muted hover:text-ink"
            >
              <Columns3 aria-hidden className="size-3.5" />
              Compare
            </Link>
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-ink-muted hover:text-nasa"
              >
                Source
                <ArrowUpRight aria-hidden className="size-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <div className="space-y-6 px-5 py-5">
        {investigation.description ? (
          <p className="text-sm2 leading-relaxed text-ink-muted">{investigation.description}</p>
        ) : null}

        <Block title="Objective" badge={sourceBadge}>
          <p
            className={cn(
              "text-sm leading-relaxed whitespace-pre-line",
              investigation.objective ? "text-ink" : "text-ink-faint italic",
            )}
          >
            {investigation.objective ?? NOT_REPORTED}
          </p>
        </Block>

        <Block title="Experimental conditions" badge={sourceBadge}>
          <dl className="grid gap-x-6 text-sm2 sm:grid-cols-2">
            {conditionFields(investigation).map((field) => (
              <div
                key={field.key}
                className="flex items-baseline justify-between gap-4 border-b border-line py-1.5"
              >
                <dt className="shrink-0 text-ink-muted">{field.label}</dt>
                <dd className="min-w-0 text-right break-words">
                  <ExperimentValue value={field.value} numeric={field.numeric} />
                </dd>
              </div>
            ))}
          </dl>
        </Block>

        <div className="grid gap-6 md:grid-cols-2">
          <Block title="Key findings" badge={sourceBadge}>
            <Bullets items={investigation.keyFindings} />
          </Block>
          <Block title="Limitations" badge={sourceBadge}>
            <Bullets items={investigation.limitations} />
          </Block>
        </div>

        <section className="rounded-md border border-interpretation/40 bg-interpretation/[0.05] px-4 py-3">
          <h3 className="mb-1.5 flex flex-wrap items-center gap-2 font-mono text-2xs tracking-[0.1em] text-interpretation uppercase">
            Fire-safety relevance
            <ProvenanceBadge value="TEAM_INTERPRETATION" />
          </h3>
          <p
            className={cn(
              "text-sm2 leading-relaxed whitespace-pre-line",
              investigation.fireSafetyRelevance ? "text-ink" : "text-ink-faint italic",
            )}
          >
            {investigation.fireSafetyRelevance ?? "No team interpretation recorded."}
          </p>
          <p className="mt-2 text-2xs text-ink-faint">
            The team&apos;s reading of the evidence. Not a NASA statement.
          </p>
        </section>

        {investigation.related.length > 0 ? (
          <Block title="Related records">
            <ul className="space-y-1.5 text-sm2">
              {investigation.related.map((link) => {
                const [folder, id] = link.id.split("/");
                return (
                  <li
                    key={`${link.id}-${link.relation ?? ""}`}
                    className="flex flex-wrap items-baseline gap-x-2"
                  >
                    {folder === "investigations" ? (
                      <a
                        href={`#${id}`}
                        className="font-mono text-xs text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
                      >
                        {link.id}
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-ink">{link.id}</span>
                    )}
                    {link.relation ? <span className="text-xs text-ink-muted">{link.relation}</span> : null}
                    {link.note ? <span className="text-xs text-ink-faint">{link.note}</span> : null}
                  </li>
                );
              })}
            </ul>
          </Block>
        ) : null}

        <Block title="Sources">
          {investigation.sources.length > 0 ? (
            <ul className="space-y-2">
              {investigation.sources.map((source) => (
                <li key={source.id}>
                  <EvidenceSource source={source} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              size="compact"
              title="No source cited"
              description="A record cannot be verified without one."
            />
          )}
        </Block>

        <footer className="border-t border-line pt-3 font-mono text-2xs leading-relaxed text-ink-faint">
          <p>
            id <span className="text-ink-muted">{investigation.id}</span>
            {investigation.generated ? (
              <>
                {" "}
                · written by <span className="text-ink-muted">{investigation.generated.by}</span>
              </>
            ) : null}
          </p>
          {investigation.verified.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {investigation.verified.map((record, index) => (
                <li key={`${record.by}-${index}`}>
                  verified by <span className="text-ink-muted">{record.by}</span>
                  {record.at ? ` on ${record.at.slice(0, 10)}` : ""}
                  {record.note ? <span className="font-sans"> · {record.note}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1">not yet verified</p>
          )}
        </footer>
      </div>
    </article>
  );
}
