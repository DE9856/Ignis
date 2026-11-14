/**
 * Core domain types for IGNIS.
 *
 * Rule for every scientific field: a missing value is `null`, never a
 * convenient default. `null` means "not stated in a reviewed source".
 */

export const SAFETY_OBJECTIVES = ["prevention", "detection", "suppression"] as const;
export type SafetyObjective = (typeof SAFETY_OBJECTIVES)[number];

/**
 * How far a piece of content can be trusted, and where it came from.
 * Shown next to every piece of evidence in the UI.
 */
export const PROVENANCE_CLASSES = [
  "NASA_SOURCE",
  "HUMAN_REVIEWED",
  "COMPUTED",
  "TEAM_INTERPRETATION",
  "GENERATED_SUMMARY",
  "UNVERIFIED",
] as const;
export type ProvenanceClass = (typeof PROVENANCE_CLASSES)[number];

export const DOCUMENT_STATUSES = ["draft", "in_review", "verified", "deprecated"] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export const OKF_DOCUMENT_TYPES = ["Investigation", "Hardware", "Concept", "Mission"] as const;
export type OkfDocumentType = (typeof OKF_DOCUMENT_TYPES)[number];

export const GRAVITY_CONDITIONS = [
  "microgravity",
  "partial_gravity",
  "normal_gravity",
  "hypergravity",
  "variable",
] as const;
export type GravityCondition = (typeof GRAVITY_CONDITIONS)[number];

export interface SourceReference {
  id: string;
  /** URL or other stable locator of the source. */
  resource: string;
  title: string | null;
  sourceClass: ProvenanceClass;
  /** ISO date (YYYY-MM-DD) the source was last checked. */
  accessed: string | null;
}

export interface GenerationRecord {
  /** Who or what wrote the record, e.g. `human:member2` or `llm:<model>`. */
  by: string;
  at: string | null;
  tool: string | null;
}

export interface VerificationRecord {
  /** Reviewer, e.g. `human:member3`. */
  by: string;
  at: string | null;
  /** What was checked, e.g. `frontmatter`, `key-findings`, `all`. */
  scope: string | null;
}

export interface Investigation {
  id: string;
  title: string;
  shortTitle: string | null;
  program: string | null;
  description: string | null;
  objective: string | null;

  safetyCategories: SafetyObjective[];

  fuelType: string | null;
  material: string | null;
  sampleShape: string | null;
  sampleSize: string | null;

  /** Oxygen concentration, percent by volume. */
  oxygenMin: number | null;
  oxygenMax: number | null;

  /** Ambient pressure, kPa. */
  pressureMin: number | null;
  pressureMax: number | null;

  /** Forced flow speed, m/s. */
  airflowMin: number | null;
  airflowMax: number | null;

  gravityCondition: GravityCondition | null;
  /** Gravity level in g (1 = Earth surface). */
  gravityValue: number | null;

  platform: string | null;
  hardware: string[];

  sensors: string[];
  measurements: string[];
  variables: string[];

  keyFindings: string[];
  limitations: string[];

  tags: string[];

  sources: SourceReference[];

  generated: GenerationRecord | null;
  verified: VerificationRecord[];
  status: DocumentStatus;
}

/** One Markdown section of an OKF document, split on `#` / `##` headings. */
export interface OkfSection {
  heading: string;
  /** Lower-case, hyphenated heading, e.g. `key-findings`. */
  slug: string;
  level: 1 | 2;
  content: string;
  order: number;
}

/** A parsed OKF file: structured YAML metadata plus Markdown sections. */
export interface OkfDocument<TMetadata> {
  id: string;
  type: OkfDocumentType;
  /** Path relative to the repository root, for error messages and provenance. */
  filePath: string;
  metadata: TMetadata;
  sections: OkfSection[];
}

export interface OkfIssue {
  filePath: string;
  /** Dotted path into the frontmatter, or `""` for file-level problems. */
  path: string;
  message: string;
}

export type OkfParseResult<TDocument> = { ok: true; document: TDocument } | { ok: false; issues: OkfIssue[] };
