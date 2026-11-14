import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/shared/badge";
import { toEvidenceDisplayModel } from "@/lib/integration/evidence";
import type { EvidenceChunk, RetrievalFilters, RetrievedEvidence } from "@/lib/retrieval/types";
import { cn } from "@/lib/utils/cn";

import { ProvenanceBadge } from "./provenance-badge";
import { highlightParts, queryTerms } from "./query-terms";
import { WhyRetrieved } from "./why-retrieved";

interface EvidenceCardProps {
  /** A retrieved result (with scores) or a bare chunk. */
  input: RetrievedEvidence | EvidenceChunk;
  rank?: number;
  query?: string;
  filters?: RetrievalFilters;
  /** Footer control, e.g. "use in summary". */
  action?: ReactNode;
  className?: string;
}

/**
 * One retrieved passage. Every card shows the investigation, the section, the
 * evidence class, the review state and the source, before anything else is
 * said about it. Team interpretation is drawn apart from NASA evidence.
 */
export function EvidenceCard({
  input,
  rank,
  query = "",
  filters = {},
  action,
  className,
}: EvidenceCardProps) {
  const model = toEvidenceDisplayModel(input);
  const retrieved = "chunk" in input ? input : null;
  const terms = queryTerms(query);
  const host = model.sourceUrl ? new URL(model.sourceUrl).hostname : null;

  return (
    <article
      className={cn(
        "rounded-lg border bg-surface",
        model.isInterpretation
          ? "border-l-2 border-interpretation/35 border-l-interpretation/70"
          : "border-line",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-3.5">
        <div className="flex min-w-0 items-baseline gap-3">
          {rank !== undefined ? (
            <span className="font-mono text-xs text-ink-faint tabular-nums">
              {String(rank).padStart(2, "0")}
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-ink">
              {model.investigationId ? (
                <a href={`/explore#${model.investigationId}`} className="hover:text-accent">
                  {model.heading}
                </a>
              ) : (
                model.heading
              )}
              <span className="font-normal text-ink-faint"> / </span>
              <span className="font-normal text-ink-muted">{model.section}</span>
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <ProvenanceBadge value={model.provenance} />
          {model.humanReviewed && model.provenance !== "HUMAN_REVIEWED" ? (
            <Badge tone="reviewed" title="The parent record has passed human review.">
              Human reviewed
            </Badge>
          ) : null}
        </div>
      </header>

      <div className="px-4 pt-2 pb-3">
        {model.isInterpretation ? (
          <p className="mb-1 text-2xs text-interpretation">
            The team&apos;s interpretation. Not a NASA statement.
          </p>
        ) : null}
        <p className="text-sm2 leading-relaxed text-ink-muted">
          {highlightParts(model.excerpt, terms).map((part, index) =>
            part.match ? (
              <mark key={index} className="rounded-[2px] bg-accent/20 px-0.5 text-ink">
                {part.text}
              </mark>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </p>
      </div>

      <footer className="space-y-2 border-t border-line px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {model.sourceUrl ? (
            <a
              href={model.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-w-0 items-center gap-1.5 text-ink-muted hover:text-nasa"
            >
              Source
              <span className="truncate font-mono text-2xs text-ink-faint">{host}</span>
              <ExternalLink aria-hidden className="size-3 shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <span className="text-ink-faint italic">Source not recorded</span>
          )}
          {action}
        </div>
        {retrieved ? <WhyRetrieved result={retrieved} query={query} filters={filters} /> : null}
      </footer>
    </article>
  );
}
