import { describe, expect, it } from "vitest";

import { parseOkfDocument, isInvestigationDocument, toInvestigation } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";

import { FIXTURE_IDS, loadFixtureKnowledge } from "../fixtures";

/**
 * CONTRACT: OKF parser -> Investigation.
 *
 * Ranking, comparison, view models and every screen read this shape. If this
 * test fails you have changed the contract: update docs/data-contract.md, use
 * a `contract:` pull request title and tell the team.
 */
const INVESTIGATION_KEYS: (keyof Investigation)[] = [
  "airflowMax",
  "airflowMin",
  "description",
  "fireSafetyRelevance",
  "fuelType",
  "generated",
  "gravityCondition",
  "gravityValue",
  "hardware",
  "id",
  "keyFindings",
  "limitations",
  "material",
  "measurements",
  "objective",
  "oxygenMax",
  "oxygenMin",
  "platform",
  "pressureMax",
  "pressureMin",
  "program",
  "related",
  "resource",
  "safetyCategories",
  "sampleShape",
  "sampleSize",
  "sensors",
  "shortTitle",
  "sources",
  "status",
  "tags",
  "title",
  "variables",
  "verified",
];

const NULLABLE_SCALARS: (keyof Investigation)[] = [
  "shortTitle",
  "program",
  "description",
  "resource",
  "objective",
  "fireSafetyRelevance",
  "fuelType",
  "material",
  "sampleShape",
  "sampleSize",
  "oxygenMin",
  "oxygenMax",
  "pressureMin",
  "pressureMax",
  "airflowMin",
  "airflowMax",
  "gravityCondition",
  "gravityValue",
  "platform",
];

const LIST_FIELDS: (keyof Investigation)[] = [
  "safetyCategories",
  "hardware",
  "sensors",
  "measurements",
  "variables",
  "keyFindings",
  "limitations",
  "tags",
  "sources",
  "related",
  "verified",
];

describe("contract: parser -> Investigation", () => {
  const { investigations, issues } = loadFixtureKnowledge();
  const byId = new Map(investigations.map((investigation) => [investigation.id, investigation]));

  it("loads every valid fixture without issues", () => {
    expect(issues).toEqual([]);
    expect([...byId.keys()].sort()).toEqual(Object.values(FIXTURE_IDS).sort());
  });

  it("gives every investigation exactly the agreed set of fields", () => {
    for (const investigation of investigations) {
      expect(Object.keys(investigation).sort()).toEqual([...INVESTIGATION_KEYS].sort());
    }
  });

  it("uses null for anything unstated and [] for empty lists, never undefined", () => {
    const minimal = parseOkfDocument(
      "---\ntype: Investigation\ntitle: TEST_MINIMAL\n---\n",
      "test-minimal.md",
    );
    if (!minimal.ok || !isInvestigationDocument(minimal.document))
      throw new Error("expected an Investigation");
    const investigation = toInvestigation(minimal.document);

    for (const key of NULLABLE_SCALARS) expect(investigation[key], key).toBeNull();
    for (const key of LIST_FIELDS) expect(investigation[key], key).toEqual([]);
    expect(investigation.generated).toBeNull();
    expect(investigation.status).toBe("draft");
    expect(Object.values(investigation)).not.toContain(undefined);
  });

  it("is plain JSON, so it can cross the server/client boundary", () => {
    for (const investigation of investigations) {
      expect(JSON.parse(JSON.stringify(investigation))).toEqual(investigation);
    }
  });

  it("maps the complete fixture field by field", () => {
    expect(byId.get(FIXTURE_IDS.alpha)).toMatchObject({
      title: "TEST_INVESTIGATION_ALPHA",
      shortTitle: "TEST ALPHA",
      status: "stable",
      safetyCategories: ["prevention", "detection"],
      fuelType: "TEST_FUEL_A",
      oxygenMin: 10,
      oxygenMax: 20,
      pressureMin: 50,
      pressureMax: 100,
      airflowMin: 0.1,
      airflowMax: 0.5,
      gravityCondition: "microgravity",
      gravityValue: 0,
      hardware: ["TEST_RIG_ONE"],
      keyFindings: ["Synthetic finding one for ALPHA", "Synthetic finding two for ALPHA"],
      limitations: ["Synthetic limitation one for ALPHA"],
      resource: "https://test.invalid/alpha",
    });
    expect(byId.get(FIXTURE_IDS.alpha)?.related).toEqual([
      { id: "hardware/test-rig-one", relation: null, note: null },
      {
        id: "investigations/test-investigation-gamma",
        relation: "shares-hardware",
        note: "Synthetic link for tests",
      },
    ]);
  });

  it("keeps unknown conditions unknown and accepts a single hardware name", () => {
    const beta = byId.get(FIXTURE_IDS.beta);
    expect(beta).toMatchObject({
      oxygenMin: null,
      pressureMax: null,
      gravityValue: null,
      material: null,
      hardware: [],
    });
    expect(byId.get(FIXTURE_IDS.gamma)).toMatchObject({
      hardware: ["TEST_RIG_ONE"],
      pressureMin: 100,
      pressureMax: null,
    });
  });
});
