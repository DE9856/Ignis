import { getVerificationTier } from "@/lib/domain/provenance";
import type { KnowledgeBase } from "@/lib/okf/loader";
import type { DocumentStatus } from "@/lib/okf/types";

/** Counts describing how far the knowledge base has come. No content. */
export interface KnowledgeSummary {
  total: number;
  investigations: number;
  hardware: number;
  concepts: number;
  missions: number;
  humanReviewed: number;
  byStatus: Record<DocumentStatus, number>;
  withSources: number;
  withoutSources: number;
  /** Files excluded because they failed validation. */
  issues: number;
}

export function summarizeKnowledge(knowledge: KnowledgeBase): KnowledgeSummary {
  const records = [
    ...knowledge.investigations.map((record) => ({
      status: record.status,
      verified: record.verified,
      sources: record.sources.length,
    })),
    ...[...knowledge.hardware, ...knowledge.concepts, ...knowledge.missions].map((document) => ({
      status: document.metadata.status,
      verified: document.metadata.verified,
      sources: document.metadata.sources.length,
    })),
  ];

  const byStatus: Record<DocumentStatus, number> = { draft: 0, stable: 0, deprecated: 0 };
  for (const record of records) byStatus[record.status] += 1;
  const withSources = records.filter((record) => record.sources > 0).length;

  return {
    total: records.length,
    investigations: knowledge.investigations.length,
    hardware: knowledge.hardware.length,
    concepts: knowledge.concepts.length,
    missions: knowledge.missions.length,
    humanReviewed: records.filter((record) => getVerificationTier(record) === "HUMAN_REVIEWED").length,
    byStatus,
    withSources,
    withoutSources: records.length - withSources,
    issues: new Set(knowledge.issues.map((issue) => issue.filePath)).size,
  };
}
