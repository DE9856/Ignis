import type { Embedder } from "@/lib/embeddings";
import { withTimeout } from "@/lib/embeddings";
import type { SafetyObjective } from "@/lib/okf/types";

import { sameSplitSection } from "./chunker";
import { FACET_WEIGHTS, RETRIEVAL } from "./config";
import { blocksSynthesis, classifyBoundary } from "./guard";
import { BOUNDARY_MESSAGES, RETRIEVAL_NOTICES } from "./messages";
import { analyzeQuery, buildVocabulary, isCommonTerm, type CorpusVocabulary } from "./query-analysis";
import type { CandidateScore, EvidenceStore } from "./store";
import { termCounts, tsqueryTerms } from "./text";
import type {
  BoundaryNotice,
  EvidenceChunk,
  EvidenceListing,
  EvidenceRetriever,
  MetadataFacet,
  MetadataMatch,
  QueryUnderstanding,
  RetrievalFilters,
  RetrievalMode,
  RetrievalQuery,
  RetrievalResponse,
  RetrievedEvidence,
} from "./types";

/**
 * Hybrid retrieval (Member 5 brief, Parts C and D).
 *
 *   question -> understanding (rules) -> boundary guard
 *   -> query embedding (optional) -> vector + lexical candidates from the store
 *   -> metadata score -> weighted fusion -> filters, diversity caps
 *   -> list questions answered from metadata -> neighbour expansion
 *   -> support check -> response with every score component
 *
 * Fusion, metadata scoring and explanations live here, in plain TypeScript,
 * so they are tested without a database and shared by every store.
 */

export interface HybridRetrieverOptions {
  store: EvidenceStore;
  /** Query embedder. Null means lexical + metadata only. */
  embedder?: Embedder | null;
  /** Abandon query embedding after this long and fall back to lexical search. */
  embeddingTimeoutMs?: number;
  /** Shown when the store is the local fallback rather than Supabase. */
  storeNotice?: string | null;
}

interface Scored {
  chunk: EvidenceChunk;
  vector: number | null;
  lexical: number | null;
  metadata: number | null;
  fused: number;
  matchedTerms: string[];
  matchedMetadata: MetadataMatch[];
  supported: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function scaleVector(similarity: number): number {
  const { low, high } = RETRIEVAL.vectorScale;
  return clamp01((similarity - low) / (high - low));
}

function lowerSet(values: (string | null)[]): Set<string> {
  return new Set(
    values.filter((value): value is string => Boolean(value)).map((value) => value.toLowerCase()),
  );
}

/** Which detected facets a chunk matches, with a reason a reader can follow. */
function metadataMatches(chunk: EvidenceChunk, understanding: QueryUnderstanding): MetadataMatch[] {
  const matches: MetadataMatch[] = [];
  if (chunk.investigationId && understanding.investigations.includes(chunk.investigationId)) {
    matches.push({
      facet: "investigation",
      value: chunk.investigation,
      because: `The question names ${chunk.investigation}.`,
    });
  }
  if (understanding.sectionIntent.includes(chunk.chunkType)) {
    matches.push({
      facet: "section",
      value: chunk.section,
      because: `The question asks about ${chunk.chunkType.toLowerCase()} information.`,
    });
  }
  for (const category of understanding.safetyCategories) {
    if (chunk.safetyCategories.includes(category)) {
      matches.push({
        facet: "safety",
        value: category,
        because: `Record safety category includes ${category}.`,
      });
    }
  }
  if (chunk.gravityCondition && understanding.gravity.includes(chunk.gravityCondition)) {
    matches.push({
      facet: "gravity",
      value: chunk.gravityCondition,
      because: `Record gravity condition is ${chunk.gravityCondition.replace("_", " ")}.`,
    });
  }
  const material = chunk.material?.toLowerCase();
  if (material && understanding.materials.some((value) => value.toLowerCase() === material)) {
    matches.push({
      facet: "material",
      value: chunk.material as string,
      because: `Record material is ${chunk.material}.`,
    });
  }
  const fuel = chunk.fuelType?.toLowerCase();
  if (fuel && understanding.fuels.some((value) => value.toLowerCase() === fuel)) {
    matches.push({
      facet: "fuel",
      value: chunk.fuelType as string,
      because: `Record fuel type is ${chunk.fuelType}.`,
    });
  }
  const equipment = lowerSet([chunk.metadata.platform, ...chunk.metadata.hardware]);
  for (const item of understanding.hardware) {
    if (equipment.has(item.toLowerCase())) {
      matches.push({
        facet: "hardware",
        value: item,
        because: `Record lists ${item} as platform or hardware.`,
      });
    }
  }
  return matches;
}

function detectedFacets(understanding: QueryUnderstanding): MetadataFacet[] {
  const facets: MetadataFacet[] = [];
  if (understanding.investigations.length > 0) facets.push("investigation");
  if (understanding.sectionIntent.length > 0) facets.push("section");
  if (understanding.safetyCategories.length > 0) facets.push("safety");
  if (understanding.gravity.length > 0) facets.push("gravity");
  if (understanding.materials.length > 0) facets.push("material");
  if (understanding.fuels.length > 0) facets.push("fuel");
  if (understanding.hardware.length > 0) facets.push("hardware");
  return facets;
}

function metadataScore(matches: MetadataMatch[], facets: MetadataFacet[]): number | null {
  if (facets.length === 0) return null;
  const total = facets.reduce((sum, facet) => sum + FACET_WEIGHTS[facet], 0);
  const matched = new Set(matches.map((match) => match.facet));
  const earned = facets
    .filter((facet) => matched.has(facet))
    .reduce((sum, facet) => sum + FACET_WEIGHTS[facet], 0);
  return earned / total;
}

/** Query terms present in the chunk's searchable text. */
function matchedTerms(chunk: EvidenceChunk, queryTerms: string[]): string[] {
  const counts = termCounts(
    [
      chunk.content,
      chunk.section,
      chunk.investigation,
      chunk.title,
      ...chunk.metadata.searchNames,
      ...chunk.tags,
    ].join(" "),
  );
  return queryTerms.filter((term) => counts.has(term));
}

function passesFilters(chunk: EvidenceChunk, filters: RetrievalFilters | undefined): boolean {
  if (!filters) return true;
  if (
    filters.safetyCategories?.length &&
    !filters.safetyCategories.some((value) => chunk.safetyCategories.includes(value))
  ) {
    return false;
  }
  if (filters.investigationIds?.length && !filters.investigationIds.includes(chunk.investigationId ?? ""))
    return false;
  if (filters.chunkTypes?.length && !filters.chunkTypes.includes(chunk.chunkType)) return false;
  if (filters.gravityCondition && chunk.gravityCondition !== filters.gravityCondition) return false;
  if (filters.material && chunk.material?.toLowerCase() !== filters.material.toLowerCase()) return false;
  if (filters.fuelType && chunk.fuelType?.toLowerCase() !== filters.fuelType.toLowerCase()) return false;
  return true;
}

/** The facet a list question filters on, most specific first. */
function listingFacet(understanding: QueryUnderstanding): { facet: MetadataFacet; value: string } | null {
  if (understanding.hardware[0]) return { facet: "hardware", value: understanding.hardware[0] };
  if (understanding.materials[0]) return { facet: "material", value: understanding.materials[0] };
  if (understanding.fuels[0]) return { facet: "fuel", value: understanding.fuels[0] };
  if (understanding.safetyCategories.length === 1)
    return { facet: "safety", value: understanding.safetyCategories[0] };
  if (understanding.gravity.length === 1) return { facet: "gravity", value: understanding.gravity[0] };
  return null;
}

function chunkHasFacet(chunk: EvidenceChunk, facet: MetadataFacet, value: string): boolean {
  const lower = value.toLowerCase();
  switch (facet) {
    case "safety":
      return chunk.safetyCategories.includes(value as SafetyObjective);
    case "gravity":
      return chunk.gravityCondition === value;
    case "material":
      return chunk.material?.toLowerCase() === lower;
    case "fuel":
      return chunk.fuelType?.toLowerCase() === lower;
    case "hardware":
      return lowerSet([chunk.metadata.platform, ...chunk.metadata.hardware]).has(lower);
    default:
      return false;
  }
}

const FACET_DESCRIPTIONS: Record<MetadataFacet, (value: string) => string> = {
  safety: (value) => `safety category includes ${value}`,
  gravity: (value) => `gravity condition is ${value.replace("_", " ")}`,
  material: (value) => `material is ${value}`,
  fuel: (value) => `fuel type is ${value}`,
  hardware: (value) => `platform or hardware includes ${value}`,
  investigation: (value) => `investigation is ${value}`,
  section: (value) => `section is ${value}`,
};

function compareScored(a: Scored, b: Scored): number {
  return b.fused - a.fused || a.chunk.id.localeCompare(b.chunk.id);
}

export function createHybridRetriever(options: HybridRetrieverOptions): EvidenceRetriever {
  const { store } = options;
  let vocabularyCache: { catalog: EvidenceChunk[]; vocabulary: CorpusVocabulary } | null = null;

  function vocabularyFor(catalog: EvidenceChunk[]): CorpusVocabulary {
    if (vocabularyCache?.catalog !== catalog)
      vocabularyCache = { catalog, vocabulary: buildVocabulary(catalog) };
    return vocabularyCache.vocabulary;
  }

  async function embedQuery(text: string, notices: string[]): Promise<number[] | null> {
    const embedder = options.embedder;
    if (!embedder) return null;
    const indexed = await store.indexedEmbeddingVersion();
    if (indexed === null) return null;
    if (indexed !== embedder.version) {
      notices.push(RETRIEVAL_NOTICES.staleIndex);
      return null;
    }
    try {
      const [vector] = await withTimeout(
        embedder.embed([text], "query"),
        options.embeddingTimeoutMs ?? 20_000,
        "Query embedding",
      );
      return vector;
    } catch {
      notices.push(RETRIEVAL_NOTICES.lexicalOnly);
      return null;
    }
  }

  return {
    async search(query: RetrievalQuery): Promise<RetrievalResponse> {
      const text = query.text.trim().slice(0, RETRIEVAL.maxQueryChars);
      const limit = Math.max(1, Math.min(query.limit ?? RETRIEVAL.defaultResults, RETRIEVAL.maxResults));
      const notices: string[] = options.storeNotice ? [options.storeNotice] : [];

      let catalog: EvidenceChunk[];
      try {
        catalog = await store.loadCatalog();
      } catch (error) {
        return {
          status: "unavailable",
          reason: `The evidence index could not be read: ${(error as Error).message}`,
        };
      }

      const vocabulary = vocabularyFor(catalog);
      const understanding = analyzeQuery(text, vocabulary);
      const empty = (boundary: BoundaryNotice | null, extra: string[] = []): RetrievalResponse => ({
        status: "ok",
        mode: "lexical_only",
        results: [],
        boundary,
        listing: null,
        understanding,
        notice: [...notices, ...extra].join(" ") || null,
      });

      if (text.length === 0) return empty(null);
      let boundary = classifyBoundary(text, understanding, catalog);
      if (catalog.length === 0) {
        // Nothing verified is indexed, so nothing can establish an answer. Guard notices still take priority.
        return empty(
          boundary ?? {
            kind: "INSUFFICIENT_EVIDENCE",
            message: BOUNDARY_MESSAGES.INSUFFICIENT_EVIDENCE,
            details: [RETRIEVAL_NOTICES.emptyIndex],
          },
          [RETRIEVAL_NOTICES.emptyIndex],
        );
      }
      const embedding = await embedQuery(text, notices);
      const mode: RetrievalMode = embedding ? "hybrid" : "lexical_only";

      let candidates: CandidateScore[];
      try {
        candidates = await store.scoreCandidates({
          terms: understanding.terms,
          tsTerms: tsqueryTerms(text),
          embedding,
          limit: RETRIEVAL.candidatesPerSignal,
        });
      } catch (error) {
        return { status: "unavailable", reason: `Evidence search failed: ${(error as Error).message}` };
      }

      const byId = new Map(catalog.map((chunk) => [chunk.id, chunk]));
      const facets = detectedFacets(understanding);
      const maxLexical = Math.max(0, ...candidates.map((candidate) => candidate.lexical ?? 0));
      const weights = {
        vector: embedding ? RETRIEVAL.weights.vector : 0,
        lexical: RETRIEVAL.weights.lexical,
        metadata: facets.length > 0 ? RETRIEVAL.weights.metadata : 0,
      };
      const weightTotal = weights.vector + weights.lexical + weights.metadata;
      const distinctive = understanding.terms.filter(
        (term) => !isCommonTerm(term, vocabulary, RETRIEVAL.commonTermShare),
      );

      const score = (chunk: EvidenceChunk, candidate: CandidateScore | undefined): Scored => {
        const matches = metadataMatches(chunk, understanding);
        const metadata = metadataScore(matches, facets);
        const lexical = candidate?.lexical != null && maxLexical > 0 ? candidate.lexical / maxLexical : null;
        const vector = candidate?.vector ?? null;
        const fused =
          ((vector === null ? 0 : scaleVector(vector)) * weights.vector +
            (lexical ?? 0) * weights.lexical +
            (metadata ?? 0) * weights.metadata) /
          weightTotal;
        const terms = matchedTerms(chunk, understanding.terms);
        // Lexical support needs a fair share of the question's distinctive terms, not one stray word:
        // "Which football team won the cup last year?" shares only "last" with an ACME passage.
        const distinctiveMatched = terms.filter((term) => distinctive.includes(term)).length;
        const supported =
          (distinctiveMatched > 0 &&
            distinctiveMatched >= Math.ceil(distinctive.length * RETRIEVAL.minDistinctiveShare)) ||
          // One rare word is enough when the passage is also close in meaning ("ventilation stops" vs "fan off").
          (distinctiveMatched > 0 && vector !== null && vector >= RETRIEVAL.vectorWithKeywordFloor) ||
          matches.some((match) => match.facet !== "section") ||
          (vector !== null && vector >= RETRIEVAL.vectorSupportFloor);
        return {
          chunk,
          vector,
          lexical,
          metadata,
          fused,
          matchedTerms: terms,
          matchedMetadata: matches,
          supported,
        };
      };

      // Candidates from search, plus chunks that match a detected facet strongly enough to deserve a look.
      const pool = new Map<string, Scored>();
      for (const candidate of candidates) {
        const chunk = byId.get(candidate.chunkId);
        if (chunk) pool.set(chunk.id, score(chunk, candidate));
      }
      for (const chunk of catalog) {
        if (pool.has(chunk.id)) continue;
        const scored = score(chunk, undefined);
        if (scored.matchedMetadata.some((match) => match.facet !== "section")) pool.set(chunk.id, scored);
      }

      let ranked = [...pool.values()]
        .filter((item) => passesFilters(item.chunk, query.filters))
        .sort(compareScored);
      const anySupport = ranked.some((item) => item.supported);
      ranked = ranked.filter((item) => item.supported);

      // List questions: one best chunk for every investigation matching the facet, from metadata, not top-k.
      let listing: EvidenceListing | null = null;
      const facet = understanding.enumerative ? listingFacet(understanding) : null;
      let selected: Scored[] = [];
      if (facet) {
        const best = new Map<string, Scored>();
        for (const chunk of catalog) {
          if (!chunk.investigationId || !chunkHasFacet(chunk, facet.facet, facet.value)) continue;
          if (!passesFilters(chunk, query.filters)) continue;
          const scored = pool.get(chunk.id) ?? score(chunk, undefined);
          const current = best.get(chunk.investigationId);
          if (!current || compareScored(scored, current) < 0) best.set(chunk.investigationId, scored);
        }
        selected = [...best.values()].sort(compareScored).slice(0, RETRIEVAL.maxResults);
        listing = {
          facet: facet.facet,
          value: facet.value,
          description: FACET_DESCRIPTIONS[facet.facet](facet.value),
          investigationIds: selected.map((item) => item.chunk.investigationId as string),
        };
      }

      if (!listing) {
        const named = new Set(understanding.investigations);
        const perInvestigation = new Map<string, number>();
        let interpretation = 0;
        const interpretationCap = understanding.sectionIntent.includes("INTERPRETATION")
          ? limit
          : RETRIEVAL.maxInterpretation;
        for (const item of ranked) {
          if (selected.length >= limit) break;
          const id = item.chunk.investigationId ?? item.chunk.id;
          const cap = named.has(id) ? limit : RETRIEVAL.maxPerInvestigation;
          if ((perInvestigation.get(id) ?? 0) >= cap) continue;
          if (item.chunk.chunkType === "INTERPRETATION" && interpretation >= interpretationCap) continue;
          perInvestigation.set(id, (perInvestigation.get(id) ?? 0) + 1);
          if (item.chunk.chunkType === "INTERPRETATION") interpretation += 1;
          selected.push(item);
        }
      }

      if (selected.length === 0 && boundary === null) {
        boundary = {
          kind: "INSUFFICIENT_EVIDENCE",
          message: BOUNDARY_MESSAGES.INSUFFICIENT_EVIDENCE,
          details: listing
            ? [`No verified investigation matches the filter: ${listing.description}.`]
            : anySupport
              ? ["Matching passages were excluded by the selected filters."]
              : [],
        };
      }

      const selectedIds = new Set(selected.map((item) => item.chunk.id));
      const results: RetrievedEvidence[] = selected.map((item, index) => {
        const neighbors = [item.chunk.previousChunkId, item.chunk.nextChunkId]
          .map((id) => (id ? byId.get(id) : undefined))
          .filter(
            (neighbor): neighbor is EvidenceChunk =>
              neighbor !== undefined &&
              !selectedIds.has(neighbor.id) &&
              sameSplitSection(neighbor, item.chunk),
          )
          .sort((a, b) => a.chunkIndex - b.chunkIndex);
        return {
          chunk: item.chunk,
          rank: index + 1,
          scores: {
            vector: item.vector,
            lexical: item.lexical,
            metadata: item.metadata,
            fused: Number(item.fused.toFixed(4)),
          },
          matchedTerms: item.matchedTerms,
          matchedMetadata: item.matchedMetadata,
          neighbors,
        };
      });

      return {
        status: "ok",
        mode,
        results,
        boundary,
        listing,
        understanding,
        notice: notices.join(" ") || null,
      };
    },
  };
}

export { blocksSynthesis };
