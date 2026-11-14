import type { ProvenanceClass } from "@/lib/okf/types";

import type { ChunkType } from "./types";

/**
 * Which OKF section headings become which chunk type (team workflow, section 10).
 *
 * Matching is on the slug the parser produces (`Key Findings` -> `key-findings`).
 * Older and newer template spellings are both listed so the chunker works
 * before and after the contract pull request.
 */

export interface SectionRule {
  chunkType: ChunkType;
  sourceClass: ProvenanceClass;
}

const NASA = "NASA_SOURCE" as const;

const SECTION_RULES: Record<string, SectionRule> = {
  objective: { chunkType: "OBJECTIVE", sourceClass: NASA },
  objectives: { chunkType: "OBJECTIVE", sourceClass: NASA },
  "experimental-conditions": { chunkType: "CONDITIONS", sourceClass: NASA },
  conditions: { chunkType: "CONDITIONS", sourceClass: NASA },
  variables: { chunkType: "VARIABLES", sourceClass: NASA },
  "sensors-and-measurements": { chunkType: "MEASUREMENT", sourceClass: NASA },
  measurements: { chunkType: "MEASUREMENT", sourceClass: NASA },
  "key-findings": { chunkType: "FINDING", sourceClass: NASA },
  findings: { chunkType: "FINDING", sourceClass: NASA },
  limitations: { chunkType: "LIMITATION", sourceClass: NASA },
  "fire-safety-relevance": { chunkType: "INTERPRETATION", sourceClass: "TEAM_INTERPRETATION" },
};

/** Sections that are deliberately not retrieved. Source Notes are shown on the record page instead. */
const NOT_CHUNKED = new Set(["source-notes", "sources", "references"]);

export type SectionDecision =
  { kind: "chunk"; rule: SectionRule } | { kind: "skip"; reason: "not-chunked" } | { kind: "unknown" };

export function decideSection(slug: string): SectionDecision {
  const rule = SECTION_RULES[slug];
  if (rule) return { kind: "chunk", rule };
  if (NOT_CHUNKED.has(slug)) return { kind: "skip", reason: "not-chunked" };
  return { kind: "unknown" };
}

/** Sections whose items are `-` bullets, one fact per bullet. These split on bullets, never mid-item. */
export function isBulletSection(chunkType: ChunkType): boolean {
  return chunkType === "FINDING" || chunkType === "LIMITATION";
}
