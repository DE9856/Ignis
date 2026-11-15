import { getVerificationTier } from "@/lib/domain/provenance";
import type { KnowledgeBase } from "@/lib/okf/loader";
import { parseBulletList } from "@/lib/okf/parser";

/**
 * "What the evidence informs": the fire-safety controls and equipment that the
 * reviewed investigations bear on, read from the concept records.
 *
 * The grouping (which concept stands for which control area) is the team's;
 * every statement shown comes from the concept record's "NASA Evidence"
 * section, which cites NASA sources. Concept records are shown with their own
 * review state, and only human-reviewed investigations are linked.
 */

interface ControlArea {
  id: string;
  title: string;
  /** What decisions this area covers. Category description, not a finding. */
  question: string;
  conceptId: string;
}

const CONTROL_AREAS: ControlArea[] = [
  {
    id: "materials",
    title: "Materials and flammability tests",
    question: "Which cabin materials to accept, and whether ground tests predict how they burn in space.",
    conceptId: "material-flammability-screening",
  },
  {
    id: "atmosphere",
    title: "Cabin atmosphere and ignition control",
    question: "How much oxygen a cabin can carry, and how ignition sources are kept apart from fuel.",
    conceptId: "prevention",
  },
  {
    id: "detectors",
    title: "Smoke and fire detectors",
    question: "What a detector should sense, where it should sit, and how fast it can alarm.",
    conceptId: "smoke-detection",
  },
  {
    id: "suppression",
    title: "Extinguishers and ventilation response",
    question: "Which agent puts a fire out, how to apply it, and what turning off airflow does.",
    conceptId: "suppression",
  },
];

export interface ControlAreaView {
  id: string;
  title: string;
  question: string;
  conceptId: string;
  conceptTitle: string;
  conceptReviewed: boolean;
  /** From the concept's "NASA Evidence" section, in order. */
  statements: string[];
  /** Human-reviewed investigations the concept links to. */
  investigations: { id: string; label: string }[];
}

/** One entry per control area whose concept record exists and is not deprecated. */
export function buildControlAreas(knowledge: KnowledgeBase): ControlAreaView[] {
  const reviewed = new Map(
    knowledge.investigations
      .filter((investigation) => getVerificationTier(investigation) === "HUMAN_REVIEWED")
      .map((investigation) => [investigation.id, investigation.shortTitle ?? investigation.title]),
  );

  return CONTROL_AREAS.flatMap((area) => {
    const concept = knowledge.concepts.find((document) => document.id === area.conceptId);
    if (!concept || concept.metadata.status === "deprecated") return [];
    const evidence = concept.sections.find((section) => section.slug === "nasa-evidence");
    const investigations = concept.metadata.related
      .map((link) => link.id)
      .filter((id) => id.startsWith("investigations/"))
      .map((id) => id.slice("investigations/".length))
      .flatMap((id) => {
        const label = reviewed.get(id);
        return label ? [{ id, label }] : [];
      });

    return [
      {
        id: area.id,
        title: area.title,
        question: area.question,
        conceptId: concept.id,
        conceptTitle: concept.metadata.title,
        conceptReviewed: getVerificationTier(concept.metadata) === "HUMAN_REVIEWED",
        statements: parseBulletList(evidence?.content ?? ""),
        investigations,
      },
    ];
  });
}
