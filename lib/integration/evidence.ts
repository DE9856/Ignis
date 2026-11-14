import { getEffectiveProvenance, getProvenanceLabel, isCanonicalEvidence } from "@/lib/domain/provenance";
import type { ProvenanceClass } from "@/lib/okf/types";
import type { ChunkType, EvidenceChunk, RetrievedEvidence } from "@/lib/retrieval/types";
import type { EvidenceChunkRow } from "@/lib/supabase/types";

/**
 * EvidenceChunk -> what an evidence card shows. Keeps the trust rules out of
 * components: the badge, the "is this NASA evidence" answer and the safe link
 * are all decided here.
 */

export interface EvidenceDisplayModel {
  id: string;
  heading: string;
  section: string;
  excerpt: string;
  /** Badge to show, after applying review state. */
  provenance: ProvenanceClass;
  provenanceLabel: string;
  /** True only for reviewed NASA-sourced text. */
  isCanonical: boolean;
  /** True for the team's own reading. Must be shown distinctly from NASA evidence. */
  isInterpretation: boolean;
  humanReviewed: boolean;
  /** An http(s) link, or null. Never a non-web value. */
  sourceUrl: string | null;
  investigationId: string | null;
  scores: { lexical: number | null; vector: number | null; combined: number } | null;
}

const DEFAULT_EXCERPT_LENGTH = 320;

function safeUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function excerpt(content: string, maxLength: number): string {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), maxLength - 40)).trimEnd()} …`;
}

export function toEvidenceDisplayModel(
  input: EvidenceChunk | RetrievedEvidence,
  maxExcerptLength: number = DEFAULT_EXCERPT_LENGTH,
): EvidenceDisplayModel {
  const retrieved = "chunk" in input ? input : null;
  const chunk = retrieved ? retrieved.chunk : (input as EvidenceChunk);
  const humanReviewed = chunk.verificationStatus === "verified";
  const provenance = getEffectiveProvenance(chunk.sourceClass, humanReviewed);

  return {
    id: chunk.id,
    heading: chunk.title,
    section: chunk.section,
    excerpt: excerpt(chunk.content, maxExcerptLength),
    provenance,
    provenanceLabel: getProvenanceLabel(provenance),
    isCanonical: isCanonicalEvidence(chunk.sourceClass, humanReviewed),
    isInterpretation: chunk.sourceClass === "TEAM_INTERPRETATION",
    humanReviewed,
    sourceUrl: safeUrl(chunk.sourceUrl),
    investigationId: chunk.investigationId,
    scores: retrieved
      ? { lexical: retrieved.lexicalScore, vector: retrieved.vectorScore, combined: retrieved.combinedScore }
      : null,
  };
}

export function toEvidenceDisplayModels(
  inputs: (EvidenceChunk | RetrievedEvidence)[],
): EvidenceDisplayModel[] {
  return inputs.map((input) => toEvidenceDisplayModel(input));
}

/** Database chunk_type values (upper-case, per the ingestion brief) to the frontend union. */
const CHUNK_TYPE_FROM_ROW: Record<string, ChunkType> = {
  OBJECTIVE: "objective",
  CONDITIONS: "conditions",
  VARIABLES: "variables",
  MEASUREMENT: "measurements",
  FINDING: "findings",
  LIMITATION: "limitations",
  INTERPRETATION: "safety_relevance",
};

const PROVENANCE_VALUES: ReadonlySet<string> = new Set([
  "NASA_SOURCE",
  "HUMAN_REVIEWED",
  "COMPUTED",
  "TEAM_INTERPRETATION",
  "GENERATED_SUMMARY",
  "UNVERIFIED",
]);

/**
 * Database row -> frontend EvidenceChunk. The embedding is dropped here on
 * purpose. Unrecognised values degrade to the least-trusted reading.
 */
export function rowToEvidenceChunk(
  row: Omit<EvidenceChunkRow, "embedding" | "fts" | "metadata">,
): EvidenceChunk {
  const [folder, recordId] = row.concept_id.split("/");
  return {
    id: row.chunk_id,
    conceptId: row.concept_id,
    investigationId: folder === "investigations" && recordId ? recordId : null,
    title: row.title,
    section: row.section,
    chunkType: CHUNK_TYPE_FROM_ROW[row.chunk_type.toUpperCase()] ?? "other",
    content: row.content,
    tags: row.tags,
    safetyCategories: row.safety_category.filter(
      (value): value is EvidenceChunk["safetyCategories"][number] =>
        value === "prevention" || value === "detection" || value === "suppression",
    ),
    fuelType: row.fuel_type,
    material: row.material,
    gravityCondition: (row.gravity_condition as EvidenceChunk["gravityCondition"]) ?? null,
    sourceClass: PROVENANCE_VALUES.has(row.source_class)
      ? (row.source_class as ProvenanceClass)
      : "UNVERIFIED",
    sourceUrl: row.source_url,
    verificationStatus: row.human_verified ? "verified" : "unverified",
    previousChunkId: row.previous_chunk_id,
    nextChunkId: row.next_chunk_id,
    embeddingVersion: row.embedding_version,
  };
}
