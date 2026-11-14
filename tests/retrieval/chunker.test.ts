import { describe, expect, it } from "vitest";

import { chunkDocument, chunkDocuments, embeddingText } from "@/lib/retrieval/chunker";
import { CHUNKING } from "@/lib/retrieval/config";
import { estimateTokens } from "@/lib/retrieval/tokens";

import { SYNTHETIC_CORPUS, syntheticDocument } from "./fixtures";

const alpha = syntheticDocument(SYNTHETIC_CORPUS[0]);

describe("chunkDocument", () => {
  it("never chunks an unverified record and says why", () => {
    const result = chunkDocument(syntheticDocument(SYNTHETIC_CORPUS[3]));
    expect(result.chunks).toEqual([]);
    expect(result.issues.map((issue) => issue.kind)).toEqual(["draft-record"]);
  });

  it("maps sections to chunk types and keeps interpretation separate from NASA evidence", () => {
    const { chunks, skipped } = chunkDocument(alpha);
    expect(chunks.map((chunk) => [chunk.chunkType, chunk.sourceClass])).toEqual([
      ["OBJECTIVE", "NASA_SOURCE"],
      ["CONDITIONS", "NASA_SOURCE"],
      ["FINDING", "NASA_SOURCE"],
      ["INTERPRETATION", "TEAM_INTERPRETATION"],
      ["LIMITATION", "NASA_SOURCE"],
    ]);
    expect(skipped).toEqual([{ recordId: "synth-alpha", section: "Source Notes" }]);
    expect(chunks.some((chunk) => chunk.content.includes("Not a real source"))).toBe(false);
  });

  it("builds deterministic ids and links neighbours within the record", () => {
    const first = chunkDocument(alpha).chunks;
    const second = chunkDocument(alpha).chunks;
    expect(first.map((chunk) => chunk.id)).toEqual(second.map((chunk) => chunk.id));
    expect(first[0].id).toBe("synth-alpha.objective.01");
    expect(first[1].previousChunkId).toBe(first[0].id);
    expect(first[1].nextChunkId).toBe(first[2].id);
    expect(first[0].previousChunkId).toBeNull();
    expect(first[first.length - 1].nextChunkId).toBeNull();
  });

  it("copies record provenance and conditions onto every chunk", () => {
    for (const chunk of chunkDocument(alpha).chunks) {
      expect(chunk).toMatchObject({
        conceptId: "investigations/synth-alpha",
        investigationId: "synth-alpha",
        investigation: "ALPHA-1",
        title: "Synthetic Rig Alpha",
        material: "testcloth",
        gravityCondition: "microgravity",
        sourceUrl: "https://example.com/synth-alpha",
        verificationStatus: "verified",
      });
      expect(chunk.safetyCategories).toEqual(["prevention"]);
      expect(chunk.metadata.oxygenMin).toBe(1);
      expect(chunk.metadata.pressureMin).toBeNull();
    }
  });

  it("stores the curator's text unchanged and embeds it with a name header", () => {
    const objective = chunkDocument(alpha).chunks[0];
    expect(objective.content).toBe(
      "SYNTHETIC FIXTURE. Observe how a flame front crawls across testcloth strips in a quiet chamber.",
    );
    const embedded = embeddingText(objective);
    expect(embedded.startsWith("ALPHA-1 (Synthetic Rig Alpha) | Objective | Hardware: Bench Zeta\n")).toBe(
      true,
    );
    expect(embedded.endsWith(objective.content)).toBe(true);
  });

  it("lets a ## subsection inherit its parent's type", () => {
    const document = syntheticDocument({
      id: "synth-sub",
      title: "Synthetic Subsections",
      body: "# Key Findings\n\n## Flame shape\n\n- SYNTHETIC. One.\n\n## Glow\n\n- SYNTHETIC. Two.",
    });
    const { chunks, issues } = chunkDocument(document);
    expect(chunks.map((chunk) => [chunk.id, chunk.section])).toEqual([
      ["synth-sub.finding.01", "Key Findings › Flame shape"],
      ["synth-sub.finding.02", "Key Findings › Glow"],
    ]);
    expect(issues).toEqual([]);
  });

  it("reports unknown headings and empty sections instead of dropping them silently", () => {
    const document = syntheticDocument({
      id: "synth-odd",
      title: "Synthetic Odd Headings",
      body: "# Objective\n\n# Background Story\n\nSYNTHETIC. Text under a heading nobody agreed on.",
    });
    const { chunks, issues } = chunkDocument(document);
    expect(chunks).toEqual([]);
    expect(issues.map((issue) => [issue.kind, issue.section])).toEqual([
      ["empty-section", "Objective"],
      ["unknown-section", "Background Story"],
    ]);
  });

  it("splits a long findings section on bullets, never inside one, within the token ceiling", () => {
    const bullets = Array.from(
      { length: 40 },
      (_, index) =>
        `- SYNTHETIC finding number ${index + 1} about crawling flame fronts over testcloth in drafts.`,
    );
    const document = syntheticDocument({
      id: "synth-long",
      title: "Synthetic Long Findings",
      body: `# Key Findings\n\n${bullets.join("\n")}`,
    });
    const { chunks } = chunkDocument(document);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(estimateTokens(embeddingText(chunk))).toBeLessThanOrEqual(CHUNKING.maxTokens);
      for (const line of chunk.content.split("\n")) expect(line.startsWith("- SYNTHETIC finding")).toBe(true);
    }
    expect(chunks.flatMap((chunk) => chunk.content.split("\n"))).toEqual(bullets);
  });

  it("splits long prose by paragraph and carries one sentence of overlap", () => {
    const paragraph = (index: number) =>
      Array.from(
        { length: 12 },
        (_, sentence) => `Synthetic sentence ${index}-${sentence} describes a test chamber.`,
      ).join(" ");
    const document = syntheticDocument({
      id: "synth-prose",
      title: "Synthetic Long Prose",
      body: `# Experimental Conditions\n\n${Array.from({ length: 6 }, (_, index) => paragraph(index)).join("\n\n")}`,
    });
    const { chunks } = chunkDocument(document);
    expect(chunks.length).toBeGreaterThan(1);
    const lastSentence = chunks[0].content.split(/(?<=\.)\s+/).pop() as string;
    expect(chunks[1].content.startsWith(lastSentence)).toBe(true);
    for (const chunk of chunks) {
      expect(estimateTokens(embeddingText(chunk))).toBeLessThanOrEqual(CHUNKING.maxTokens);
    }
  });
});

describe("chunkDocuments", () => {
  it("rejects two records that would produce the same chunk ids", () => {
    expect(() => chunkDocuments([alpha, alpha])).toThrow(/Duplicate chunk id/);
  });
});
