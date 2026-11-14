import type { EvidenceChunk } from "@/lib/retrieval/types";

/**
 * Synthetic evidence chunks. Browser-safe (no file access), so the dev-only
 * mock retriever can use them too. Not NASA data.
 */

function chunk(
  overrides: Partial<EvidenceChunk> & Pick<EvidenceChunk, "id" | "section" | "content">,
): EvidenceChunk {
  return {
    conceptId: "investigations/test-investigation-alpha",
    investigationId: "test-investigation-alpha",
    title: "TEST_INVESTIGATION_ALPHA",
    chunkType: "other",
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
    ...overrides,
  };
}

export const TEST_CHUNK_ALPHA_OBJECTIVE = chunk({
  id: "test-investigation-alpha.objective.01",
  section: "Objective",
  chunkType: "objective",
  content: "Synthetic objective text about TEST_FUEL_A flame behaviour in a test chamber.",
  nextChunkId: "test-investigation-alpha.conditions.01",
});

export const TEST_CHUNK_ALPHA_CONDITIONS = chunk({
  id: "test-investigation-alpha.conditions.01",
  section: "Experimental Conditions",
  chunkType: "conditions",
  content: "Synthetic conditions text: oxygen ten to twenty percent, pressure fifty to one hundred kPa.",
  previousChunkId: "test-investigation-alpha.objective.01",
  nextChunkId: "test-investigation-alpha.interpretation.01",
});

export const TEST_CHUNK_ALPHA_INTERPRETATION = chunk({
  id: "test-investigation-alpha.interpretation.01",
  section: "Fire Safety Relevance",
  chunkType: "safety_relevance",
  sourceClass: "TEAM_INTERPRETATION",
  content: "Team interpretation: synthetic interpretation text about smoke sensing. Not a NASA statement.",
  previousChunkId: "test-investigation-alpha.conditions.01",
});

export const TEST_CHUNK_BETA_UNVERIFIED = chunk({
  id: "test-investigation-beta.objective.01",
  conceptId: "investigations/test-investigation-beta",
  investigationId: "test-investigation-beta",
  title: "TEST_INVESTIGATION_BETA",
  section: "Objective",
  chunkType: "objective",
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
