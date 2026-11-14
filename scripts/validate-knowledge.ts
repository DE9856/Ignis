/**
 * npm run validate:knowledge [-- <knowledge-root>] [-- --strict] [-- --json] [-- --quiet]
 *
 * Structural validation of the OKF knowledge base. Exits 1 when any file has an
 * ERROR. Warnings do not fail the run unless --strict is given.
 * Does not judge scientific correctness.
 */
import path from "node:path";

import { defaultKnowledgeRoot } from "@/lib/okf/loader";
import { fileLevel, validateKnowledge } from "@/lib/okf/validation";

import { parseArgs } from "./lib/cli";

const { flags, positional } = parseArgs();
const root = positional[0] ? path.resolve(positional[0]) : defaultKnowledgeRoot();
const report = validateKnowledge(root);

if (flags.has("json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Validating ${path.relative(process.cwd(), root) || "."}\n`);

  for (const file of report.files) {
    const level = fileLevel(file);
    if (level === "PASS" && flags.has("quiet")) continue;
    console.log(`${level.padEnd(5)} ${file.filePath}`);
    for (const finding of file.findings) {
      console.log(`      ${finding.level === "ERROR" ? "error" : "warn "}  ${finding.message}`);
    }
  }

  if (report.files.length === 0) {
    console.log("No knowledge files found. Add records under knowledge/<folder>/.");
  }
  if (report.skippedLocalFiles.length > 0) {
    console.log(
      `\nSkipped ${report.skippedLocalFiles.length} local synthetic file(s) (zz-local-*), which are never committed.`,
    );
  }

  const { files, valid, withWarnings, withErrors } = report.summary;
  console.log(`\nSummary:\n`);
  console.log(`Files:    ${files}`);
  console.log(`Valid:    ${valid}`);
  console.log(`Warnings: ${withWarnings}`);
  console.log(`Errors:   ${withErrors}`);
}

const failed = report.summary.withErrors > 0 || (flags.has("strict") && report.summary.withWarnings > 0);
process.exit(failed ? 1 : 0);
