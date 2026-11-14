import { isVerified } from "@/lib/okf/parser";
import type { DocumentStatus, ProvenanceClass, VerificationRecord } from "@/lib/okf/types";

/**
 * The one place that decides what counts as trusted evidence.
 *
 * Rules:
 * - Generated summaries are never canonical.
 * - Team interpretation is not NASA evidence.
 * - NASA-sourced content that a person has reviewed is canonical.
 * - Unverified content is not used unless a caller explicitly opts in.
 */

export interface Reviewable {
  status: DocumentStatus;
  verified: VerificationRecord[];
}

export type VerificationTier = "HUMAN_REVIEWED" | "UNVERIFIED" | "DEPRECATED";

export function getVerificationTier(record: Reviewable): VerificationTier {
  if (record.status === "deprecated") return "DEPRECATED";
  return isVerified(record) ? "HUMAN_REVIEWED" : "UNVERIFIED";
}

export function isHumanReviewed(record: Reviewable): boolean {
  return getVerificationTier(record) === "HUMAN_REVIEWED";
}

const PROVENANCE_LABELS: Record<ProvenanceClass, string> = {
  NASA_SOURCE: "NASA source",
  HUMAN_REVIEWED: "Human reviewed",
  COMPUTED: "Computed by IGNIS",
  TEAM_INTERPRETATION: "Team interpretation",
  GENERATED_SUMMARY: "Generated summary",
  UNVERIFIED: "Unverified",
};

export function getProvenanceLabel(value: ProvenanceClass): string {
  return PROVENANCE_LABELS[value];
}

/** Classes that can ever be canonical evidence, given a completed human review. */
const CANONICAL_CLASSES: ReadonlySet<ProvenanceClass> = new Set(["NASA_SOURCE", "HUMAN_REVIEWED"]);

/**
 * Canonical evidence is NASA-sourced content that a person has reviewed.
 * Interpretation, computed output and generated text never qualify, reviewed or not.
 */
export function isCanonicalEvidence(sourceClass: ProvenanceClass, humanReviewed: boolean): boolean {
  return humanReviewed && CANONICAL_CLASSES.has(sourceClass);
}

export interface TrustOptions {
  /** Development and review tooling only. Defaults to false. */
  includeUnverified?: boolean;
}

/** May this record feed ranking, coverage and gap analysis? */
export function canUseForAnalytics(record: Reviewable, options: TrustOptions = {}): boolean {
  const tier = getVerificationTier(record);
  if (tier === "DEPRECATED") return false;
  return tier === "HUMAN_REVIEWED" || options.includeUnverified === true;
}

export interface RetrievableLike {
  sourceClass: ProvenanceClass;
  /** True when the parent record is human reviewed. */
  humanReviewed: boolean;
}

/**
 * May this chunk be indexed and returned by retrieval?
 * Reviewed NASA evidence and reviewed team interpretation both may, and the
 * interface must keep them visibly distinct. Generated text never may.
 */
export function canUseForRetrieval(chunk: RetrievableLike, options: TrustOptions = {}): boolean {
  if (chunk.sourceClass === "GENERATED_SUMMARY" || chunk.sourceClass === "COMPUTED") return false;
  if (chunk.sourceClass === "UNVERIFIED") return options.includeUnverified === true;
  return chunk.humanReviewed || options.includeUnverified === true;
}

/** Section slugs whose text is the team's reading, not the source's statement. */
const INTERPRETATION_SECTIONS: ReadonlySet<string> = new Set(["fire-safety-relevance"]);

/** Sections kept for display but never chunked or embedded. */
const NON_EVIDENCE_SECTIONS: ReadonlySet<string> = new Set(["source-notes"]);

/** Provenance class a section's text carries, by its heading slug. */
export function getSectionProvenance(sectionSlug: string): ProvenanceClass {
  return INTERPRETATION_SECTIONS.has(sectionSlug) ? "TEAM_INTERPRETATION" : "NASA_SOURCE";
}

export function isEvidenceSection(sectionSlug: string): boolean {
  return !NON_EVIDENCE_SECTIONS.has(sectionSlug);
}

/** What a badge should show for a piece of content, after applying review state. */
export function getEffectiveProvenance(
  sourceClass: ProvenanceClass,
  humanReviewed: boolean,
): ProvenanceClass {
  if (
    sourceClass === "GENERATED_SUMMARY" ||
    sourceClass === "COMPUTED" ||
    sourceClass === "TEAM_INTERPRETATION"
  ) {
    return sourceClass;
  }
  return humanReviewed ? sourceClass : "UNVERIFIED";
}
