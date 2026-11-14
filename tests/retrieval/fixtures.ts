import { isInvestigationDocument, parseOkfDocument } from "@/lib/okf/parser";
import { DOCUMENT_STATUSES } from "@/lib/okf/types";
import { fromInvestigationDocument, type ChunkableDocument } from "@/lib/retrieval/adapter";

/**
 * TEST FIXTURES ONLY. Every record below is invented to exercise code paths.
 * None of it describes a real NASA investigation, and the numbers are chosen
 * to look obviously artificial.
 */

/** `verified` today; `stable` once the contract pull request lands (workflow decision D2). */
export const TRUSTED_STATUS = (DOCUMENT_STATUSES as readonly string[]).includes("stable")
  ? "stable"
  : "verified";

export interface SyntheticRecord {
  id: string;
  title: string;
  shortTitle?: string;
  trusted?: boolean;
  safety?: string[];
  material?: string;
  fuel?: string;
  gravity?: string;
  gravityValue?: number;
  oxygen?: [number, number];
  hardware?: string[];
  platform?: string;
  body: string;
}

function yamlList(values: string[]): string {
  return values.length === 0 ? "[]" : `\n${values.map((value) => `  - ${value}`).join("\n")}`;
}

export function syntheticMarkdown(record: SyntheticRecord): string {
  const trusted = record.trusted ?? true;
  const lines = [
    "---",
    "type: Investigation",
    `title: ${record.title}`,
    record.shortTitle ? `shortTitle: ${record.shortTitle}` : null,
    `status: ${trusted ? TRUSTED_STATUS : "draft"}`,
    `safetyCategories: ${yamlList(record.safety ?? [])}`,
    record.material ? `material: ${record.material}` : null,
    record.fuel ? `fuelType: ${record.fuel}` : null,
    record.gravity ? `gravityCondition: ${record.gravity}` : null,
    record.gravityValue !== undefined ? `gravityValue: ${record.gravityValue}` : null,
    record.oxygen ? `oxygenMin: ${record.oxygen[0]}\noxygenMax: ${record.oxygen[1]}` : null,
    record.platform ? `platform: ${record.platform}` : null,
    `hardware: ${yamlList(record.hardware ?? [])}`,
    "tags:\n  - synthetic",
    "sources:",
    "  - id: fixture",
    `    resource: https://example.com/${record.id}`,
    "    sourceClass: NASA_SOURCE",
    "generated:\n  by: human:test-author",
    trusted ? "verified:\n  - by: human:test-reviewer\n    at: 2026-01-02" : "verified: []",
    "---",
    "",
    record.body,
  ];
  return lines.filter((line) => line !== null).join("\n");
}

export function syntheticDocument(record: SyntheticRecord): ChunkableDocument {
  const result = parseOkfDocument(syntheticMarkdown(record), `knowledge/investigations/${record.id}.md`);
  if (!result.ok) throw new Error(`Fixture ${record.id} failed to parse: ${JSON.stringify(result.issues)}`);
  if (!isInvestigationDocument(result.document)) throw new Error("expected an Investigation");
  return fromInvestigationDocument(result.document);
}

/** A small synthetic corpus: one record per safety role, plus a draft that must never be indexed. */
export const SYNTHETIC_CORPUS: SyntheticRecord[] = [
  {
    id: "synth-alpha",
    title: "Synthetic Rig Alpha",
    shortTitle: "ALPHA-1",
    safety: ["prevention"],
    material: "testcloth",
    fuel: "solid",
    gravity: "microgravity",
    oxygen: [1, 2],
    hardware: ["Bench Zeta"],
    body: [
      "# Objective",
      "",
      "SYNTHETIC FIXTURE. Observe how a flame front crawls across testcloth strips in a quiet chamber.",
      "",
      "# Experimental Conditions",
      "",
      "SYNTHETIC FIXTURE. The strips sat in a gentle forced draft inside Bench Zeta.",
      "",
      "# Key Findings",
      "",
      "- SYNTHETIC FIXTURE. The flame front crawled slower when the draft stopped.",
      "- SYNTHETIC FIXTURE. Testcloth charred before the glow spread.",
      "",
      "# Fire Safety Relevance",
      "",
      "Team interpretation: SYNTHETIC FIXTURE. Draft control may matter for crew cabins.",
      "",
      "# Limitations",
      "",
      "- SYNTHETIC FIXTURE. Only one cloth was tried.",
      "",
      "# Source Notes",
      "",
      "SYNTHETIC FIXTURE. Not a real source.",
    ].join("\n"),
  },
  {
    id: "synth-beta",
    title: "Synthetic Rig Beta",
    shortTitle: "BETA-2",
    safety: ["detection"],
    gravity: "microgravity",
    hardware: ["Bench Omega"],
    body: [
      "# Objective",
      "",
      "SYNTHETIC FIXTURE. Characterise smoke particles from heated wires so detectors can notice them early.",
      "",
      "# Sensors and Measurements",
      "",
      "SYNTHETIC FIXTURE. A particle counter and a light-scatter detector sampled the smoke.",
      "",
      "# Key Findings",
      "",
      "- SYNTHETIC FIXTURE. Smoke particles grew larger than the detector expected.",
    ].join("\n"),
  },
  {
    id: "synth-gamma",
    title: "Synthetic Rig Gamma",
    shortTitle: "GAMMA-3",
    safety: ["suppression"],
    fuel: "liquid",
    gravity: "normal_gravity",
    body: [
      "# Objective",
      "",
      "SYNTHETIC FIXTURE. Find out whether a fine mist puts out droplet flames.",
      "",
      "# Key Findings",
      "",
      "- SYNTHETIC FIXTURE. The mist extinguished small droplet flames.",
      "",
      "# Limitations",
      "",
      "- SYNTHETIC FIXTURE. Tested only on the ground.",
    ].join("\n"),
  },
  {
    id: "synth-draft",
    title: "Synthetic Draft Record",
    trusted: false,
    safety: ["detection"],
    body: "# Objective\n\nSYNTHETIC FIXTURE. Smoke smoke smoke detectors. This draft must never be indexed.",
  },
];
