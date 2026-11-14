import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { chunkDocuments } from "@/lib/retrieval/chunker";
import { classifyBoundary } from "@/lib/retrieval/guard";
import { NOT_ESTABLISHED } from "@/lib/retrieval/messages";
import { analyzeQuery, buildVocabulary } from "@/lib/retrieval/query-analysis";
import type { BoundaryKind, EvidenceChunk } from "@/lib/retrieval/types";

import { SYNTHETIC_CORPUS, syntheticDocument } from "./fixtures";

const catalog = chunkDocuments(SYNTHETIC_CORPUS.map(syntheticDocument)).chunks;
const vocabulary = buildVocabulary(catalog);
const understand = (text: string) => analyzeQuery(text, vocabulary);

/** A one-chunk catalog whose investigation is named like an English word. Names only; no facts. */
function namedCatalog(names: string[]): EvidenceChunk[] {
  return names.map((name, index) => ({
    ...catalog[0],
    id: `${name.toLowerCase()}.objective.01`,
    investigationId: name.toLowerCase(),
    investigation: name,
    title: name,
    chunkIndex: index,
    metadata: {
      ...catalog[0].metadata,
      searchNames: [name, name.toLowerCase()],
      hardware: [],
      platform: null,
    },
  }));
}

describe("analyzeQuery", () => {
  it("finds investigations by short title, title or id", () => {
    expect(understand("What did ALPHA-1 find?").investigations).toEqual(["synth-alpha"]);
    expect(understand("objective of synthetic rig beta").investigations).toEqual(["synth-beta"]);
    expect(understand("Tell me about synth-gamma").investigations).toEqual(["synth-gamma"]);
  });

  it("needs capitals for acronyms that are also English words", () => {
    const names = buildVocabulary(namedCatalog(["SAME", "SAME-R"]));
    expect(analyzeQuery("Do flames burn the same way in orbit?", names).investigations).toEqual([]);
    expect(analyzeQuery("What did SAME measure?", names).investigations).toEqual(["same"]);
    expect(analyzeQuery("what did the same experiment measure", names).investigations).toEqual(["same"]);
  });

  it("prefers the longer name when one contains another", () => {
    const names = buildVocabulary(namedCatalog(["SAME", "SAME-R"]));
    expect(analyzeQuery("What did SAME-R find?", names).investigations).toEqual(["same-r"]);
    expect(analyzeQuery("Compare SAME and SAME-R", names).investigations.sort()).toEqual(["same", "same-r"]);
  });

  it("reads safety roles, gravity, sections, materials, hardware and list intent", () => {
    const result = understand(
      "Which investigations studied smoke detection on testcloth in Bench Zeta at lunar gravity?",
    );
    expect(result.safetyCategories).toContain("detection");
    expect(result.gravity).toEqual(["partial_gravity"]);
    expect(result.materials).toEqual(["testcloth"]);
    expect(result.hardware).toEqual(["Bench Zeta"]);
    expect(result.enumerative).toBe(true);
    expect(understand("What instruments measured the smoke?").sectionIntent).toContain("MEASUREMENT");
    expect(understand("What oxygen level did BETA-2 use?").conditionFields).toEqual(["oxygen"]);
  });
});

interface BoundaryCase {
  id: string;
  question: string;
  guardKind: BoundaryKind | null;
}

const boundary = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "tests/retrieval/boundary.json"), "utf8"),
) as { requiredPhrase: string; cases: BoundaryCase[] };

describe("classifyBoundary", () => {
  it("uses the brief's refusal phrase", () => {
    expect(boundary.requiredPhrase).toBe(NOT_ESTABLISHED);
  });

  for (const item of boundary.cases) {
    it(`${item.id}: ${item.question}`, () => {
      const notice = classifyBoundary(item.question, understand(item.question), catalog);
      expect(notice?.kind ?? null).toBe(item.guardKind);
      if (notice && notice.kind !== "FALSE_PREMISE" && notice.kind !== "CORPUS_COVERAGE") {
        expect(notice.message).toContain(NOT_ESTABLISHED);
      }
    });
  }

  it("answers a partial-gravity coverage question from metadata, naming matches when they exist", () => {
    const none = classifyBoundary(
      "Which experiment directly tested lunar gravity?",
      understand("lunar"),
      catalog,
    );
    expect(none?.message).toMatch(/No reviewed investigation/);

    const partial = catalog.map((chunk) =>
      chunk.investigationId === "synth-gamma"
        ? {
            ...chunk,
            gravityCondition: "partial_gravity" as const,
            metadata: { ...chunk.metadata, gravityValue: 0.5 },
          }
        : chunk,
    );
    const some = classifyBoundary(
      "Has any experiment tested Martian gravity?",
      understand("martian"),
      partial,
    );
    expect(some?.message).toContain("GAMMA-3 (0.5 g)");
  });

  it("says plainly when a named investigation's record leaves a condition unreported", () => {
    const question = "What oxygen level did BETA-2 use?";
    const notice = classifyBoundary(question, understand(question), catalog);
    expect(notice?.kind).toBe("VALUE_NOT_REPORTED");
    expect(notice?.message).toContain("BETA-2 does not report an oxygen concentration");

    const reported = "What oxygen level did ALPHA-1 use?";
    expect(classifyBoundary(reported, understand(reported), catalog)).toBeNull();
  });

  it("flags a capitalised name that appears nowhere in the corpus, but not hardware that does", () => {
    expect(
      classifyBoundary("What did QUASAR-9 find?", understand("What did QUASAR-9 find?"), catalog)?.kind,
    ).toBe("INSUFFICIENT_EVIDENCE");
    const known = "What ran on the NASA ISS in SYNTHETIC tests?";
    expect(classifyBoundary(known, understand(known), catalog)).toBeNull();
  });
});
