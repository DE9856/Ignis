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
 * Optional scientific fields resolve to `null` when absent. Nothing here
 * substitutes a plausible-looking number for a missing one.
 */

const text = z.string().trim().min(1);
const optionalText = text.nullable().default(null);
const optionalNumber = z.number().finite().nullable().default(null);
const textList = z.array(text).default([]);

/** YAML turns bare dates into Date objects; store them as YYYY-MM-DD strings. */
const optionalDate = z
  .preprocess((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value), text.nullable())
  .default(null);

export const sourceReferenceSchema = z.object({
  id: text,
  resource: text,
  title: optionalText,
  sourceClass: z.enum(PROVENANCE_CLASSES).default("UNVERIFIED"),
  accessed: optionalDate,
});

export const generationRecordSchema = z.object({
  by: text,
  at: optionalDate,
  tool: optionalText,
});

export const verificationRecordSchema = z.object({
  by: text,
  at: optionalDate,
  scope: optionalText,
});

const relatedId = text.regex(
  new RegExp(`^(${RELATED_FOLDERS.join("|")})/[a-z0-9]+(-[a-z0-9]+)*$`),
  "must look like <folder>/<record-id>, e.g. hardware/msg",
);

/** Either a bare id (`- hardware/msg`) or an object with `id`, `relation` and `note`. */
export const relatedReferenceSchema = z.union([
  relatedId.transform((id) => ({ id, relation: null as string | null, note: null as string | null })),
  z.object({ id: relatedId, relation: optionalText, note: optionalText }),
]);

/** Fields shared by every OKF document type. */
export const baseFrontmatterSchema = z.object({
  type: z.enum(OKF_DOCUMENT_TYPES),
  /** Defaults to the file name without `.md` when omitted. */
  id: text.optional(),
  title: text,
  description: optionalText,
  status: z.enum(DOCUMENT_STATUSES).default("draft"),
  tags: textList,
  sources: z.array(sourceReferenceSchema).default([]),
  related: z.array(relatedReferenceSchema).default([]),
  generated: generationRecordSchema.nullable().default(null),
  verified: z.array(verificationRecordSchema).default([]),
});
export type BaseFrontmatter = z.infer<typeof baseFrontmatterSchema>;

const RANGE_FIELDS = [
  ["oxygenMin", "oxygenMax"],
  ["pressureMin", "pressureMax"],
  ["airflowMin", "airflowMax"],
] as const;

export const investigationFrontmatterSchema = baseFrontmatterSchema
  .extend({
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
    hardware: textList,
    sensors: textList,
    measurements: textList,
    variables: textList,
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
    if (value.status === "verified" && value.verified.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["status"],
        message: "status is 'verified' but the 'verified' list has no reviewer entry",
      });
    }
  });
export type InvestigationFrontmatter = z.infer<typeof investigationFrontmatterSchema>;
