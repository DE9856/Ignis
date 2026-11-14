import { getEffectiveProvenance, getProvenanceLabel, isCanonicalEvidence } from "@/lib/domain/provenance";
import type { ProvenanceClass } from "@/lib/okf/types";
import { fromRecord, type EvidenceChunkRecord } from "@/lib/retrieval/rows";
import type { EvidenceChunk, RetrievedEvidence } from "@/lib/retrieval/types";
import type { EvidenceChunkRow } from "@/lib/supabase/types";

/**
 * EvidenceChunk -> what an evidence card shows. Keeps the trust rules out of
 * components: the badge, the "is this NASA evidence" answer and the safe link
 * are all decided here.
 */

export interface EvidenceDisplayModel {
  id: string;
  heading: string;
  /** Investigation display name, e.g. BASS-II. */
  investigation: string;
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
  /** Score components for the why-retrieved view. `combined` is the fused score used for ranking. */
  scores: { lexical: number | null; vector: number | null; metadata: number | null; combined: number } | null;
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
    investigation: chunk.investigation,
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
      ? {
          lexical: retrieved.scores.lexical,
          vector: retrieved.scores.vector,
          metadata: retrieved.scores.metadata,
          combined: retrieved.scores.fused,
        }
      : null,
  };
}

export function toEvidenceDisplayModels(
  inputs: (EvidenceChunk | RetrievedEvidence)[],
): EvidenceDisplayModel[] {
  return inputs.map((input) => toEvidenceDisplayModel(input));
}

/**
 * Database row -> frontend EvidenceChunk. The embedding is dropped here on
 * purpose. Unrecognised enum values degrade to the least-trusted reading
 * (see `fromRecord` in `lib/retrieval/rows.ts`, the single row mapper).
 */
export function rowToEvidenceChunk(row: Omit<EvidenceChunkRow, "embedding" | "fts">): EvidenceChunk {
  // fromRecord validates every enum column and fills missing metadata with nulls,
  // so the looser database row type is safe to hand over.
  return fromRecord(row as unknown as EvidenceChunkRecord);
}
