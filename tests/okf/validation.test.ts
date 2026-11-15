import { describe, expect, it } from "vitest";

import { fileLevel, validateKnowledge, type KnowledgeReport } from "@/lib/okf/validation";

import { FIXTURE_KNOWLEDGE_ROOT, INVALID_FIXTURE_KNOWLEDGE_ROOT } from "../fixtures";

function messagesFor(report: KnowledgeReport, fileName: string): string {
  const file = report.files.find((entry) => entry.filePath.endsWith(`/${fileName}`));
  if (!file) throw new Error(`no report for ${fileName}`);
  return `${fileLevel(file)} ${file.findings.map((finding) => `${finding.level}:${finding.message}`).join(" | ")}`;
}

describe("validateKnowledge on the valid fixture set", () => {
  const report = validateKnowledge(FIXTURE_KNOWLEDGE_ROOT);

  it("reports no errors", () => {
    expect(report.summary.withErrors).toBe(0);
    expect(report.summary.files).toBe(7);
  });

  it("passes a complete, reviewed record cleanly", () => {
    expect(messagesFor(report, "test-investigation-alpha.md")).toBe("PASS ");
  });

  it("warns, without failing, about missing sections and not-yet-agreed fields", () => {
    expect(messagesFor(report, "test-investigation-beta.md")).toMatch(/^WARN WARN:Missing sections/);
    expect(messagesFor(report, "test-scenario-alpha.md")).toMatch(
      /Fields not in the shared schema yet: crew_size/,
    );
  });

  it("records review state and counts per file", () => {
    const alpha = report.files.find((file) => file.id === "test-investigation-alpha");
    expect(alpha).toMatchObject({ humanReviewed: true, status: "stable", sourceCount: 1, sectionCount: 8 });
  });
});

describe("validateKnowledge on the invalid fixture set", () => {
  const report = validateKnowledge(INVALID_FIXTURE_KNOWLEDGE_ROOT);

  it.each([
    ["test-malformed-yaml.md", /ERROR:Invalid YAML frontmatter/],
    ["test-no-frontmatter.md", /ERROR:Missing YAML frontmatter/],
    ["test-missing-title.md", /ERROR:title:/],
    ["test-missing-type.md", /ERROR:type:/],
    ["test-invalid-status.md", /ERROR:status:/],
    ["test-unknown-key.md", /ERROR:Unrecognized key: "oxygen_minimum"/],
    ["test-missing-source.md", /ERROR:No sources listed/],
    ["test-invalid-source-url.md", /ERROR:Source 's' has an invalid URL/],
    ["test-malformed-verification.md", /ERROR:verified\.0/],
    ["test-self-verified.md", /ERROR:Verified only by its author/],
    ["test-stable-without-reviewer.md", /ERROR:status: status is 'stable'/],
    ["test-placeholder.md", /ERROR:Placeholder text found: TODO/],
    ["test-duplicate-two.md", /ERROR:Duplicate id 'investigations\/test-duplicate'/],
    ["test-inverted-range.md", /ERROR:oxygen_min: oxygen_min \(30\) is greater than oxygen_max \(20\)/],
    ["test-wrong-folder.md", /ERROR:type 'Investigation' does not belong in knowledge\/hardware/],
  ])("%s is an error", (fileName, expected) => {
    expect(messagesFor(report, fileName)).toMatch(expected);
  });

  it("treats draft-only problems as warnings", () => {
    const text = messagesFor(report, "test-draft-warnings.md");
    expect(text).toMatch(/^WARN /);
    expect(text).toMatch(/WARN:No sources listed/);
    expect(text).toMatch(/WARN:Unresolved link: hardware\/test-does-not-exist/);
  });

  it("summarises errors and warnings separately", () => {
    expect(report.summary).toEqual({ files: 17, valid: 0, withWarnings: 2, withErrors: 15 });
  });
});

describe("validateKnowledge on the real knowledge base", () => {
  it("has no structural errors", () => {
    const report = validateKnowledge();
    const failing = report.files.filter((file) => fileLevel(file) === "ERROR").map((file) => file.filePath);
    expect(failing).toEqual([]);
  });
});
