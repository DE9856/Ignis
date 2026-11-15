"use client";

import { useEffect, useState } from "react";

import { displayTitle } from "@/components/experiments/experiment-fields";
import { motionAllowed } from "@/components/motion/gsap";
import { GapStateBadge } from "@/components/scenario/evidence-state";
import { DIMENSION_LABELS } from "@/components/shared/labels";
import type { ScenarioAnalysis } from "@/lib/integration/scenario";
import { METHODOLOGY_DIMENSIONS } from "@/lib/ranking/methodology";
import { RESEARCH_QUESTION_LABEL, type GapCoverageState } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";

const FILL: Record<GapCoverageState, string> = {
  DIRECT: "bg-evidence-direct",
  BOUNDING: "bg-evidence-related",
  INDIRECT: "bg-evidence-bounding",
  MISSING: "",
};

/** Types the research question out, so a change in the largest gap is noticed. Instant with reduced motion. */
function useTyped(text: string): string {
  const [shown, setShown] = useState({ text, length: text.length });
  useEffect(() => {
    if (!motionAllowed()) {
      const timer = window.setTimeout(() => setShown({ text, length: text.length }), 0);
      return () => window.clearTimeout(timer);
    }
    let length = 0;
    const timer = window.setInterval(() => {
      length = Math.min(text.length, length + 2);
      setShown({ text, length });
      if (length >= text.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [text]);
  return shown.text === text ? text.slice(0, shown.length) : "";
}

/** Per-condition evidence coverage and the largest gap. Coverage of the corpus, never a fire-risk rating. */
export function ConsoleCoverage({ analysis }: { analysis: ScenarioAnalysis }) {
  const byDimension = new Map(analysis.coverage.map((gap) => [gap.dimension, gap]));
  const names = new Map(
    analysis.ranked.map(({ investigation }) => [investigation.id, displayTitle(investigation)]),
  );
  const largest = analysis.coverage.find((gap) => gap.state !== "DIRECT") ?? null;
  const question = analysis.researchQuestions.find((entry) => entry.basedOn === largest?.dimension);
  const typed = useTyped(
    question?.text ??
      (analysis.coverage.length === 0
        ? "Set a scenario condition to see where the evidence runs out."
        : "No research question: the reviewed evidence covers every condition you set."),
  );

  return (
    <div>
      <ul className="grid gap-2.5">
        {METHODOLOGY_DIMENSIONS.map((dimension) => {
          const gap = byDimension.get(dimension);
          const percent = gap ? Math.round((gap.coverage ?? 0) * 100) : 0;
          const ids = gap?.supportingInvestigationIds ?? [];
          return (
            <li
              key={dimension}
              className={cn(
                "grid grid-cols-[6.5rem_minmax(0,1fr)_6rem] items-center gap-x-3 gap-y-1 text-sm2 transition-opacity",
                !gap && "opacity-40",
              )}
            >
              <span className="text-ink-muted">{DIMENSION_LABELS[dimension]}</span>
              <span
                className={cn(
                  "h-2.5 overflow-hidden rounded-full",
                  gap?.state === "MISSING" ? "hatch" : "bg-track",
                )}
              >
                <span
                  className={cn(
                    "block h-full rounded-full transition-[width] duration-500 ease-out",
                    gap && FILL[gap.state],
                  )}
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="justify-self-end">
                {gap ? (
                  <GapStateBadge state={gap.state} />
                ) : (
                  <span className="text-2xs text-ink-faint">not set</span>
                )}
              </span>
              {gap ? (
                <span className="col-span-3 text-2xs text-ink-faint sm:col-start-2 sm:col-end-4">
                  {ids.length > 0
                    ? `${gap.state === "DIRECT" ? "Tested by" : "Best evidence:"} ${ids.map((id) => names.get(id) ?? id).join(", ")}`
                    : "No reviewed investigation provides evidence."}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 rounded-md border border-danger/35 bg-danger/5 p-4">
        <p className="font-mono text-2xs tracking-[0.14em] text-danger uppercase">Largest evidence gap</p>
        <p className="mt-1.5 text-xl font-medium tracking-[-0.02em] text-balance text-ink">
          {largest
            ? `${DIMENSION_LABELS[largest.dimension]} · ${largest.state.toLowerCase()}`
            : analysis.coverage.length === 0
              ? "No scenario set"
              : "Every set condition has direct evidence"}
        </p>
        <p aria-live="polite" className="mt-2 min-h-[3lh] text-sm text-ink-muted">
          {typed}
        </p>
        <p className="mt-2 font-mono text-2xs tracking-[0.1em] text-computed">
          {RESEARCH_QUESTION_LABEL} · not a NASA recommendation
        </p>
      </div>
    </div>
  );
}
