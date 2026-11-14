import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadKnowledgeBase } from "@/lib/okf/loader";

let root: string;

function write(relativePath: string, content: string) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "ignis-knowledge-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("loadKnowledgeBase", () => {
  it("returns an empty knowledge base when nothing exists", () => {
    const knowledge = loadKnowledgeBase(root);
    expect(knowledge.investigations).toEqual([]);
    expect(knowledge.issues).toEqual([]);
  });

  it("loads valid files in name order and skips READMEs, templates and .gitkeep", () => {
    write("investigations/b.md", "---\ntype: Investigation\ntitle: B\n---\n");
    write("investigations/a.md", "---\ntype: Investigation\ntitle: A\n---\n");
    write("investigations/README.md", "not a record");
    write("investigations/_draft.md", "not a record");
    write("investigations/.gitkeep", "");
    write("concepts/c.md", "---\ntype: Concept\ntitle: C\n---\n");

    const knowledge = loadKnowledgeBase(root);
    expect(knowledge.investigations.map((investigation) => investigation.id)).toEqual(["a", "b"]);
    expect(knowledge.concepts.map((concept) => concept.id)).toEqual(["c"]);
    expect(knowledge.issues).toEqual([]);
  });

  it("collects invalid and misplaced files as issues without failing", () => {
    write("investigations/bad.md", "---\ntype: Investigation\n---\n");
    write("hardware/misplaced.md", "---\ntype: Investigation\ntitle: Wrong folder\n---\n");

    const knowledge = loadKnowledgeBase(root);
    expect(knowledge.investigations).toEqual([]);
    expect(knowledge.hardware).toEqual([]);
    expect(knowledge.issues.map((issue) => issue.filePath).sort()).toEqual([
      "knowledge/hardware/misplaced.md",
      "knowledge/investigations/bad.md",
    ]);
  });
});
