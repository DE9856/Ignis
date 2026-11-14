import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { buildCorpusChunks, isIgnoredKnowledgeFile } from "@/lib/retrieval/corpus";

import { SYNTHETIC_CORPUS, syntheticDocument, syntheticMarkdown } from "./fixtures";

describe("fromInvestigationDocument", () => {
  it("marks verified records as trusted and drafts as not", () => {
    expect(syntheticDocument(SYNTHETIC_CORPUS[0]).trusted).toBe(true);
    expect(syntheticDocument(SYNTHETIC_CORPUS[3]).trusted).toBe(false);
  });

  it("collects the names a reader might use, including hardware", () => {
    const document = syntheticDocument(SYNTHETIC_CORPUS[0]);
    expect(document.metadata.searchNames).toEqual([
      "Synthetic Rig Alpha",
      "ALPHA-1",
      "synth-alpha",
      "Bench Zeta",
    ]);
    expect(document.sourceUrl).toBe("https://example.com/synth-alpha");
  });
});

describe("buildCorpusChunks", () => {
  let root: string | null = null;
  afterEach(() => {
    if (root) fs.rmSync(root, { recursive: true, force: true });
    root = null;
  });

  it("ignores templates, READMEs and zz-local fixtures, and indexes only verified records", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "ignis-corpus-"));
    const folder = path.join(root, "investigations");
    fs.mkdirSync(folder);
    for (const record of SYNTHETIC_CORPUS)
      fs.writeFileSync(path.join(folder, `${record.id}.md`), syntheticMarkdown(record));
    fs.writeFileSync(
      path.join(folder, "zz-local-layout.md"),
      syntheticMarkdown({ ...SYNTHETIC_CORPUS[0], id: "zz" }),
    );
    fs.writeFileSync(path.join(folder, "_template.md"), "not parsed");
    fs.writeFileSync(path.join(folder, "README.md"), "not parsed");
    fs.writeFileSync(path.join(folder, "broken.md"), "---\ntype: Investigation\n---\n");

    const corpus = buildCorpusChunks(root);
    const records = new Set(corpus.chunks.map((chunk) => chunk.investigationId));
    expect([...records].sort()).toEqual(["synth-alpha", "synth-beta", "synth-gamma"]);
    expect(corpus.load.ignoredFiles.sort()).toEqual([
      "knowledge/investigations/README.md",
      "knowledge/investigations/_template.md",
      "knowledge/investigations/zz-local-layout.md",
    ]);
    expect(corpus.load.issues.map((issue) => issue.filePath)).toContain("knowledge/investigations/broken.md");
    expect(
      corpus.issues.some((issue) => issue.recordId === "synth-draft" && issue.kind === "draft-record"),
    ).toBe(true);
  });

  it("returns nothing for a knowledge folder with no investigations", () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "ignis-corpus-"));
    expect(buildCorpusChunks(root).chunks).toEqual([]);
  });

  it("treats local fixture names case-insensitively", () => {
    expect(isIgnoredKnowledgeFile("ZZ-LOCAL-x.md")).toBe(true);
    expect(isIgnoredKnowledgeFile("bass-ii.md")).toBe(false);
  });
});
