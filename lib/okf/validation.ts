import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import {
  defaultKnowledgeRoot,
  KNOWLEDGE_DIRECTORIES,
  LOCAL_FIXTURE_PREFIX,
  type KnowledgeDirectory,
} from "./loader";
import { camelToSnake, isVerified, normalizeFrontmatterKeys, parseOkfDocument } from "./parser";
import { BASE_FRONTMATTER_KEYS } from "./schema";
import type { DocumentStatus, OkfDocumentType } from "./types";

/**
 * Structural validation of the knowledge base, for `npm run validate:knowledge`
 * and CI.
 *
 * This checks form only: readable YAML, known fields, sources present, links
 * that resolve, no leftover placeholders. It never judges whether a scientific
 * statement is correct. That is the reviewer's job.
 *
 * ERROR means the knowledge base must not be merged in this state.
 * WARN means "look at this"; it does not fail the run.
 */

export type FindingLevel = "ERROR" | "WARN";

export interface Finding {
  level: FindingLevel;
  message: string;
}

export interface FileReport {
  /** Path relative to the repository root, e.g. knowledge/investigations/x.md */
  filePath: string;
  directory: KnowledgeDirectory;
  id: string | null;
  type: OkfDocumentType | null;
  status: DocumentStatus | null;
  humanReviewed: boolean;
  sourceCount: number;
  sectionCount: number;
  findings: Finding[];
}

export interface KnowledgeReport {
  root: string;
  files: FileReport[];
  /** Local synthetic files that were skipped (never committed, never validated). */
  skippedLocalFiles: string[];
  summary: { files: number; valid: number; withWarnings: number; withErrors: number };
}

const TYPE_FOR_DIRECTORY: Record<KnowledgeDirectory, OkfDocumentType> = {
  investigations: "Investigation",
  hardware: "Hardware",
  concepts: "Concept",
  missions: "Mission",
};

const RECOMMENDED_INVESTIGATION_SECTIONS = [
  "objective",
  "experimental-conditions",
  "variables",
  "sensors-and-measurements",
  "key-findings",
  "fire-safety-relevance",
  "limitations",
  "source-notes",
];

/** Text that means "someone still has to fill this in". */
const PLACEHOLDER_PATTERNS: [RegExp, string][] = [
  [/\bTODO\b/, "TODO"],
  [/\bTBD\b/, "TBD"],
  [/\bFIXME\b/, "FIXME"],
  [/placeholder/i, "placeholder"],
  [/lorem ipsum/i, "lorem ipsum"],
  [/replace with/i, "replace with"],
  [/NASA PSI URL/i, "NASA PSI URL"],
  [/\bexample\.(com|org|net)\b/i, "example.com"],
  [/(^|\s)\.\.\.(\s|$)/m, "..."],
  [/<[A-Za-z][^<>\n:/]{1,60}>/, "<angle-bracket placeholder>"],
];

const KEBAB_FILE = /^[a-z0-9]+(-[a-z0-9]+)*\.md$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function findPlaceholders(text: string): string[] {
  return PLACEHOLDER_PATTERNS.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}

/** Frontmatter values and body as one string, without YAML comments or keys. */
function contentText(data: unknown, body: string): string {
  const parts: string[] = [body];
  const walk = (value: unknown) => {
    if (typeof value === "string") parts.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object" && !(value instanceof Date))
      Object.values(value).forEach(walk);
  };
  walk(data);
  return parts.join("\n");
}

function validateFile(root: string, directory: KnowledgeDirectory, fileName: string): FileReport {
  const filePath = `knowledge/${directory}/${fileName}`;
  const report: FileReport = {
    filePath,
    directory,
    id: null,
    type: null,
    status: null,
    humanReviewed: false,
    sourceCount: 0,
    sectionCount: 0,
    findings: [],
  };
  const error = (message: string) => report.findings.push({ level: "ERROR", message });
  const warn = (message: string) => report.findings.push({ level: "WARN", message });

  if (!KEBAB_FILE.test(fileName)) {
    warn("File name should be lower-case words joined by hyphens, e.g. my-record.md");
  }

  let raw: string;
  try {
    raw = fs.readFileSync(path.join(/* turbopackIgnore: true */ root, directory, fileName), "utf8");
  } catch {
    error("File could not be read");
    return report;
  }

  if (!raw.trimStart().startsWith("---")) {
    error("Missing YAML frontmatter: the file must start with a --- block");
    return report;
  }

  let rawData: Record<string, unknown> = {};
  let body = "";
  try {
    const parsed = matter(raw);
    rawData = (normalizeFrontmatterKeys(parsed.data) ?? {}) as Record<string, unknown>;
    body = parsed.content;
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message.split("\n")[0] : "unreadable";
    error(`Invalid YAML frontmatter: ${reason}`);
    return report;
  }

  const result = parseOkfDocument(raw, filePath);
  if (!result.ok) {
    for (const issue of result.issues) {
      error(issue.path ? `${issue.path}: ${issue.message}` : issue.message);
    }
    return report;
  }

  const { document } = result;
  const { metadata } = document;
  report.id = document.id;
  report.type = document.type;
  report.status = metadata.status;
  report.humanReviewed = isVerified(metadata);
  report.sourceCount = metadata.sources.length;
  report.sectionCount = document.sections.length;
  const isStable = metadata.status === "stable";
  /** Problems that block a stable record are only worth a warning on a draft. */
  const strict = (message: string) => (isStable ? error(message) : warn(message));

  if (document.type !== TYPE_FOR_DIRECTORY[directory]) {
    error(
      `type '${document.type}' does not belong in knowledge/${directory}/ (expected ${TYPE_FOR_DIRECTORY[directory]})`,
    );
  }

  // Sources
  if (metadata.sources.length === 0) strict("No sources listed");
  const sourceIds = new Set<string>();
  for (const source of metadata.sources) {
    if (sourceIds.has(source.id)) error(`Duplicate source id '${source.id}'`);
    sourceIds.add(source.id);
    if (!isHttpUrl(source.resource)) error(`Source '${source.id}' has an invalid URL: ${source.resource}`);
  }
  if (metadata.resource !== null && !isHttpUrl(metadata.resource)) {
    error(`resource is not a valid URL: ${metadata.resource}`);
  }

  // Review trail
  if (metadata.generated === null) warn("Missing 'generated.by': record who wrote this file");
  if (isStable) {
    const author = metadata.generated?.by ?? null;
    if (author !== null && metadata.verified.every((entry) => entry.by === author)) {
      error(`Verified only by its author (${author}). A different person must review it.`);
    }
    if (metadata.verified.some((entry) => entry.at === null)) warn("A verification entry has no 'at' date");
  } else if (metadata.status === "draft" && metadata.verified.length > 0) {
    warn("Has verification entries but status is still 'draft'");
  }

  // Leftover placeholders
  const placeholders = findPlaceholders(contentText(rawData, body));
  if (placeholders.length > 0) strict(`Placeholder text found: ${placeholders.join(", ")}`);

  // Structure
  if (document.type === "Investigation") {
    const present = new Set(document.sections.map((section) => section.slug));
    const missing = RECOMMENDED_INVESTIGATION_SECTIONS.filter((slug) => !present.has(slug));
    if (missing.length > 0) warn(`Missing sections: ${missing.join(", ")}`);
    const empty = document.sections
      .filter((section) => section.content === "")
      .map((section) => section.heading);
    if (empty.length > 0) strict(`Empty sections: ${empty.join(", ")}`);
  } else {
    const unknownKeys = Object.keys(rawData).filter((key) => !BASE_FRONTMATTER_KEYS.includes(key));
    if (unknownKeys.length > 0)
      warn(`Fields not in the shared schema yet: ${unknownKeys.map(camelToSnake).join(", ")}`);
    if (document.sections.length === 0) warn("No Markdown sections");
  }

  return report;
}

export function validateKnowledge(root: string = defaultKnowledgeRoot()): KnowledgeReport {
  const files: FileReport[] = [];
  const skippedLocalFiles: string[] = [];

  for (const directory of KNOWLEDGE_DIRECTORIES) {
    const directoryPath = path.join(/* turbopackIgnore: true */ root, directory);
    if (!fs.existsSync(directoryPath)) continue;
    const names = fs
      .readdirSync(directoryPath, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(".md") &&
          !entry.name.startsWith("_") &&
          entry.name.toLowerCase() !== "readme.md",
      )
      .map((entry) => entry.name)
      .sort();

    for (const fileName of names) {
      if (fileName.startsWith(LOCAL_FIXTURE_PREFIX)) {
        skippedLocalFiles.push(`knowledge/${directory}/${fileName}`);
        continue;
      }
      files.push(validateFile(root, directory, fileName));
    }
  }

  // Duplicate ids: an id must be unique within its folder, since links are <folder>/<id>.
  const seen = new Map<string, string>();
  for (const file of files) {
    if (file.id === null) continue;
    const key = `${file.directory}/${file.id}`;
    const first = seen.get(key);
    if (first) {
      file.findings.push({ level: "ERROR", message: `Duplicate id '${key}', already used by ${first}` });
    } else {
      seen.set(key, file.filePath);
    }
  }

  // Cross-links. Re-parse is cheap and keeps validateFile independent of file order.
  for (const file of files) {
    if (file.id === null) continue;
    const raw = fs.readFileSync(
      path.join(/* turbopackIgnore: true */ root, file.directory, path.basename(file.filePath)),
      "utf8",
    );
    const result = parseOkfDocument(raw, file.filePath);
    if (!result.ok) continue;
    for (const link of result.document.metadata.related) {
      if (link.id === `${file.directory}/${file.id}`) {
        file.findings.push({ level: "WARN", message: `Links to itself: ${link.id}` });
      } else if (!seen.has(link.id)) {
        file.findings.push({ level: "WARN", message: `Unresolved link: ${link.id} does not exist yet` });
      }
    }
  }

  const hasLevel = (file: FileReport, level: FindingLevel) =>
    file.findings.some((finding) => finding.level === level);
  const withErrors = files.filter((file) => hasLevel(file, "ERROR")).length;
  const withWarnings = files.filter((file) => !hasLevel(file, "ERROR") && hasLevel(file, "WARN")).length;

  return {
    root,
    files,
    skippedLocalFiles,
    summary: {
      files: files.length,
      valid: files.length - withErrors - withWarnings,
      withWarnings,
      withErrors,
    },
  };
}

export function fileLevel(file: FileReport): "PASS" | FindingLevel {
  if (file.findings.some((finding) => finding.level === "ERROR")) return "ERROR";
  return file.findings.length > 0 ? "WARN" : "PASS";
}
