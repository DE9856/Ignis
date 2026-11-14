import type { ChunkMetadata, EvidenceChunk } from "@/lib/retrieval/types";

/**
 * Synthetic evidence chunks. Browser-safe (no file access), so the dev-only
 * mock retriever can use them too. Not NASA data.
 */

/** Record facts left unknown, as a curator would leave them: null, never estimated. */
export const TEST_EMPTY_METADATA: ChunkMetadata = {
  shortTitle: null,
  program: null,
  platform: null,
  hardware: [],
  sensors: [],
  measurements: [],
  variables: [],
  sampleShape: null,
  sampleSize: null,
  oxygenMin: null,
  oxygenMax: null,
  pressureMin: null,
  pressureMax: null,
  airflowMin: null,
  airflowMax: null,
  gravityValue: null,
  sources: [],
  related: [],
  searchNames: [],
};

function chunk(
  overrides: Partial<EvidenceChunk> & Pick<EvidenceChunk, "id" | "section" | "content">,
): EvidenceChunk {
  return {
    conceptId: "investigations/test-investigation-alpha",
    investigationId: "test-investigation-alpha",
    investigation: "TEST_INVESTIGATION_ALPHA",
    title: "TEST_INVESTIGATION_ALPHA",
    chunkType: "OBJECTIVE",
    chunkIndex: 0,
    tags: ["synthetic"],
    safetyCategories: ["prevention"],
    fuelType: "TEST_FUEL_A",
    material: "TEST_MATERIAL_A",
    gravityCondition: "microgravity",
    sourceClass: "NASA_SOURCE",
    sourceUrl: "https://test.invalid/alpha",
    verificationStatus: "verified",
    previousChunkId: null,
    nextChunkId: null,
    embeddingVersion: "test-embedding/test-chunker",
    metadata: TEST_EMPTY_METADATA,
    ...overrides,
  };
}

export const TEST_CHUNK_ALPHA_OBJECTIVE = chunk({
  id: "test-investigation-alpha.objective.01",
  section: "Objective",
  chunkType: "OBJECTIVE",
  content: "Synthetic objective text about TEST_FUEL_A flame behaviour in a test chamber.",
  nextChunkId: "test-investigation-alpha.conditions.01",
});

export const TEST_CHUNK_ALPHA_CONDITIONS = chunk({
  id: "test-investigation-alpha.conditions.01",
  section: "Experimental Conditions",
  chunkType: "CONDITIONS",
  chunkIndex: 1,
  content: "Synthetic conditions text: oxygen ten to twenty percent, pressure fifty to one hundred kPa.",
  previousChunkId: "test-investigation-alpha.objective.01",
  nextChunkId: "test-investigation-alpha.interpretation.01",
});

export const TEST_CHUNK_ALPHA_INTERPRETATION = chunk({
  id: "test-investigation-alpha.interpretation.01",
  section: "Fire Safety Relevance",
  chunkType: "INTERPRETATION",
  chunkIndex: 2,
  sourceClass: "TEAM_INTERPRETATION",
  content: "Team interpretation: synthetic interpretation text about smoke sensing. Not a NASA statement.",
  previousChunkId: "test-investigation-alpha.conditions.01",
});

export const TEST_CHUNK_BETA_UNVERIFIED = chunk({
  id: "test-investigation-beta.objective.01",
  conceptId: "investigations/test-investigation-beta",
  investigationId: "test-investigation-beta",
  investigation: "TEST_INVESTIGATION_BETA",
  title: "TEST_INVESTIGATION_BETA",
  section: "Objective",
  chunkType: "OBJECTIVE",
  safetyCategories: ["suppression"],
  fuelType: "TEST_FUEL_B",
  material: null,
  gravityCondition: null,
  sourceUrl: null,
  verificationStatus: "unverified",
  content: "Synthetic unverified objective text about extinguishing TEST_FUEL_B.",
});

export const TEST_CHUNKS: EvidenceChunk[] = [
  TEST_CHUNK_ALPHA_OBJECTIVE,
  TEST_CHUNK_ALPHA_CONDITIONS,
  TEST_CHUNK_ALPHA_INTERPRETATION,
  TEST_CHUNK_BETA_UNVERIFIED,
];
