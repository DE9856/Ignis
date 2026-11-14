import { isHumanReviewed } from "@/lib/domain/provenance";
import type { KnowledgeBase } from "@/lib/okf/loader";
import { SAFETY_OBJECTIVES, type Investigation, type SafetyObjective } from "@/lib/okf/types";

/**
 * Everything the landing page shows, computed from human-reviewed records at
 * render time. Nothing here is typed in by hand: if a record changes, the
 * page changes with it.
 */

/** Condition fields an investigation can state. Same list as scripts/inspect-knowledge.ts. */
const CONDITION_FIELDS = [
  "fuelType",
  "material",
  "sampleShape",
  "sampleSize",
  "oxygenMin",
  "oxygenMax",
  "pressureMin",
  "pressureMax",
  "airflowMin",
  "airflowMax",
  "gravityCondition",
  "gravityValue",
  "platform",
] as const satisfies readonly (keyof Investigation)[];

/** Experiment families shown in the gallery. Ids that are not reviewed are dropped. */
const FAMILIES: { id: string; name: string; motif: FamilyMotif; members: string[] }[] = [
  { id: "bass", name: "BASS", motif: "spread", members: ["bass", "bass-ii"] },
  { id: "saffire", name: "Saffire", motif: "sheet", members: ["saffire"] },
  { id: "same", name: "SAME", motif: "smoke", members: ["same", "same-r"] },
  { id: "droplet", name: "FLEX", motif: "droplet", members: ["flex", "flex-2", "cfi"] },
  { id: "acme", name: "ACME", motif: "burner", members: ["acme-bre", "acme-cfi-g", "acme-e-field"] },
  { id: "jet", name: "SPICE", motif: "jet", members: ["spice", "slice"] },
];

export type FamilyMotif = "spread" | "sheet" | "smoke" | "droplet" | "burner" | "jet";

export interface LandingRange {
  id: string;
  label: string;
  min: number | null;
  max: number | null;
}

export interface LandingFamily {
  id: string;
  name: string;
  motif: FamilyMotif;
  members: { id: string; label: string }[];
  /** The lead record's own description, transcribed from its NASA sources. */
  description: string | null;
}

export interface LandingRecordSample {
  id: string;
  label: string;
  fields: { key: string; value: number | string | null }[];
  verifiedBy: string | null;
  verifiedAt: string | null;
}

export interface LandingViewModel {
  reviewed: number;
  /** All investigation records, reviewed or not, excluding deprecated ones. */
  investigations: number;
  sources: number;
  sourceHosts: { host: string; count: number }[];
  findings: number;
  /** Key findings per reviewed record, in record order. */
  findingsByRecord: { id: string; label: string; count: number }[];
  conditionsUnknown: number;
  conditionsTotal: number;
  oxygen: { min: number | null; max: number | null; reporting: number };
  oxygenRows: LandingRange[];
  byObjective: { objective: SafetyObjective; investigations: { id: string; label: string }[] }[];
  untagged: { id: string; label: string }[];
  families: LandingFamily[];
  sample: LandingRecordSample | null;
}

function label(investigation: Investigation): string {
  return investigation.shortTitle ?? investigation.title;
}

function host(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\d?\./, "");
  } catch {
    return null;
  }
}

export function buildLandingViewModel(knowledge: KnowledgeBase): LandingViewModel {
  const active = knowledge.investigations.filter((investigation) => investigation.status !== "deprecated");
  const reviewed = active.filter(isHumanReviewed);
  const byId = new Map(reviewed.map((investigation) => [investigation.id, investigation]));

  const urls = new Set(reviewed.flatMap((investigation) => investigation.sources.map((s) => s.resource)));
  const hostCounts = new Map<string, number>();
  for (const url of urls) {
    const name = host(url);
    if (name) hostCounts.set(name, (hostCounts.get(name) ?? 0) + 1);
  }

  const conditionsTotal = reviewed.length * CONDITION_FIELDS.length;
  const conditionsStated = reviewed.reduce(
    (total, investigation) =>
      total + CONDITION_FIELDS.filter((field) => investigation[field] !== null).length,
    0,
  );

  const oxygenRows: LandingRange[] = reviewed
    .map((investigation) => ({
      id: investigation.id,
      label: label(investigation),
      min: investigation.oxygenMin,
      max: investigation.oxygenMax,
    }))
    .sort(
      (a, b) =>
        Number(b.min !== null || b.max !== null) - Number(a.min !== null || a.max !== null) ||
        (a.min ?? a.max ?? 0) - (b.min ?? b.max ?? 0) ||
        a.label.localeCompare(b.label),
    );
  const oxygenValues = oxygenRows.flatMap((row) => [row.min, row.max]).filter((v): v is number => v !== null);

  const toItem = (investigation: Investigation) => ({ id: investigation.id, label: label(investigation) });

  const families = FAMILIES.map((family) => {
    const members = family.members
      .map((id) => byId.get(id))
      .filter((m): m is Investigation => m !== undefined);
    return {
      id: family.id,
      name: family.name,
      motif: family.motif,
      members: members.map(toItem),
      description: members[0]?.description ?? null,
    };
  }).filter((family) => family.members.length > 0);

  const sampleRecord = byId.get("flex") ?? reviewed[0];
  const sample: LandingRecordSample | null = sampleRecord
    ? {
        id: sampleRecord.id,
        label: label(sampleRecord),
        fields: (["oxygenMin", "oxygenMax", "pressureMin", "pressureMax", "airflowMin"] as const).map(
          (key) => ({ key, value: sampleRecord[key] }),
        ),
        verifiedBy: sampleRecord.verified[0]?.by ?? null,
        verifiedAt: sampleRecord.verified[0]?.at ?? null,
      }
    : null;

  return {
    reviewed: reviewed.length,
    investigations: active.length,
    sources: urls.size,
    sourceHosts: [...hostCounts.entries()]
      .map(([name, count]) => ({ host: name, count }))
      .sort((a, b) => b.count - a.count || a.host.localeCompare(b.host)),
    findingsByRecord: reviewed.map((investigation) => ({
      ...toItem(investigation),
      count: investigation.keyFindings.length,
    })),
    findings: reviewed.reduce((total, investigation) => total + investigation.keyFindings.length, 0),
    conditionsUnknown: conditionsTotal - conditionsStated,
    conditionsTotal,
    oxygen: {
      min: oxygenValues.length ? Math.min(...oxygenValues) : null,
      max: oxygenValues.length ? Math.max(...oxygenValues) : null,
      reporting: oxygenRows.filter((row) => row.min !== null || row.max !== null).length,
    },
    oxygenRows,
    byObjective: SAFETY_OBJECTIVES.map((objective) => ({
      objective,
      investigations: reviewed
        .filter((investigation) => investigation.safetyCategories.includes(objective))
        .map(toItem),
    })),
    untagged: reviewed.filter((investigation) => investigation.safetyCategories.length === 0).map(toItem),
    families,
    sample,
  };
}
