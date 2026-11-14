import type { ProvenanceClass } from "@/lib/okf/types";
import type { BoundaryNotice, ChunkType } from "@/lib/retrieval/types";

/**
 * Shapes for optional grounded synthesis (Member 5 brief, steps 12-13).
 *
 *   retrieved, displayed evidence -> user ticks passages -> "Summarise"
 *   -> server reloads those passages by id -> boundary check -> LLM
 *   -> grounding check on every statement -> sectioned answer with citations
 *
 * Imported by client components. Keep it free of runtime dependencies.
 */

export const SYNTHESIS_ENDPOINT = "/api/evidence/synthesize";

export const SYNTHESIS_LIMITS = {
  /** Passages a user can send. The brief selects 4-6; a little headroom. */
  maxSources: 8,
  maxQuestionChars: 500,
} as const;

/** The four sections the brief requires, in display order. */
export const SYNTHESIS_SECTIONS = ["answer", "nasaEvidence", "teamInterpretation", "limitations"] as const;
export type SynthesisSection = (typeof SYNTHESIS_SECTIONS)[number];

export const SYNTHESIS_SECTION_LABELS: Record<SynthesisSection, string> = {
  answer: "Answer",
  nasaEvidence: "NASA evidence",
  teamInterpretation: "Team interpretation",
  limitations: "Limitations",
};

export interface SynthesisRequest {
  question: string;
  /** Ids of displayed passages the user selected. Text is never sent; the server reloads it. */
  chunkIds: string[];
}

/** One sentence of the summary and the passages it rests on. */
export interface SynthesisStatement {
  text: string;
  /** Chunk ids, in the order cited. Empty only for the fixed "does not establish" sentence. */
  sources: string[];
}

/** A passage the summary was written from, numbered as it is cited. */
export interface SynthesisSource {
  id: string;
  /** 1-based citation number shown as [n]. */
  number: number;
  investigation: string;
  section: string;
  chunkType: ChunkType;
  sourceClass: ProvenanceClass;
  sourceUrl: string | null;
}

/** A statement the grounding check removed, and why. Shown so nothing is dropped silently. */
export interface RemovedStatement {
  section: SynthesisSection;
  text: string;
  reason: string;
}

export type SynthesisResponse =
  | {
      status: "ok";
      sections: Record<SynthesisSection, SynthesisStatement[]>;
      sources: SynthesisSource[];
      removed: RemovedStatement[];
      /** True when nothing grounded survived, or the model said the evidence is insufficient. */
      insufficient: boolean;
      /** The answer sentences failed the checks, but supported findings remain and are shown. */
      answerWithheld: boolean;
      /** Deterministic reasons for passages left out, e.g. an unverified investigation. Labelled COMPUTED. */
      notes: string[];
      /** True when a second model pass confirmed each kept statement against its cited passages. */
      meaningChecked: boolean;
      /** Provider and model id, e.g. `groq:openai/gpt-oss-120b`; null when no model was called. */
      model: string | null;
    }
  /** The question asks for something IGNIS does not summarise (probability, guarantee, ...). */
  | { status: "refused"; boundary: BoundaryNotice }
  | { status: "unavailable"; reason: string };
