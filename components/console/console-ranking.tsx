"use client";

import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

import { displayTitle } from "@/components/experiments/experiment-fields";
import { useFlipList } from "@/components/motion/use-flip-list";
import { EvidenceStateBadge } from "@/components/scenario/evidence-state";
import { DIMENSION_LABELS } from "@/components/shared/labels";
import type { ScenarioAnalysis } from "@/lib/integration/scenario";
import { EVIDENCE_STATES, METHODOLOGY_DIMENSIONS, type EvidenceState } from "@/lib/ranking/methodology";
import { cn } from "@/lib/utils/cn";

const PIP: Record<EvidenceState, string> = {
  DIRECT: "bg-evidence-direct",
  RELATED: "bg-evidence-related",
  BOUNDING: "bg-evidence-bounding",
  UNKNOWN: "hatch bg-track",
  NOT_RELEVANT: "bg-track ring-1 ring-inset ring-line-strong",
};

const LEGEND: Record<EvidenceState, string> = {
  DIRECT: "Direct",
  RELATED: "Related (within 20%)",
  BOUNDING: "Bounding",
  UNKNOWN: "Not stated",
  NOT_RELEVANT: "Outside",
};

/** Every reviewed investigation, re-ranked as the scenario changes. Rows glide to their new place. */
export function ConsoleRanking({ analysis }: { analysis: ScenarioAnalysis }) {
  const list = useRef<HTMLOListElement>(null);
  const [open, setOpen] = useState<string | null>(null);
  useFlipList(list, analysis.ranked.map((row) => row.investigation.id).join("|"));

  return (
    <div>
      <ol ref={list} className="grid gap-1.5">
        {analysis.ranked.map(({ investigation, result }, index) => {
          const states = new Map(result.breakdown?.dimensions.map((d) => [d.dimension, d.state]) ?? []);
          const isOpen = open === investigation.id;
          const score = result.score === null ? null : Math.round(result.score * 100);
          const source = investigation.sources[0];
          return (
            <li
              key={investigation.id}
              data-flip-id={investigation.id}
              className={cn(
                "rounded-md border bg-sunken/60",
                index === 0 && score !== null ? "border-accent/45" : "border-line",
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : investigation.id)}
                className="grid w-full grid-cols-[1.5rem_minmax(0,1fr)_5rem] items-center gap-3 px-3 py-2 text-left sm:grid-cols-[1.75rem_minmax(0,1fr)_auto_minmax(6rem,10rem)]"
              >
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    index === 0 && score !== null ? "text-accent" : "text-ink-faint",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 truncate text-[0.875rem] font-medium text-ink">
                    <ChevronRight
                      aria-hidden
                      className={cn(
                        "size-3.5 shrink-0 text-ink-faint transition-transform",
                        isOpen && "rotate-90",
                      )}
                    />
                    {displayTitle(investigation)}
                  </span>
                  <span className="block truncate pl-5 text-2xs text-ink-faint">
                    {investigation.program ?? investigation.platform ?? ""}
                  </span>
                </span>
                <span aria-hidden className="hidden gap-[3px] sm:flex">
                  {METHODOLOGY_DIMENSIONS.map((dimension) => {
                    const state = states.get(dimension);
                    return (
                      <span
                        key={dimension}
                        title={`${DIMENSION_LABELS[dimension]}: ${state ? LEGEND[state] : "not in scenario"}`}
                        className={cn(
                          "h-[18px] w-[9px] rounded-[3px] transition-colors duration-500",
                          state ? PIP[state] : "bg-track opacity-30",
                        )}
                      />
                    );
                  })}
                </span>
                <span className="grid grid-cols-[minmax(0,1fr)_2.25rem] items-center gap-2">
                  <span className="h-1.5 overflow-hidden rounded-full bg-track">
                    <span
                      className="block h-full rounded-full bg-evidence-direct transition-[width] duration-500 ease-out"
                      style={{ width: `${score ?? 0}%` }}
                    />
                  </span>
                  <span className="text-right font-mono text-sm text-ink tabular-nums">{score ?? "–"}</span>
                </span>
              </button>
              {isOpen ? (
                <div className="space-y-3 border-t border-line px-3 pt-3 pb-3.5 sm:pl-11">
                  {result.breakdown && result.breakdown.dimensions.length > 0 ? (
                    <dl className="grid gap-1.5">
                      {result.breakdown.dimensions.map((d) => (
                        <div
                          key={d.dimension}
                          className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 text-xs sm:grid-cols-[6.5rem_7rem_minmax(0,1fr)_3rem]"
                        >
                          <dt className="text-ink-muted">{DIMENSION_LABELS[d.dimension]}</dt>
                          <dd>
                            <EvidenceStateBadge state={d.state} />
                          </dd>
                          <dd className="col-span-2 text-ink sm:col-span-1">{d.explanation}</dd>
                          <dd className="hidden text-right font-mono text-ink-faint tabular-nums sm:block">
                            {d.contribution.toFixed(1)}/{d.weight}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-xs text-ink-muted">Set a scenario condition to compare.</p>
                  )}
                  {investigation.keyFindings[0] ? (
                    <p className="border-l-2 border-nasa/60 pl-3 text-xs leading-relaxed text-ink-muted">
                      {investigation.keyFindings[0]}
                    </p>
                  ) : null}
                  {source ? (
                    <p className="text-xs text-ink-faint">
                      Source:{" "}
                      <a
                        href={source.resource}
                        target="_blank"
                        rel="noreferrer"
                        className="text-nasa underline decoration-nasa/40 underline-offset-2 hover:decoration-nasa"
                      >
                        {source.title ?? source.resource}
                      </a>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-2xs text-ink-muted">
        {EVIDENCE_STATES.map((state) => (
          <li key={state} className="flex items-center gap-1.5">
            <span aria-hidden className={cn("h-3.5 w-[9px] rounded-[3px]", PIP[state])} />
            {LEGEND[state]}
          </li>
        ))}
      </ul>
    </div>
  );
}
