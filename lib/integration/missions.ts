import { getVerificationTier } from "@/lib/domain/provenance";
import type { GenericOkfDocument } from "@/lib/okf/parser";
import {
  MISSION_FIELD_KEYS,
  missionFieldsSchema,
  type MissionValueKey,
  type ValueBasis,
} from "@/lib/okf/schema";
import type { DocumentStatus, SourceReference } from "@/lib/okf/types";
import type { MissionScenario } from "@/lib/ranking/types";

/**
 * Mission presets: knowledge/missions records turned into scenarios the
 * scenario builder can load. A preset is an input, not evidence; it carries
 * where each value comes from so the form can say so next to it.
 */
export interface MissionPreset extends MissionScenario {
  status: DocumentStatus;
  /** Signed off by someone other than the author. */
  humanReviewed: boolean;
  /** Where each stated value comes from. Keys are only present for stated values. */
  valueBasis: Partial<Record<MissionValueKey, ValueBasis>>;
  sources: Pick<SourceReference, "id" | "title" | "resource">[];
}

export const VALUE_BASIS_LABELS: Record<ValueBasis, string> = {
  nasa_source: "NASA source",
  challenge_context: "Challenge statement",
  prototype_assumption: "Team assumption",
};

/** The mission-specific keys of a frontmatter object; the shared keys are validated elsewhere. */
export function pickMissionFields(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(data).filter(([key]) => MISSION_FIELD_KEYS.includes(key)));
}

/** One preset, or null for a deprecated record or one whose preset fields do not parse. */
export function toMissionPreset(document: GenericOkfDocument): MissionPreset | null {
  const { metadata } = document;
  if (metadata.status === "deprecated") return null;
  const parsed = missionFieldsSchema.safeParse(pickMissionFields(metadata));
  if (!parsed.success) return null;
  const fields = parsed.data;

  return {
    id: document.id,
    name: metadata.title,
    description: metadata.description,
    oxygenPercent: fields.oxygenPercent,
    pressureKPa: fields.pressureKPa,
    airflowMetersPerSecond: fields.airflowMetersPerSecond,
    gravityG: fields.gravityG,
    material: fields.material,
    fuelType: fields.fuelType,
    safetyObjective: fields.safetyObjective,
    assumptionNotes: fields.assumptionNotes,
    status: metadata.status,
    humanReviewed: getVerificationTier(metadata) === "HUMAN_REVIEWED",
    valueBasis: fields.valueBasis,
    sources: metadata.sources.map(({ id, title, resource }) => ({ id, title, resource })),
  };
}

/** Presets in a stable order: by gravity (orbit, Moon, Mars), then name. */
export function toMissionPresets(documents: GenericOkfDocument[]): MissionPreset[] {
  return documents
    .map(toMissionPreset)
    .filter((preset): preset is MissionPreset => preset !== null)
    .sort(
      (a, b) =>
        (a.gravityG ?? Number.POSITIVE_INFINITY) - (b.gravityG ?? Number.POSITIVE_INFINITY) ||
        a.name.localeCompare(b.name),
    );
}
