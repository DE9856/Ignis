import { z } from "zod";

import {
  DOCUMENT_STATUSES,
  GRAVITY_CONDITIONS,
  OKF_DOCUMENT_TYPES,
  PROVENANCE_CLASSES,
  RELATED_FOLDERS,
  SAFETY_OBJECTIVES,
} from "./types";

/**
 * Zod schemas for OKF YAML frontmatter.
 *
 * Authors write snake_case keys (`oxygen_min`, `safety_category`). The parser
 * converts keys to camelCase before these schemas run, so everything below is
 * camelCase. See `normalizeFrontmatterKeys` in parser.ts.
 *
 * Optional scientific fields resolve to `null` when absent. Nothing here
 * substitutes a plausible-looking number for a missing one.
 *
 * Investigation frontmatter is strict: an unrecognised key is an error, so a
 * misspelt field can never be silently dropped and shown as "Unknown".
 */

const text = z.string().trim().min(1);
const optionalText = text.nullable().default(null);
const optionalNumber = z.number().finite().nullable().default(null);
const textList = z.array(text).default([]);

/** Accepts a list, a single string, or null. Always produces a list. */
const flexibleTextList = z
  .preprocess((value) => (value === null ? [] : typeof value === "string" ? [value] : value), z.array(text))
  .default([]);

/** YAML turns bare dates into Date objects; store them as ISO strings. */
function dateToText(value: unknown): unknown {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return value;
  const iso = value.toISOString();
  return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.replace(".000Z", "Z");
}
const optionalDate = z.preprocess(dateToText, text.nullable()).default(null);

export const sourceReferenceSchema = z.strictObject({
  id: text,
  resource: text,
  title: optionalText,
  sourceClass: z.enum(PROVENANCE_CLASSES).default("UNVERIFIED"),
  accessed: optionalDate,
});

export const generationRecordSchema = z.strictObject({
  by: text,
  at: optionalDate,
  tool: optionalText,
});

export const verificationRecordSchema = z.strictObject({
  by: text,
  at: optionalDate,
  note: optionalText,
});

const relatedId = text.regex(
  new RegExp(`^(${RELATED_FOLDERS.join("|")})/[a-z0-9]+(-[a-z0-9]+)*$`),
  "must look like <folder>/<record-id>, e.g. hardware/msg",
);

/** Either a bare id (`- hardware/msg`) or an object with `id`, `relation` and `note`. */
export const relatedReferenceSchema = z.union([
  relatedId.transform((id) => ({ id, relation: null as string | null, note: null as string | null })),
  z.strictObject({ id: relatedId, relation: optionalText, note: optionalText }),
]);

/** Fields shared by every OKF document type. */
const baseShape = {
  type: z.enum(OKF_DOCUMENT_TYPES),
  /** Defaults to the file name without `.md` when omitted. */
  id: text.optional(),
  title: text,
  description: optionalText,
  /** Primary source locator, usually the NASA PSI record URL. */
  resource: optionalText,
  status: z.enum(DOCUMENT_STATUSES).default("draft"),
  tags: textList,
  sources: z.array(sourceReferenceSchema).default([]),
  related: z.array(relatedReferenceSchema).default([]),
  generated: generationRecordSchema.nullable().default(null),
  verified: z.array(verificationRecordSchema).default([]),
};

export const BASE_FRONTMATTER_KEYS: readonly string[] = Object.keys(baseShape);

interface ReviewFields {
  status: (typeof DOCUMENT_STATUSES)[number];
  verified: unknown[];
}

function requireReviewerForStable(value: ReviewFields, context: z.RefinementCtx) {
  if (value.status === "stable" && value.verified.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["status"],
      message: "status is 'stable' but the 'verified' list has no reviewer entry",
    });
  }
}

/**
 * Hardware, Concept and Mission records. Loose on purpose: their type-specific
 * fields are not agreed yet, so extra keys are kept (and reported as warnings
 * by `npm run validate:knowledge`) instead of rejected.
 */
export const baseFrontmatterSchema = z.looseObject(baseShape).superRefine(requireReviewerForStable);
export type BaseFrontmatter = z.infer<typeof baseFrontmatterSchema>;

/**
 * Where a mission preset value comes from. Every stated preset value carries one,
 * so a scenario never presents an assumption as a NASA figure.
 * - nasa_source: stated in a cited NASA document
 * - challenge_context: stated in the NASA Space Apps challenge text
 * - prototype_assumption: chosen by the team; the record's notes say why
 */
export const VALUE_BASES = ["nasa_source", "challenge_context", "prototype_assumption"] as const;
export type ValueBasis = (typeof VALUE_BASES)[number];

/** Mission preset values. Same names and units as `MissionScenario` in lib/ranking/types. */
export const MISSION_VALUE_KEYS = [
  "oxygenPercent",
  "pressureKPa",
  "airflowMetersPerSecond",
  "gravityG",
  "material",
  "fuelType",
  "safetyObjective",
] as const;
export type MissionValueKey = (typeof MISSION_VALUE_KEYS)[number];

/**
 * Mission-specific frontmatter, checked on its own after the shared fields.
 * Strict, so a misspelt preset field is an error rather than a blank value.
 */
export const missionFieldsSchema = z
  .strictObject({
    /** Percent by volume. */
    oxygenPercent: optionalNumber,
    /** Absolute, kPa. */
    pressureKPa: optionalNumber,
    airflowMetersPerSecond: optionalNumber,
    /** 1 = Earth surface. */
    gravityG: optionalNumber,
    material: optionalText,
    fuelType: optionalText,
    safetyObjective: z.enum(SAFETY_OBJECTIVES).nullable().default(null),
    assumptionNotes: optionalText,
    valueBasis: z.partialRecord(z.enum(MISSION_VALUE_KEYS), z.enum(VALUE_BASES)).default({}),
  })
  .superRefine((value, context) => {
    for (const key of MISSION_VALUE_KEYS) {
      if (value[key] !== null && value.valueBasis[key] === undefined) {
        context.addIssue({
          code: "custom",
          path: ["valueBasis", key],
          message: `${key} is set but valueBasis does not say where it comes from`,
        });
      }
      if (value[key] === null && value.valueBasis[key] !== undefined) {
        context.addIssue({
          code: "custom",
          path: ["valueBasis", key],
          message: `valueBasis names ${key}, but ${key} has no value`,
        });
      }
    }
    if (value.oxygenPercent !== null && (value.oxygenPercent < 0 || value.oxygenPercent > 100)) {
      context.addIssue({ code: "custom", path: ["oxygenPercent"], message: "must be 0 to 100" });
    }
    for (const key of ["pressureKPa", "airflowMetersPerSecond", "gravityG"] as const) {
      const number = value[key];
      if (number !== null && number < 0) {
        context.addIssue({ code: "custom", path: [key], message: "cannot be negative" });
      }
    }
  });
export type MissionFields = z.infer<typeof missionFieldsSchema>;
export const MISSION_FIELD_KEYS: readonly string[] = [...MISSION_VALUE_KEYS, "assumptionNotes", "valueBasis"];

const RANGE_FIELDS = [
  ["oxygenMin", "oxygenMax"],
  ["pressureMin", "pressureMax"],
  ["airflowMin", "airflowMax"],
] as const;

export const investigationFrontmatterSchema = z
  .strictObject({
    ...baseShape,
    type: z.literal("Investigation"),
    shortTitle: optionalText,
    program: optionalText,

    safetyCategories: z.array(z.enum(SAFETY_OBJECTIVES)).default([]),

    fuelType: optionalText,
    material: optionalText,
    sampleShape: optionalText,
    sampleSize: optionalText,

    oxygenMin: optionalNumber,
    oxygenMax: optionalNumber,
    pressureMin: optionalNumber,
    pressureMax: optionalNumber,
    airflowMin: optionalNumber,
    airflowMax: optionalNumber,

    gravityCondition: z.enum(GRAVITY_CONDITIONS).nullable().default(null),
    gravityValue: optionalNumber,

    platform: optionalText,
    hardware: flexibleTextList,
    sensors: flexibleTextList,
    measurements: flexibleTextList,
    variables: flexibleTextList,
  })
  .superRefine((value, context) => {
    for (const [minKey, maxKey] of RANGE_FIELDS) {
      const min = value[minKey];
      const max = value[maxKey];
      if (min !== null && max !== null && min > max) {
        context.addIssue({
          code: "custom",
          path: [minKey],
          message: `${minKey} (${min}) is greater than ${maxKey} (${max})`,
        });
      }
    }
    requireReviewerForStable(value, context);
  });
export type InvestigationFrontmatter = z.infer<typeof investigationFrontmatterSchema>;
