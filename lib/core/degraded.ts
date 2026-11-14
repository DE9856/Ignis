import type { Capabilities } from "./capabilities";

/**
 * Wording for every "this part is not ready" state, in one place, so the
 * application says the same thing everywhere while teammate modules land.
 */
export const DEGRADED_MESSAGES = {
  noVerifiedKnowledge: "Verified NASA evidence has not yet been loaded.",
  noRetrieval: "Semantic retrieval is not available yet. Browse verified evidence instead.",
  noSynthesis: "Generated synthesis is disabled. Retrieved evidence remains available.",
  noMethodology: "Mission relevance scoring is awaiting validated methodology.",
  devMocks: "Development mocks are on. Results marked TEST are synthetic and are not NASA evidence.",
} as const;

export type DegradedReason = keyof typeof DEGRADED_MESSAGES;

export type DegradedArea = "knowledge" | "retrieval" | "synthesis" | "scoring" | "all";

export interface DegradedNotice {
  reason: DegradedReason;
  message: string;
}

const AREA_REASONS: Record<Exclude<DegradedArea, "all">, DegradedReason[]> = {
  knowledge: ["noVerifiedKnowledge"],
  retrieval: ["noRetrieval"],
  synthesis: ["noSynthesis"],
  scoring: ["noMethodology", "noVerifiedKnowledge"],
};

/** The notices a page should show, given what is available. Empty when all is well. */
export function getDegradedNotices(capabilities: Capabilities, area: DegradedArea = "all"): DegradedNotice[] {
  const active: Record<DegradedReason, boolean> = {
    noVerifiedKnowledge: !capabilities.verifiedKnowledgeAvailable,
    noRetrieval: !capabilities.retrievalEnabled,
    noSynthesis: !capabilities.llmEnabled,
    noMethodology: !capabilities.methodologyConfigured,
    devMocks: capabilities.devMocksEnabled,
  };
  const wanted = area === "all" ? (Object.keys(DEGRADED_MESSAGES) as DegradedReason[]) : AREA_REASONS[area];
  const reasons =
    capabilities.devMocksEnabled && !wanted.includes("devMocks") ? [...wanted, "devMocks" as const] : wanted;

  return reasons
    .filter((reason) => active[reason])
    .map((reason) => ({ reason, message: DEGRADED_MESSAGES[reason] }));
}
