import { isVerified, toInvestigation, type InvestigationDocument } from "@/lib/okf/parser";
import type { GravityCondition, OkfSection, SafetyObjective } from "@/lib/okf/types";

import type { ChunkMetadata } from "./types";

/**
 * The narrow view of a record that the chunker needs.
 *
 * This is the only place that knows the shape of the parser's output. When
 * the OKF contract changes (snake_case keys, `status: stable`, new sections),
 * this function changes and the chunker does not.
 */
export interface ChunkableDocument {
  recordId: string;
  conceptId: string;
  title: string;
  investigation: string;
  /** Verified by a second person. Only trusted records are chunked. */
  trusted: boolean;
  filePath: string;
  sections: OkfSection[];
  tags: string[];
  safetyCategories: SafetyObjective[];
  fuelType: string | null;
  material: string | null;
  gravityCondition: GravityCondition | null;
  sourceUrl: string | null;
  metadata: ChunkMetadata;
}

function unique(values: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

/** Top-level `resource` arrives with the contract change (decision D4). Read it if present. */
function topLevelResource(metadata: object): string | null {
  const value = (metadata as { resource?: unknown }).resource;
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function fromInvestigationDocument(document: InvestigationDocument): ChunkableDocument {
  const record = toInvestigation(document);
  const { metadata } = document;

  const nasaSource = record.sources.find((source) => source.sourceClass === "NASA_SOURCE");
  const sourceUrl = topLevelResource(metadata) ?? nasaSource?.resource ?? record.sources[0]?.resource ?? null;
  const investigation = record.shortTitle ?? record.title;

  return {
    recordId: record.id,
    conceptId: `investigations/${record.id}`,
    title: record.title,
    investigation,
    trusted: isVerified(record),
    filePath: document.filePath,
    sections: document.sections,
    tags: record.tags,
    safetyCategories: record.safetyCategories,
    fuelType: record.fuelType,
    material: record.material,
    gravityCondition: record.gravityCondition,
    sourceUrl,
    metadata: {
      shortTitle: record.shortTitle,
      program: record.program,
      platform: record.platform,
      hardware: record.hardware,
      sensors: record.sensors,
      measurements: record.measurements,
      variables: record.variables,
      sampleShape: record.sampleShape,
      sampleSize: record.sampleSize,
      oxygenMin: record.oxygenMin,
      oxygenMax: record.oxygenMax,
      pressureMin: record.pressureMin,
      pressureMax: record.pressureMax,
      airflowMin: record.airflowMin,
      airflowMax: record.airflowMax,
      gravityValue: record.gravityValue,
      sources: record.sources,
      related: record.related.map((link) => link.id),
      searchNames: unique([
        record.title,
        record.shortTitle,
        record.id,
        record.program,
        record.platform,
        ...record.hardware,
      ]),
    },
  };
}
