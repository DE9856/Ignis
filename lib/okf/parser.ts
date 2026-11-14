import matter from "gray-matter";
import type { z } from "zod";

import {
  baseFrontmatterSchema,
  investigationFrontmatterSchema,
  type BaseFrontmatter,
  type InvestigationFrontmatter,
} from "./schema";
import type { Investigation, OkfDocument, OkfIssue, OkfParseResult, OkfSection } from "./types";

/**
 * Basic OKF parser: YAML frontmatter + Markdown sections.
 *
 * This is deliberately small. It does not yet handle nested sections,
 * per-section provenance, or tables. Extend it here, not in the UI.
 */

export type GenericOkfDocument = OkfDocument<BaseFrontmatter>;
export type InvestigationDocument = OkfDocument<InvestigationFrontmatter>;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Split Markdown into sections on level 1 and 2 headings, ignoring code fences. */
export function parseSections(markdown: string): OkfSection[] {
  const sections: OkfSection[] = [];
  let current: { heading: string; level: 1 | 2; lines: string[] } | null = null;
  let insideFence = false;

  const flush = () => {
    if (!current) return;
    sections.push({
      heading: current.heading,
      slug: slugify(current.heading),
      level: current.level,
      content: current.lines.join("\n").trim(),
      order: sections.length,
    });
  };

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) insideFence = !insideFence;
    const heading = insideFence ? null : /^(#{1,2})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) {
      flush();
      current = { heading: heading[2], level: heading[1].length as 1 | 2, lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  flush();
  return sections;
}

/** Top-level bullet items of a section, or [] when it has none. */
export function parseBulletList(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => /^[-*]\s+(.*)$/.exec(line)?.[1].trim() ?? "")
    .filter((item) => item.length > 0);
}

function toIssues(error: z.ZodError, filePath: string): OkfIssue[] {
  return error.issues.map((issue) => ({
    filePath,
    path: issue.path.join("."),
    message: issue.message,
  }));
}

function idFromPath(filePath: string): string {
  const fileName = filePath.split(/[\\/]/).pop() ?? filePath;
  return slugify(fileName.replace(/\.md$/i, ""));
}

/**
 * Parse one OKF file. Returns issues instead of throwing, so one bad file
 * cannot take the application down.
 */
export function parseOkfDocument(
  raw: string,
  filePath: string,
): OkfParseResult<GenericOkfDocument | InvestigationDocument> {
  let data: unknown;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data;
    content = parsed.content;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unreadable YAML frontmatter";
    return { ok: false, issues: [{ filePath, path: "", message }] };
  }

  const isInvestigation =
    typeof data === "object" && data !== null && (data as { type?: unknown }).type === "Investigation";
  const result = isInvestigation
    ? investigationFrontmatterSchema.safeParse(data)
    : baseFrontmatterSchema.safeParse(data);

  if (!result.success) return { ok: false, issues: toIssues(result.error, filePath) };

  return {
    ok: true,
    document: {
      id: result.data.id ?? idFromPath(filePath),
      type: result.data.type,
      filePath,
      metadata: result.data,
      sections: parseSections(content),
    } as GenericOkfDocument | InvestigationDocument,
  };
}

export function isInvestigationDocument(
  document: GenericOkfDocument | InvestigationDocument,
): document is InvestigationDocument {
  return document.type === "Investigation";
}

function sectionText(sections: OkfSection[], slug: string): string | null {
  const content = sections.find((section) => section.slug === slug)?.content ?? "";
  return content.length > 0 ? content : null;
}

/** Flatten an Investigation document into the shape the UI and ranking use. */
export function toInvestigation(document: InvestigationDocument): Investigation {
  const { metadata, sections } = document;
  return {
    id: document.id,
    title: metadata.title,
    shortTitle: metadata.shortTitle,
    program: metadata.program,
    description: metadata.description,
    objective: sectionText(sections, "objective"),
    safetyCategories: metadata.safetyCategories,
    fuelType: metadata.fuelType,
    material: metadata.material,
    sampleShape: metadata.sampleShape,
    sampleSize: metadata.sampleSize,
    oxygenMin: metadata.oxygenMin,
    oxygenMax: metadata.oxygenMax,
    pressureMin: metadata.pressureMin,
    pressureMax: metadata.pressureMax,
    airflowMin: metadata.airflowMin,
    airflowMax: metadata.airflowMax,
    gravityCondition: metadata.gravityCondition,
    gravityValue: metadata.gravityValue,
    platform: metadata.platform,
    hardware: metadata.hardware,
    sensors: metadata.sensors,
    measurements: metadata.measurements,
    variables: metadata.variables,
    keyFindings: parseBulletList(sectionText(sections, "key-findings") ?? ""),
    limitations: parseBulletList(sectionText(sections, "limitations") ?? ""),
    tags: metadata.tags,
    sources: metadata.sources,
    related: metadata.related,
    generated: metadata.generated,
    verified: metadata.verified,
    status: metadata.status,
  };
}

/** Verified means a reviewer signed off AND the status says so. */
export function isVerified(record: Pick<Investigation, "status" | "verified">): boolean {
  return record.status === "verified" && record.verified.length > 0;
}
