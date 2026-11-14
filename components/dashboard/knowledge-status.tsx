import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { KnowledgeSummary } from "@/lib/integration/knowledge";
import { AWAITING_EVIDENCE } from "@/lib/navigation";
import { cn } from "@/lib/utils/cn";

interface Stat {
  label: string;
  value: number;
  note: string;
}

/**
 * How far the knowledge base has come: record counts straight from the files
 * on disk, and how many investigations have passed human review.
 */
export function KnowledgeStatus({ summary, className }: { summary: KnowledgeSummary; className?: string }) {
  const stats: Stat[] = [
    { label: "Investigation records", value: summary.investigations, note: "All review states" },
    { label: "Hardware", value: summary.hardware, note: "Facilities and rigs" },
    { label: "Concepts", value: summary.concepts, note: "Combustion and fire-safety terms" },
    { label: "Mission presets", value: summary.missions, note: "Reference scenarios" },
  ];
  const reviewedShare = summary.total > 0 ? summary.humanReviewed / summary.total : 0;

  return (
    <section
      aria-labelledby="knowledge-status-title"
      className={cn("rounded-lg border border-line bg-surface", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <h2 id="knowledge-status-title" className="text-sm font-semibold text-ink">
          Knowledge base
        </h2>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
        >
          Evidence Explorer
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      <div className="grid gap-px bg-line sm:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))] lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))]">
        <div className="bg-surface px-4 py-3 sm:row-span-2 lg:row-span-1">
          <p className="text-xs text-ink-muted">Human reviewed</p>
          <p className="mt-1 text-2xl leading-none font-semibold text-ink">
            {summary.humanReviewed}
            <span className="text-base font-normal text-ink-faint"> of {summary.total} records</span>
          </p>
          <div
            role="img"
            aria-label={`${summary.humanReviewed} of ${summary.total} records human reviewed`}
            className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-track"
          >
            <span
              className="block h-full rounded-full bg-mark-reviewed"
              style={{ width: `${reviewedShare * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-2xs text-ink-faint">
            {summary.total === 0
              ? AWAITING_EVIDENCE
              : `${summary.byStatus.draft} draft · ${summary.withoutSources} without a source${summary.issues > 0 ? ` · ${summary.issues} with problems` : ""}`}
          </p>
        </div>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface px-4 py-3">
            <p className="text-xs text-ink-muted">{stat.label}</p>
            <p
              className={cn(
                "mt-1 text-2xl leading-none font-semibold",
                stat.value > 0 ? "text-ink" : "text-ink-faint",
              )}
            >
              {stat.value > 0 ? stat.value : "0"}
            </p>
            <p className="mt-1.5 text-2xs text-ink-faint">{stat.value > 0 ? stat.note : "None yet"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
