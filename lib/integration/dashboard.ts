import type { Capabilities } from "@/lib/core/capabilities";
import { getDegradedNotices, type DegradedNotice } from "@/lib/core/degraded";
import { isHumanReviewed } from "@/lib/domain/provenance";
import type { KnowledgeBase } from "@/lib/okf/loader";
import { SAFETY_OBJECTIVES, type DocumentStatus, type SafetyObjective } from "@/lib/okf/types";

import { summarizeKnowledge, type KnowledgeSummary } from "./knowledge";
import type { ScenarioAnalysis } from "./scenario";

/**
 * Everything the dashboard needs, as plain data. Components render this and
 * never read knowledge files, parse Markdown or compute scores themselves.
 */

export interface CoverageByObjective {
  objective: SafetyObjective;
  /** Human-reviewed investigations tagged with this objective. */
  humanReviewed: number;
  /** Investigations tagged with it that are not yet reviewed. Deprecated ones are not counted. */
  notReviewed: number;
}

export interface InvestigationListItem {
  id: string;
  title: string;
  program: string | null;
  status: DocumentStatus;
  humanReviewed: boolean;
}

export interface TopInvestigationItem extends InvestigationListItem {
  rank: number;
  score: number | null;
}

export interface DashboardViewModel {
  summary: KnowledgeSummary;
  coverage: CoverageByObjective[];
  reviewedInvestigations: InvestigationListItem[];
  /** Present only when a scenario analysis was supplied. */
  topInvestigations: TopInvestigationItem[] | null;
  notices: DegradedNotice[];
  /** True when there is nothing verified to show at all. */
  isEmpty: boolean;
}

export function buildDashboardViewModel(
  knowledge: KnowledgeBase,
  capabilities: Capabilities,
  analysis: ScenarioAnalysis | null = null,
): DashboardViewModel {
  const active = knowledge.investigations.filter((investigation) => investigation.status !== "deprecated");

  const toItem = (investigation: (typeof active)[number]): InvestigationListItem => ({
    id: investigation.id,
    title: investigation.shortTitle ?? investigation.title,
    program: investigation.program,
    status: investigation.status,
    humanReviewed: isHumanReviewed(investigation),
  });

  const coverage = SAFETY_OBJECTIVES.map((objective) => {
    const tagged = active.filter((investigation) => investigation.safetyCategories.includes(objective));
    const humanReviewed = tagged.filter(isHumanReviewed).length;
    return { objective, humanReviewed, notReviewed: tagged.length - humanReviewed };
  });

  const reviewedInvestigations = active.filter(isHumanReviewed).map(toItem);

  return {
    summary: summarizeKnowledge(knowledge),
    coverage,
    reviewedInvestigations,
    topInvestigations: analysis
      ? analysis.ranked.map((entry) => ({
          ...toItem(entry.investigation),
          rank: entry.rank,
          score: entry.result.score,
        }))
      : null,
    notices: getDegradedNotices(capabilities),
    isEmpty: reviewedInvestigations.length === 0,
  };
}
