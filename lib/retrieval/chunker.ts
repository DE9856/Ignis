import type { ChunkableDocument } from "./adapter";
import { CHUNKING } from "./config";
import { decideSection, isBulletSection, type SectionRule } from "./sections";
import { sentences } from "./text";
import { estimateTokens, type TokenCounter } from "./tokens";
import type { ChunkType, EvidenceChunk } from "./types";

/**
 * Section-aware chunker (Member 5 brief, Part A; team workflow, section 10).
 *
 * - Input is a record that has already been parsed by `lib/okf`. There is no
 *   second Markdown parser here.
 * - Only trusted (verified) records produce chunks.
 * - Section headings are the boundaries. A short section is one chunk; a long
 *   one is split on bullets (findings, limitations) or paragraphs (the rest).
 * - A `##` subsection inherits the type of the `#` section above it.
 * - Ids are deterministic so re-ingestion overwrites instead of duplicating.
 * - Nothing is dropped silently: skipped and unknown sections are reported.
 */

export interface ChunkerOptions {
  targetTokens?: number;
  maxTokens?: number;
  countTokens?: TokenCounter;
}

export type ChunkIssueKind = "unknown-section" | "empty-section" | "oversize-unit" | "draft-record";

export interface ChunkIssue {
  recordId: string;
  filePath: string;
  section: string | null;
  kind: ChunkIssueKind;
  message: string;
}

export interface ChunkResult {
  chunks: EvidenceChunk[];
  issues: ChunkIssue[];
  /** Sections intentionally left out, such as Source Notes. */
  skipped: { recordId: string; section: string }[];
}

/** Header placed before the content in the text that gets embedded. Never shown or cited. */
export function embeddingHeader(
  chunk: Pick<EvidenceChunk, "investigation" | "title" | "section" | "chunkType" | "metadata">,
): string {
  const name =
    chunk.investigation.toLowerCase() === chunk.title.toLowerCase()
      ? chunk.title
      : `${chunk.investigation} (${chunk.title})`;
  const parts = [name, chunk.section];
  const equipment = [chunk.metadata.platform, ...chunk.metadata.hardware].filter(Boolean);
  if (equipment.length > 0 && ["OBJECTIVE", "CONDITIONS", "MEASUREMENT"].includes(chunk.chunkType)) {
    parts.push(`Hardware: ${equipment.join(", ")}`);
  }
  return parts.join(" | ");
}

/**
 * The exact string that is embedded for a chunk. A Conditions section often
 * never names its investigation, so the header carries the name; the stored
 * `content` stays exactly what the curator wrote.
 */
export function embeddingText(
  chunk: Pick<EvidenceChunk, "investigation" | "title" | "section" | "chunkType" | "content" | "metadata">,
): string {
  return `${embeddingHeader(chunk)}\n${chunk.content}`;
}

/** Top-level bullet items, each with its continuation lines. Text before the first bullet is its own unit. */
function bulletUnits(content: string): string[] {
  const units: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const text = current.join("\n").trim();
    if (text) units.push(text);
    current = [];
  };
  for (const line of content.split(/\r?\n/)) {
    if (/^[-*]\s+/.test(line)) flush();
    current.push(line);
  }
  flush();
  return units;
}

function paragraphUnits(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/** Break a unit that alone exceeds the budget: by sentence, then by word. */
function breakUnit(unit: string, budget: number, count: TokenCounter): string[] {
  const pieces: string[] = [];
  let current = "";
  const push = () => {
    if (current.trim()) pieces.push(current.trim());
    current = "";
  };
  for (const sentence of sentences(unit)) {
    if (count(sentence) > budget) {
      push();
      let words = "";
      for (const word of sentence.split(/\s+/)) {
        const candidate = words ? `${words} ${word}` : word;
        if (count(candidate) > budget && words) {
          pieces.push(words);
          words = word;
        } else {
          words = candidate;
        }
      }
      if (words) pieces.push(words);
      continue;
    }
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (count(candidate) > budget && current) {
      push();
      current = sentence;
    } else {
      current = candidate;
    }
  }
  push();
  return pieces;
}

/**
 * Pack units greedily up to the target, never past the budget.
 * With `overlap`, the next piece starts with the last sentence of the previous one.
 */
function pack(
  units: string[],
  target: number,
  budget: number,
  count: TokenCounter,
  overlap: boolean,
): string[] {
  const pieces: string[] = [];
  let current: string[] = [];
  // Bullets rejoin as a list; paragraphs keep their blank line. Either way the curator's formatting survives.
  const joined = (parts: string[]) => parts.join(overlap ? "\n\n" : "\n");

  for (const unit of units) {
    if (current.length > 0 && count(joined([...current, unit])) > target) {
      pieces.push(joined(current));
      const carry = overlap ? sentences(current[current.length - 1]).slice(-1) : [];
      current = carry.length > 0 && count(joined([carry[0], unit])) <= budget ? [carry[0]] : [];
    }
    current.push(unit);
  }
  if (current.length > 0) pieces.push(joined(current));
  return pieces;
}

interface SectionPlan {
  label: string;
  rule: SectionRule;
  content: string;
}

/** Walk the sections in order, resolving `##` subsections to their parent's rule. */
function planSections(document: ChunkableDocument, result: ChunkResult): SectionPlan[] {
  const plans: SectionPlan[] = [];
  let parent: { heading: string; rule: SectionRule | null; skipped: boolean } | null = null;

  for (const section of document.sections) {
    const decision = decideSection(section.slug);
    let rule: SectionRule | null = null;
    let label = section.heading;

    if (decision.kind === "chunk") {
      rule = decision.rule;
    } else if (decision.kind === "skip" || (section.level === 2 && parent?.skipped)) {
      result.skipped.push({ recordId: document.recordId, section: section.heading });
    } else if (section.level === 2 && parent?.rule) {
      rule = parent.rule;
      label = `${parent.heading} › ${section.heading}`;
    } else if (section.content.trim().length > 0) {
      result.issues.push({
        recordId: document.recordId,
        filePath: document.filePath,
        section: section.heading,
        kind: "unknown-section",
        message: `Heading "${section.heading}" is not one of the agreed section headings, so it was not indexed.`,
      });
    }

    if (section.level === 1) {
      parent = {
        heading: section.heading,
        rule: decision.kind === "chunk" ? decision.rule : null,
        skipped: decision.kind === "skip",
      };
    }
    if (!rule) continue;

    if (section.content.trim().length < CHUNKING.minContentChars) {
      // A heading followed directly by `##` subsections is a container, not an empty section.
      const next = document.sections[section.order + 1];
      if (!(section.level === 1 && next?.level === 2)) {
        result.issues.push({
          recordId: document.recordId,
          filePath: document.filePath,
          section: label,
          kind: "empty-section",
          message: `Section "${label}" is empty.`,
        });
      }
      continue;
    }
    plans.push({ label, rule, content: section.content.trim() });
  }
  return plans;
}

export function chunkDocument(document: ChunkableDocument, options: ChunkerOptions = {}): ChunkResult {
  const result: ChunkResult = { chunks: [], issues: [], skipped: [] };
  if (!document.trusted) {
    result.issues.push({
      recordId: document.recordId,
      filePath: document.filePath,
      section: null,
      kind: "draft-record",
      message: "Record is not verified; it is excluded from retrieval.",
    });
    return result;
  }

  const count = options.countTokens ?? estimateTokens;
  const target = options.targetTokens ?? CHUNKING.targetTokens;
  const max = options.maxTokens ?? CHUNKING.maxTokens;
  const perType = new Map<ChunkType, number>();

  for (const plan of planSections(document, result)) {
    const base = {
      conceptId: document.conceptId,
      investigationId: document.recordId,
      investigation: document.investigation,
      title: document.title,
      section: plan.label,
      chunkType: plan.rule.chunkType,
      metadata: document.metadata,
    };
    const headerTokens = count(embeddingHeader(base)) + 1;
    const budget = max - headerTokens;
    const softTarget = Math.min(target - headerTokens, budget);

    let pieces: string[];
    if (count(plan.content) <= budget) {
      pieces = [plan.content];
    } else {
      const bullets = isBulletSection(plan.rule.chunkType);
      const units = (bullets ? bulletUnits(plan.content) : paragraphUnits(plan.content)).flatMap((unit) => {
        if (count(unit) <= budget) return [unit];
        result.issues.push({
          recordId: document.recordId,
          filePath: document.filePath,
          section: plan.label,
          kind: "oversize-unit",
          message: `A ${bullets ? "bullet" : "paragraph"} in "${plan.label}" is longer than one chunk and was split by sentence. Consider shortening it.`,
        });
        return breakUnit(unit, budget, count);
      });
      pieces = pack(units, softTarget, budget, count, !bullets);
    }

    for (const content of pieces) {
      const index = (perType.get(plan.rule.chunkType) ?? 0) + 1;
      perType.set(plan.rule.chunkType, index);
      result.chunks.push({
        ...base,
        id: `${document.recordId}.${plan.rule.chunkType.toLowerCase()}.${String(index).padStart(2, "0")}`,
        chunkIndex: result.chunks.length,
        content,
        tags: document.tags,
        safetyCategories: document.safetyCategories,
        fuelType: document.fuelType,
        material: document.material,
        gravityCondition: document.gravityCondition,
        sourceClass: plan.rule.sourceClass,
        sourceUrl: document.sourceUrl,
        verificationStatus: "verified",
        previousChunkId: null,
        nextChunkId: null,
        embeddingVersion: null,
      });
    }
  }

  result.chunks.forEach((chunk, index, all) => {
    chunk.previousChunkId = all[index - 1]?.id ?? null;
    chunk.nextChunkId = all[index + 1]?.id ?? null;
  });
  return result;
}

/** Chunk many records; ids must be unique across the corpus. */
export function chunkDocuments(documents: ChunkableDocument[], options: ChunkerOptions = {}): ChunkResult {
  const all: ChunkResult = { chunks: [], issues: [], skipped: [] };
  const seen = new Set<string>();
  for (const document of documents) {
    const result = chunkDocument(document, options);
    for (const chunk of result.chunks) {
      if (seen.has(chunk.id))
        throw new Error(`Duplicate chunk id ${chunk.id}: two records share the id ${document.recordId}`);
      seen.add(chunk.id);
    }
    all.chunks.push(...result.chunks);
    all.issues.push(...result.issues);
    all.skipped.push(...result.skipped);
  }
  return all;
}

/** True when `a` and `b` are consecutive pieces of one split section. */
export function sameSplitSection(a: EvidenceChunk, b: EvidenceChunk): boolean {
  return a.investigationId === b.investigationId && a.section === b.section && a.chunkType === b.chunkType;
}
