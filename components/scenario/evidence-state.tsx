import { Badge, type BadgeTone } from "@/components/shared/badge";
import type { EvidenceState } from "@/lib/ranking/methodology";
import type { FactorOutcome, GapCoverageState } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";

/**
 * Visual vocabulary for computed evidence states.
 *
 * Strength is drawn as a three-step meter in one hue (the ordinal evidence
 * ramp in globals.css), so DIRECT > RELATED > BOUNDING reads as an order, not
 * as three unrelated categories. Every badge also prints the state name.
 * The state definitions themselves belong to the methodology, not to this file.
 */

type Level = 0 | 1 | 2 | 3;

const BAR_CLASSES = ["bg-evidence-bounding", "bg-evidence-related", "bg-evidence-direct"] as const;

/** Three rising bars; `level` of them are filled. Level 0 draws empty, dashed slots. */
export function StrengthMeter({ level, className }: { level: Level; className?: string }) {
  return (
    <span aria-hidden className={cn("inline-flex h-2.5 items-end gap-[2px]", className)}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "w-[3px] rounded-[1px]",
            index === 0 ? "h-1" : index === 1 ? "h-[7px]" : "h-2.5",
            index < level
              ? BAR_CLASSES[Math.min(level, 3) - 1]
              : "border border-dashed border-line-strong bg-transparent",
          )}
        />
      ))}
    </span>
  );
}

const EVIDENCE_STATE_STYLE: Record<EvidenceState, { label: string; level: Level; tone: BadgeTone }> = {
  DIRECT: { label: "Direct", level: 3, tone: "computed" },
  RELATED: { label: "Related", level: 2, tone: "computed" },
  BOUNDING: { label: "Bounding", level: 1, tone: "computed" },
  UNKNOWN: { label: "Unknown", level: 0, tone: "faint" },
  NOT_RELEVANT: { label: "Not relevant", level: 0, tone: "neutral" },
};

/** DIRECT / RELATED / BOUNDING / UNKNOWN / NOT RELEVANT for one scoring dimension. */
export function EvidenceStateBadge({ state, className }: { state: EvidenceState; className?: string }) {
  const style = EVIDENCE_STATE_STYLE[state];
  return (
    <Badge tone={style.tone} glyph={<StrengthMeter level={style.level} />} className={className}>
      {style.label}
    </Badge>
  );
}

const GAP_STATE_STYLE: Record<GapCoverageState, { label: string; level: Level; tone: BadgeTone }> = {
  DIRECT: { label: "Direct", level: 3, tone: "computed" },
  BOUNDING: { label: "Bounding", level: 2, tone: "computed" },
  INDIRECT: { label: "Indirect", level: 1, tone: "computed" },
  MISSING: { label: "Missing", level: 0, tone: "danger" },
};

/** DIRECT / BOUNDING / INDIRECT / MISSING evidence coverage for one gap dimension. */
export function GapStateBadge({ state, className }: { state: GapCoverageState; className?: string }) {
  const style = GAP_STATE_STYLE[state];
  return (
    <Badge tone={style.tone} glyph={<StrengthMeter level={style.level} />} className={className}>
      {style.label}
    </Badge>
  );
}

export function gapStateLevel(state: GapCoverageState): Level {
  return GAP_STATE_STYLE[state].level;
}

const OUTCOME_STYLE: Record<FactorOutcome, { label: string; tone: BadgeTone; symbol: string }> = {
  match: { label: "Match", tone: "computed", symbol: "✓" },
  mismatch: { label: "Mismatch", tone: "danger", symbol: "×" },
  unknown: { label: "Unknown", tone: "faint", symbol: "?" },
  not_specified: { label: "Not in scenario", tone: "neutral", symbol: "–" },
};

export const FACTOR_OUTCOME_LABELS: Record<FactorOutcome, string> = {
  match: OUTCOME_STYLE.match.label,
  mismatch: OUTCOME_STYLE.mismatch.label,
  unknown: OUTCOME_STYLE.unknown.label,
  not_specified: OUTCOME_STYLE.not_specified.label,
};

/** Outcome of the provisional scorer for one factor: match, mismatch, unknown, or not in scenario. */
export function FactorOutcomeBadge({ outcome, className }: { outcome: FactorOutcome; className?: string }) {
  const style = OUTCOME_STYLE[outcome];
  return (
    <Badge
      tone={style.tone}
      glyph={
        <span aria-hidden className="font-sans text-xs leading-none font-semibold">
          {style.symbol}
        </span>
      }
      className={className}
    >
      {style.label}
    </Badge>
  );
}

/**
 * One pip per compared factor, in factor order: filled for a match, crossed for
 * a mismatch, dashed for unknown. The score's basis, readable at a glance.
 */
export function FactorPips({ outcomes, className }: { outcomes: FactorOutcome[]; className?: string }) {
  const compared = outcomes.filter((outcome) => outcome !== "not_specified");
  return (
    <span aria-hidden className={cn("inline-flex items-center gap-[3px]", className)}>
      {compared.map((outcome, index) => (
        <span
          key={index}
          className={cn(
            "grid size-2.5 place-items-center rounded-[2px] text-[8px] leading-none font-bold",
            outcome === "match" && "bg-evidence-direct",
            outcome === "mismatch" && "border border-danger/80 text-danger",
            outcome === "unknown" && "border border-dashed border-ink-faint/70",
          )}
        >
          {outcome === "mismatch" ? "×" : null}
        </span>
      ))}
    </span>
  );
}
