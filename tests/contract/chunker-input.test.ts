import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { canUseForRetrieval, getSectionProvenance, isEvidenceSection } from "@/lib/domain/provenance";
import { isInvestigationDocument, isVerified, parseOkfDocument } from "@/lib/okf/parser";
import type { OkfSection } from "@/lib/okf/types";

import { FIXTURE_IDS, FIXTURE_KNOWLEDGE_ROOT } from "../fixtures";

/**
 * CONTRACT: OKF parser -> future chunker (Member 5).
 *
 * The chunker receives a parsed document: metadata plus ordered sections. This
 * pins what it can rely on. It does not test chunking itself.
 */
function parseFixture(id: string) {
  const filePath = `knowledge/investigations/${id}.md`;
  const raw = fs.readFileSync(path.join(FIXTURE_KNOWLEDGE_ROOT, "investigations", `${id}.md`), "utf8");
  const result = parseOkfDocument(raw, filePath);
  if (!result.ok || !isInvestigationDocument(result.document)) throw new Error(`fixture ${id} did not parse`);
  return result.document;
}

describe("contract: parser -> chunker input", () => {
  const alpha = parseFixture(FIXTURE_IDS.alpha);

  it("exposes id, type, file path, metadata and sections", () => {
    expect(Object.keys(alpha).sort()).toEqual(["filePath", "id", "metadata", "sections", "type"]);
    expect(alpha.id).toBe(FIXTURE_IDS.alpha);
    expect(alpha.type).toBe("Investigation");
  });

  it("returns sections in document order with stable slugs", () => {
    expect(alpha.sections.map((section) => section.slug)).toEqual([
      "objective",
      "experimental-conditions",
      "variables",
      "sensors-and-measurements",
      "key-findings",
      "fire-safety-relevance",
      "limitations",
      "source-notes",
    ]);
    expect(alpha.sections.map((section) => section.order)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("gives every section the same five fields, with trimmed non-empty content", () => {
    const keys: (keyof OkfSection)[] = ["content", "heading", "level", "order", "slug"];
    for (const section of alpha.sections) {
      expect(Object.keys(section).sort()).toEqual(keys);
      expect(section.content).toBe(section.content.trim());
      expect(section.content.length).toBeGreaterThan(0);
    }
  });

  it("carries the metadata a chunk must inherit", () => {
    expect(alpha.metadata).toMatchObject({
      title: "TEST_INVESTIGATION_ALPHA",
      safetyCategories: ["prevention", "detection"],
      fuelType: "TEST_FUEL_A",
      material: "TEST_MATERIAL_A",
      gravityCondition: "microgravity",
      tags: ["synthetic", "fixture"],
    });
    expect(alpha.metadata.sources[0].resource).toBe("https://test.invalid/alpha");
  });

  it("lets the chunker decide eligibility and evidence class from shared rules", () => {
    expect(isVerified(alpha.metadata)).toBe(true);
    expect(isVerified(parseFixture(FIXTURE_IDS.beta).metadata)).toBe(false);
    expect(isVerified(parseFixture(FIXTURE_IDS.delta).metadata)).toBe(false);

    const evidence = alpha.sections.filter((section) => isEvidenceSection(section.slug));
    expect(evidence.map((section) => section.slug)).not.toContain("source-notes");

    const classes = Object.fromEntries(
      evidence.map((section) => [section.slug, getSectionProvenance(section.slug)]),
    );
    expect(classes["fire-safety-relevance"]).toBe("TEAM_INTERPRETATION");
    expect(classes["key-findings"]).toBe("NASA_SOURCE");

    expect(
      canUseForRetrieval({ sourceClass: "NASA_SOURCE", humanReviewed: isVerified(alpha.metadata) }),
    ).toBe(true);
  });
});
