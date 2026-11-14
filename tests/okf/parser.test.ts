import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  isInvestigationDocument,
  isVerified,
  parseBulletList,
  parseOkfDocument,
  parseSections,
  toInvestigation,
} from "@/lib/okf/parser";

// Synthetic content. Not NASA data.
const FIXTURE = `---
type: Investigation
title: Synthetic fixture investigation
status: draft
tags:
  - test
oxygenMin: 10
oxygenMax: 20
sources:
  - id: source-1
    resource: https://example.com
    accessed: 2026-01-02
generated:
  by: human:test
verified: []
---

# Objective

Exercise the parser.

# Key Findings

- First synthetic finding
- Second synthetic finding

\`\`\`md
# Not a heading
\`\`\`

# Limitations
`;

function parseInvestigation(raw: string, filePath = "knowledge/investigations/fixture-one.md") {
  const result = parseOkfDocument(raw, filePath);
  if (!result.ok) throw new Error(JSON.stringify(result.issues));
  if (!isInvestigationDocument(result.document)) throw new Error("expected an Investigation");
  return result.document;
}

describe("parseSections", () => {
  it("splits on headings and ignores headings inside code fences", () => {
    const sections = parseSections("# A\n\ntext\n\n```\n# B\n```\n\n## C\n\nmore");
    expect(sections.map((section) => section.slug)).toEqual(["a", "c"]);
    expect(sections[0].content).toContain("# B");
    expect(sections[1].level).toBe(2);
  });
});

describe("parseBulletList", () => {
  it("returns bullet items and nothing else", () => {
    expect(parseBulletList("intro\n- one\n* two\n\nnot a bullet")).toEqual(["one", "two"]);
  });
});

describe("parseOkfDocument", () => {
  it("returns metadata and sections, with the id taken from the file name", () => {
    const document = parseInvestigation(FIXTURE);
    expect(document.id).toBe("fixture-one");
    expect(document.metadata.title).toBe("Synthetic fixture investigation");
    expect(document.sections.map((section) => section.slug)).toEqual([
      "objective",
      "key-findings",
      "limitations",
    ]);
  });

  it("leaves absent scientific fields null instead of defaulting them", () => {
    const { metadata } = parseInvestigation(FIXTURE);
    expect(metadata.oxygenMin).toBe(10);
    expect(metadata.pressureMin).toBeNull();
    expect(metadata.airflowMax).toBeNull();
    expect(metadata.gravityValue).toBeNull();
    expect(metadata.material).toBeNull();
  });

  it("stores YAML dates as plain strings and defaults source trust to UNVERIFIED", () => {
    const { metadata } = parseInvestigation(FIXTURE);
    expect(metadata.sources[0]).toMatchObject({ accessed: "2026-01-02", sourceClass: "UNVERIFIED" });
  });

  it("reports issues instead of throwing", () => {
    const missingTitle = parseOkfDocument("---\ntype: Investigation\n---\n", "x.md");
    expect(missingTitle.ok).toBe(false);

    const inverted = parseOkfDocument(
      "---\ntype: Investigation\ntitle: T\noxygenMin: 30\noxygenMax: 20\n---\n",
      "x.md",
    );
    expect(inverted.ok).toBe(false);

    const brokenYaml = parseOkfDocument("---\ntitle: [unclosed\n---\n", "x.md");
    expect(brokenYaml.ok).toBe(false);
  });

  it("reads related links as bare ids or objects, and rejects malformed ids", () => {
    const { metadata } = parseInvestigation(
      "---\ntype: Investigation\ntitle: T\nrelated:\n  - hardware/rig-one\n  - id: investigations/other\n    relation: follow-on\n---\n",
    );
    expect(metadata.related).toEqual([
      { id: "hardware/rig-one", relation: null, note: null },
      { id: "investigations/other", relation: "follow-on", note: null },
    ]);

    const bad = parseOkfDocument("---\ntype: Investigation\ntitle: T\nrelated:\n  - Rig One\n---\n", "x.md");
    expect(bad.ok).toBe(false);
  });

  it("rejects status 'verified' without a reviewer entry", () => {
    const result = parseOkfDocument("---\ntype: Investigation\ntitle: T\nstatus: verified\n---\n", "x.md");
    expect(result.ok).toBe(false);
  });

  it("accepts the investigation template as shipped", () => {
    const template = fs.readFileSync(
      path.join(process.cwd(), "knowledge/_templates/investigation.md"),
      "utf8",
    );
    expect(parseOkfDocument(template, "knowledge/_templates/investigation.md").ok).toBe(true);
  });
});

describe("toInvestigation", () => {
  it("maps sections onto objective, findings and limitations", () => {
    const investigation = toInvestigation(parseInvestigation(FIXTURE));
    expect(investigation.objective).toBe("Exercise the parser.");
    expect(investigation.keyFindings).toEqual(["First synthetic finding", "Second synthetic finding"]);
    expect(investigation.limitations).toEqual([]);
    expect(isVerified(investigation)).toBe(false);
  });
});
