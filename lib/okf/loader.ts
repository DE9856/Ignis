import fs from "node:fs";
import path from "node:path";

import {
  isInvestigationDocument,
  parseOkfDocument,
  toInvestigation,
  type GenericOkfDocument,
} from "./parser";
import type { Investigation, OkfIssue } from "./types";

/**
 * Reads the `knowledge/` directory from disk. Server-side only.
 *
 * Reads are synchronous on purpose: pages that use this are prerendered at
 * build time, and re-read on every request in `next dev`, so content edits
 * show up on refresh without any cache to invalidate.
 */

export const KNOWLEDGE_DIRECTORIES = ["investigations", "hardware", "concepts", "missions"] as const;
export type KnowledgeDirectory = (typeof KNOWLEDGE_DIRECTORIES)[number];

export interface KnowledgeBase {
  investigations: Investigation[];
  hardware: GenericOkfDocument[];
  concepts: GenericOkfDocument[];
  missions: GenericOkfDocument[];
  /** Files that failed validation. Surfaced in the UI, never silently dropped. */
  issues: OkfIssue[];
}

export function defaultKnowledgeRoot(): string {
  return path.join(process.cwd(), "knowledge");
}

/** Markdown files in a directory, skipping READMEs and `_`-prefixed templates. */
function listOkfFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        !entry.name.startsWith("_") &&
        entry.name.toLowerCase() !== "readme.md",
    )
    .map((entry) => entry.name)
    .sort();
}

export function loadKnowledgeBase(root: string = defaultKnowledgeRoot()): KnowledgeBase {
  const knowledge: KnowledgeBase = {
    investigations: [],
    hardware: [],
    concepts: [],
    missions: [],
    issues: [],
  };

  for (const directory of KNOWLEDGE_DIRECTORIES) {
    // Pages are prerendered at build time, so these files are not needed in the
    // server bundle; the comments stop Turbopack tracing the whole project for them.
    const directoryPath = path.join(/* turbopackIgnore: true */ root, directory);
    for (const fileName of listOkfFiles(directoryPath)) {
      const filePath = `knowledge/${directory}/${fileName}`;
      const raw = fs.readFileSync(path.join(/* turbopackIgnore: true */ directoryPath, fileName), "utf8");
      const result = parseOkfDocument(raw, filePath);

      if (!result.ok) {
        knowledge.issues.push(...result.issues);
        continue;
      }

      const { document } = result;
      const expectsInvestigation = directory === "investigations";
      if (isInvestigationDocument(document) !== expectsInvestigation) {
        knowledge.issues.push({
          filePath,
          path: "type",
          message: `type '${document.type}' does not belong in knowledge/${directory}/`,
        });
        continue;
      }

      if (isInvestigationDocument(document)) {
        knowledge.investigations.push(toInvestigation(document));
      } else {
        knowledge[directory as Exclude<KnowledgeDirectory, "investigations">].push(document);
      }
    }
  }

  return knowledge;
}
