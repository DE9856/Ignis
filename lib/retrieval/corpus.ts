import fs from "node:fs";
import path from "node:path";

import { isInvestigationDocument, parseOkfDocument } from "@/lib/okf/parser";
import type { OkfIssue } from "@/lib/okf/types";

import { fromInvestigationDocument, type ChunkableDocument } from "./adapter";
import { chunkDocuments, type ChunkerOptions, type ChunkResult } from "./chunker";

/**
 * Reads investigation records from `knowledge/` for chunking. Server and scripts only.
 *
 * The app's loader returns flattened records without their Markdown sections,
 * so this walks the folder itself, using the same parser and the same file
 * rules. It also skips `zz-local-*` files: those are git-ignored synthetic
 * layout fixtures and must never reach the index, even on a laptop where
 * they exist.
 */

export interface CorpusLoad {
  documents: ChunkableDocument[];
  issues: OkfIssue[];
  /** Files deliberately not read: templates, READMEs, local fixtures. */
  ignoredFiles: string[];
}

export function isIgnoredKnowledgeFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    !lower.endsWith(".md") || lower.startsWith("_") || lower.startsWith("zz-local-") || lower === "readme.md"
  );
}

export function loadChunkableDocuments(knowledgeRoot: string): CorpusLoad {
  const load: CorpusLoad = { documents: [], issues: [], ignoredFiles: [] };
  const directory = path.join(/* turbopackIgnore: true */ knowledgeRoot, "investigations");
  if (!fs.existsSync(directory)) return load;

  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();

  for (const fileName of entries) {
    const filePath = `knowledge/investigations/${fileName}`;
    if (isIgnoredKnowledgeFile(fileName)) {
      load.ignoredFiles.push(filePath);
      continue;
    }
    const raw = fs.readFileSync(path.join(/* turbopackIgnore: true */ directory, fileName), "utf8");
    const result = parseOkfDocument(raw, filePath);
    if (!result.ok) {
      load.issues.push(...result.issues);
      continue;
    }
    if (!isInvestigationDocument(result.document)) {
      load.issues.push({
        filePath,
        path: "type",
        message: "expected type 'Investigation' in knowledge/investigations/",
      });
      continue;
    }
    load.documents.push(fromInvestigationDocument(result.document));
  }
  return load;
}

export interface CorpusChunks extends ChunkResult {
  load: CorpusLoad;
}

/** Load, keep verified records, chunk. The one function both ingestion and local search use. */
export function buildCorpusChunks(knowledgeRoot: string, options: ChunkerOptions = {}): CorpusChunks {
  const load = loadChunkableDocuments(knowledgeRoot);
  return { ...chunkDocuments(load.documents, options), load };
}

export function defaultKnowledgeRoot(): string {
  return path.join(process.cwd(), "knowledge");
}
