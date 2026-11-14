import { METHODOLOGY_DIMENSIONS, type EvidenceState } from "@/lib/ranking/methodology";
import {
  RESEARCH_QUESTION_LABEL,
  type GapCoverageState,
  type GapResult,
  type RelevanceBreakdown,
  type ResearchQuestion,
} from "@/lib/ranking/types";
import type { RetrievedEvidence } from "@/lib/retrieval/types";
import { TEST_CHUNK_ALPHA_CONDITIONS, TEST_CHUNK_ALPHA_INTERPRETATION } from "@/tests/fixtures/chunks";

import { assertDevOnly } from "./guard";
import { TEST_CONFIG } from "./test-config";

/**
 * Synthetic inputs for the /dev/ui component gallery, so the score explanation
 * and gap components can be seen against the draft contracts before Member 3's
 * methodology produces real results. Every number is derived from TEST_CONFIG,
 * which is arbitrary and unapproved. Nothing here is NASA evidence.
 */

const STATES: EvidenceState[] = [
  "DIRECT",
  "RELATED",
  "DIRECT",
  "BOUNDING",
  "UNKNOWN",
  "BOUNDING",
  "NOT_RELEVANT",
];

export function testRelevanceBreakdown(): RelevanceBreakdown {
  assertDevOnly("testRelevanceBreakdown");
  const dimensions = METHODOLOGY_DIMENSIONS.map((dimension, index) => {
    const state = STATES[index % STATES.length];
    const weight = TEST_CONFIG.weights[dimension];
    const multiplier = TEST_CONFIG.stateMultipliers[state];
    return {
      dimension,
      state,
      weight,
      multiplier,
      contribution: weight * multiplier,
      explanation: `TEST explanation for ${dimension}: synthetic state ${state}.`,
    };
  });
  const total = dimensions.reduce((sum, dimension) => sum + dimension.contribution, 0);
  const max = dimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  return {
    investigationId: "test-investigation-alpha",
    methodologyId: TEST_CONFIG.id,
    relevanceScore: max > 0 ? total / max : null,
    directCoverage: dimensions.filter((dimension) => dimension.state === "DIRECT").length / dimensions.length,
    dimensions,
  };
}

const GAP_STATES: GapCoverageState[] = [
  "DIRECT",
  "BOUNDING",
  "DIRECT",
  "INDIRECT",
  "MISSING",
  "BOUNDING",
  "DIRECT",
];
const GAP_TO_EVIDENCE: Record<GapCoverageState, EvidenceState> = {
  DIRECT: "DIRECT",
  BOUNDING: "BOUNDING",
  INDIRECT: "RELATED",
  MISSING: "UNKNOWN",
};

export function testGapResults(): GapResult[] {
  assertDevOnly("testGapResults");
  return METHODOLOGY_DIMENSIONS.map((dimension, index) => {
    const state = GAP_STATES[index % GAP_STATES.length];
    const coverage = TEST_CONFIG.stateMultipliers[GAP_TO_EVIDENCE[state]];
    return {
      dimension,
      state,
      coverage,
      priority: TEST_CONFIG.weights[dimension] * (1 - coverage),
      supportingInvestigationIds: state === "MISSING" ? [] : ["test-investigation-alpha"],
    };
  });
}

export function testResearchQuestion(): ResearchQuestion {
  assertDevOnly("testResearchQuestion");
  return {
    label: RESEARCH_QUESTION_LABEL,
    text: "TEST question: a synthetic research question rendered to check layout. Not generated from real evidence.",
    basedOn: "pressure",
  };
}

export function testRetrievedEvidence(): RetrievedEvidence[] {
  assertDevOnly("testRetrievedEvidence");
  return [
    {
      chunk: TEST_CHUNK_ALPHA_CONDITIONS,
      rank: 1,
      scores: { vector: 0.5, lexical: 0.5, metadata: 0.5, fused: 0.5 },
      matchedTerms: ["oxygen"],
      matchedMetadata: [],
      neighbors: [],
    },
    {
      chunk: TEST_CHUNK_ALPHA_INTERPRETATION,
      rank: 2,
      scores: { vector: null, lexical: 0.25, metadata: null, fused: 0.25 },
      matchedTerms: [],
      matchedMetadata: [],
      neighbors: [],
    },
  ];
}
