import { Badge, type BadgeTone } from "@/components/shared/badge";
import { StrengthMeter } from "@/components/scenario/evidence-state";
import type { CoverageLevel } from "@/lib/ranking/types";

const LEVEL_STYLE: Record<CoverageLevel, { label: string; tone: BadgeTone; level: 0 | 3; meaning: string }> =
  {
    covered: {
      label: "Covered",
      tone: "computed",
      level: 3,
      meaning: "At least one reviewed investigation tested the scenario value.",
    },
    unknown: {
      label: "Unknown",
      tone: "faint",
      level: 0,
      meaning: "None match, and at least one reviewed record does not report this condition.",
    },
    gap: {
      label: "Gap",
      tone: "danger",
      level: 0,
      meaning: "Every reviewed investigation that reports this condition tested outside the scenario value.",
    },
    no_evidence: {
      label: "No evidence",
      tone: "faint",
      level: 0,
      meaning: "There are no reviewed investigations to compare.",
    },
  };

export const COVERAGE_LEVEL_MEANING: Record<CoverageLevel, string> = {
  covered: LEVEL_STYLE.covered.meaning,
  unknown: LEVEL_STYLE.unknown.meaning,
  gap: LEVEL_STYLE.gap.meaning,
  no_evidence: LEVEL_STYLE.no_evidence.meaning,
};

/** Provisional gap-analysis level for one scenario factor. */
export function CoverageLevelBadge({ level, className }: { level: CoverageLevel; className?: string }) {
  const style = LEVEL_STYLE[level];
  return (
    <Badge
      tone={style.tone}
      glyph={<StrengthMeter level={style.level} />}
      title={style.meaning}
      className={className}
    >
      {style.label}
    </Badge>
  );
}

/** Lower is a larger gap. Used only to order the display, never to score. */
export const LEVEL_ORDER: Record<CoverageLevel, number> = {
  gap: 0,
  no_evidence: 1,
  unknown: 2,
  covered: 3,
};
