/**
 * npm run inspect:knowledge [-- <knowledge-root>] [-- --json]
 *
 * Progress statistics for the knowledge base. Prints counts, never content.
 * Always exits 0; use validate:knowledge to gate a merge.
 */
import path from "node:path";

import { summarizeKnowledge } from "@/lib/integration/knowledge";
import { defaultKnowledgeRoot, loadKnowledgeBase } from "@/lib/okf/loader";
import { isVerified } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";
import { validateKnowledge } from "@/lib/okf/validation";

import { pad, parseArgs } from "./lib/cli";

const { flags, positional } = parseArgs();
const root = positional[0] ? path.resolve(positional[0]) : defaultKnowledgeRoot();

const knowledge = loadKnowledgeBase(root);
const summary = summarizeKnowledge(knowledge);
const validation = validateKnowledge(root);
const sections = validation.files.reduce((total, file) => total + file.sectionCount, 0);

/** Condition fields an investigation can state. Counted to show how complete a record is. */
const CONDITION_FIELDS: (keyof Investigation)[] = [
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
];

const investigations = knowledge.investigations.map((investigation) => ({
  id: investigation.id,
  status: investigation.status,
  humanReviewed: isVerified(investigation),
  conditionsStated: CONDITION_FIELDS.filter((field) => investigation[field] !== null).length,
  conditionsTotal: CONDITION_FIELDS.length,
  sources: investigation.sources.length,
  findings: investigation.keyFindings.length,
  safetyCategories: investigation.safetyCategories,
}));

if (flags.has("json")) {
  console.log(JSON.stringify({ summary, sections, investigations, validation: validation.summary }, null, 2));
  process.exit(0);
}

const row = (label: string, value: number | string) => console.log(`${pad(label, 26)}${value}`);

console.log(`Knowledge base: ${path.relative(process.cwd(), root) || "."}\n`);
row("Total concepts", summary.total);
row("  Investigations", summary.investigations);
row("  Hardware concepts", summary.hardware);
row("  Concept pages", summary.concepts);
row("  Mission concepts", summary.missions);
console.log("");
row("Human reviewed", summary.humanReviewed);
row("  Draft", summary.byStatus.draft);
row("  Stable", summary.byStatus.stable);
row("  Deprecated", summary.byStatus.deprecated);
console.log("");
row("With sources", summary.withSources);
row("Without sources", summary.withoutSources);
row("Sections", sections);
console.log("");
row("Files with errors", validation.summary.withErrors);
row("Files with warnings", validation.summary.withWarnings);

if (investigations.length > 0) {
  console.log(
    `\n${pad("Investigation", 34)}${pad("Status", 12)}${pad("Reviewed", 10)}${pad("Conditions", 12)}${pad("Sources", 9)}Findings`,
  );
  for (const item of investigations) {
    console.log(
      `${pad(item.id, 34)}${pad(item.status, 12)}${pad(item.humanReviewed ? "yes" : "no", 10)}${pad(`${item.conditionsStated}/${item.conditionsTotal}`, 12)}${pad(item.sources, 9)}${item.findings}`,
    );
  }
  console.log(
    "\nConditions = condition fields the record states. A null is a valid answer when the source is silent.",
  );
} else {
  console.log("\nNo investigation records yet.");
}

if (validation.summary.withErrors > 0) {
  console.log(
    "\nSome files have errors and are excluded from the counts above. Run: npm run validate:knowledge",
  );
}
