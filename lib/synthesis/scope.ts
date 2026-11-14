import { joinList } from "@/lib/retrieval/messages";
import { analyzeQuery, buildVocabulary } from "@/lib/retrieval/query-analysis";
import type { EvidenceChunk } from "@/lib/retrieval/types";

/**
 * Keeps a summary about the investigation the question names.
 *
 * Without this, "What did Saffire burn?" retrieves the closest verified
 * passages (say, BASS) and the model reports BASS results as Saffire's. Every
 * sentence would cite a real passage, so the grounding check cannot see the
 * mistake; the scope has to be fixed before the model is called.
 *
 * Names are recognised from every investigation record, verified or not, so
 * a question about a draft record is recognised as being about something the
 * reviewed knowledge does not cover yet.
 */

/** The fields of an OKF investigation record needed to recognise its name. */
export interface InvestigationName {
  id: string;
  title: string;
  shortTitle: string | null;
}

export interface ScopeResult {
  /** Passages to summarise: only those about the named investigations, when any are named. */
  chunks: EvidenceChunk[];
  /** Plain-language reasons for anything left out. Shown labelled COMPUTED. */
  notes: string[];
  /** Named investigations with no passage to summarise. */
  uncovered: string[];
}

function displayName(record: InvestigationName): string {
  return record.shortTitle ?? record.title;
}

export function scopeToNamedInvestigations(
  question: string,
  chunks: EvidenceChunk[],
  catalog: EvidenceChunk[],
  records: InvestigationName[],
): ScopeResult {
  const vocabulary = buildVocabulary(catalog);
  const known = new Set(vocabulary.investigations.map((entry) => entry.id));
  for (const record of records) {
    if (known.has(record.id)) continue;
    vocabulary.investigations.push({
      id: record.id,
      display: displayName(record),
      names: [record.title, record.shortTitle ?? "", record.id].filter(Boolean),
    });
  }

  const named = analyzeQuery(question, vocabulary).investigations;
  if (named.length === 0) return { chunks, notes: [], uncovered: [] };

  const nameOf = new Map(vocabulary.investigations.map((entry) => [entry.id, entry.display]));
  const verified = new Set(catalog.map((chunk) => chunk.investigationId));
  const inScope = chunks.filter((chunk) => chunk.investigationId && named.includes(chunk.investigationId));
  const covered = new Set(inScope.map((chunk) => chunk.investigationId));
  const uncoveredIds = named.filter((id) => !covered.has(id));
  const uncovered = uncoveredIds.map((id) => nameOf.get(id) ?? id);
  const leftOut = [
    ...new Set(chunks.filter((chunk) => !inScope.includes(chunk)).map((chunk) => chunk.investigation)),
  ];

  const notes: string[] = [];
  for (const id of uncoveredIds) {
    const name = nameOf.get(id) ?? id;
    notes.push(
      verified.has(id)
        ? `No passage about ${name} was among the passages summarised.`
        : `The ${name} record has not been verified yet, so it is not part of the reviewed knowledge.`,
    );
  }
  if (leftOut.length > 0) {
    notes.push(
      `Passages about ${joinList(leftOut).replace(/ or /, " and ")} were not summarised, because the question asks about ${joinList(
        named.map((id) => nameOf.get(id) ?? id),
      ).replace(/ or /, " and ")}.`,
    );
  }
  return { chunks: inScope, notes, uncovered };
}
