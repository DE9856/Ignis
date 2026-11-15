import { describe, expect, it } from "vitest";

import { buildControlAreas } from "@/lib/integration/controls";
import { EXPORT_COLUMNS, toCsv, toExportDocument, toExportRecords } from "@/lib/integration/export";
import { toMissionPresets } from "@/lib/integration/missions";
import { isPartialGravityScenario, scenarioQuestion } from "@/lib/integration/scenario";
import { loadKnowledgeBase } from "@/lib/okf/loader";
import { missionFieldsSchema } from "@/lib/okf/schema";
import { chunkDocuments } from "@/lib/retrieval/chunker";
import { blocksSynthesis, classifyBoundary } from "@/lib/retrieval/guard";
import { analyzeQuery, buildVocabulary } from "@/lib/retrieval/query-analysis";

import { makeInvestigation, makeScenario } from "../helpers";
import { SYNTHETIC_CORPUS, syntheticDocument } from "../retrieval/fixtures";

const knowledge = loadKnowledgeBase();

describe("mission presets", () => {
  const presets = toMissionPresets(knowledge.missions);

  it("loads every preset record in knowledge/missions", () => {
    expect(presets.map((preset) => preset.id).sort()).toEqual(
      knowledge.missions.map((document) => document.id).sort(),
    );
    expect(presets.length).toBeGreaterThan(0);
  });

  it("gives every stated value a basis and leaves unstated values null", () => {
    for (const preset of presets) {
      for (const key of ["oxygenPercent", "pressureKPa", "gravityG", "airflowMetersPerSecond"] as const) {
        expect(preset.valueBasis[key] !== undefined, `${preset.id}.${key}`).toBe(preset[key] !== null);
      }
      expect(preset.sources.length, preset.id).toBeGreaterThan(0);
    }
  });

  it("sorts by gravity: orbit first, Mars last", () => {
    const gravities = presets.map((preset) => preset.gravityG ?? Infinity);
    expect([...gravities].sort((a, b) => a - b)).toEqual(gravities);
  });

  it("rejects a value with no basis, and a basis with no value", () => {
    expect(missionFieldsSchema.safeParse({ oxygenPercent: 30 }).success).toBe(false);
    expect(missionFieldsSchema.safeParse({ valueBasis: { oxygenPercent: "nasa_source" } }).success).toBe(
      false,
    );
    expect(
      missionFieldsSchema.safeParse({ oxygenPercent: 30, valueBasis: { oxygenPercent: "nasa_source" } })
        .success,
    ).toBe(true);
  });

  it("rejects a misspelt preset field", () => {
    expect(missionFieldsSchema.safeParse({ oxygen: 30 }).success).toBe(false);
  });
});

describe("condition export", () => {
  const reviewed = makeInvestigation({
    id: "reviewed",
    title: 'Title with "quotes", commas',
    oxygenMin: 21,
    oxygenMax: null,
    sensors: ["a", "b"],
    status: "stable",
    verified: [{ by: "human:reviewer", at: "2026-11-15", note: null }],
  });
  const draft = makeInvestigation({ id: "draft", status: "draft" });

  it("exports human-reviewed records only", () => {
    expect(toExportRecords([draft, reviewed]).map((record) => record.id)).toEqual(["reviewed"]);
  });

  it("keeps nulls as empty cells and escapes text", () => {
    const [header, row] = toCsv(toExportRecords([reviewed]))
      .trimEnd()
      .split("\r\n");
    expect(header.split(",")).toEqual(EXPORT_COLUMNS);
    expect(row).toContain('"Title with ""quotes"", commas"');
    expect(row).toContain(",21,,");
    expect(row).toContain('"a; b"');
  });

  it("neutralises spreadsheet formulas", () => {
    const formula = { ...reviewed, material: "=HYPERLINK()" };
    expect(toCsv(toExportRecords([formula]))).toContain(`"'=HYPERLINK()"`);
  });

  it("states units and what null means", () => {
    const document = toExportDocument(knowledge.investigations);
    expect(document.units.pressure).toMatch(/kPa/);
    expect(document.nullMeans).toMatch(/Never an estimate/);
    expect(document.count).toBe(document.records.length);
  });
});

describe("scenario question for the Evidence Desk", () => {
  const catalog = chunkDocuments(SYNTHETIC_CORPUS.map(syntheticDocument)).chunks;
  const vocabulary = buildVocabulary(catalog);

  it("is null for an empty scenario", () => {
    expect(scenarioQuestion(makeScenario())).toBeNull();
  });

  it("is never refused by the retrieval guard for any preset", () => {
    for (const preset of toMissionPresets(knowledge.missions)) {
      const question = scenarioQuestion(preset);
      expect(question, preset.id).not.toBeNull();
      const notice = classifyBoundary(question!, analyzeQuery(question!, vocabulary), catalog);
      expect(blocksSynthesis(notice), `${preset.id}: ${question} -> ${notice?.kind}`).toBe(false);
    }
  });

  it("words the atmosphere relative to Earth air and always asks about microgravity", () => {
    expect(scenarioQuestion(makeScenario({ oxygenPercent: 32, pressureKPa: 55.2, gravityG: 0.165 }))).toBe(
      "How do elevated oxygen and reduced pressure affect flammability and flame spread in microgravity?",
    );
    expect(scenarioQuestion(makeScenario({ oxygenPercent: 21, pressureKPa: 101.4, gravityG: 0 }))).toBe(
      "What does the reviewed evidence report about flammability and flame spread in microgravity?",
    );
  });

  it("includes material and objective", () => {
    expect(
      scenarioQuestion(makeScenario({ material: "cotton", safetyObjective: "detection", oxygenPercent: 30 })),
    ).toBe("How does elevated oxygen affect smoke and fire detection for cotton in microgravity?");
  });

  it("flags partial gravity with the same thresholds as the scorer", () => {
    expect(isPartialGravityScenario(makeScenario({ gravityG: 0.165 }))).toBe(true);
    expect(isPartialGravityScenario(makeScenario({ gravityG: 0 }))).toBe(false);
    expect(isPartialGravityScenario(makeScenario({ gravityG: 1 }))).toBe(false);
  });
});

describe("controls and equipment view", () => {
  const areas = buildControlAreas(knowledge);

  it("has statements from each concept record and links only reviewed investigations", () => {
    expect(areas.length).toBeGreaterThan(0);
    const reviewed = new Set(
      knowledge.investigations
        .filter((investigation) => investigation.status === "stable" && investigation.verified.length > 0)
        .map((investigation) => investigation.id),
    );
    for (const area of areas) {
      expect(area.statements.length, area.id).toBeGreaterThan(0);
      for (const investigation of area.investigations) expect(reviewed.has(investigation.id)).toBe(true);
    }
  });
});
