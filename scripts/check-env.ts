/**
 * npm run check:env
 *
 * Reports which environment variables are usable. Prints names and states,
 * never values. Exits 1 only for a real misconfiguration (an invalid value or
 * a secret exposed to the browser); a missing optional variable is fine.
 */
import { findEnvironmentProblems, inspectEnvironment } from "@/lib/core/env";

import { loadLocalEnv, pad } from "./lib/cli";

loadLocalEnv();

const reports = inspectEnvironment();
const problems = findEnvironmentProblems();

console.log(`${pad("Variable", 34)}${pad("Requirement", 13)}${pad("State", 13)}Exposure`);
for (const report of reports) {
  console.log(
    `${pad(report.name, 34)}${pad(report.requirement, 13)}${pad(report.state, 13)}${report.exposure}`,
  );
  if (report.problem) console.log(`    problem: value ${report.problem}`);
}

console.log("");
if (reports.every((report) => report.state === "UNAVAILABLE")) {
  console.log("Nothing is configured. That is fine: the app runs on local knowledge files.");
  console.log("To connect Supabase, copy .env.example to .env.local and fill it in.");
}
for (const problem of problems) console.log(`PROBLEM  ${problem}`);

const failed =
  problems.length > 0 ||
  reports.some(
    (report) =>
      report.state === "INVALID" || (report.requirement === "REQUIRED" && report.state !== "CONFIGURED"),
  );
if (!failed) console.log("Environment OK.");
process.exit(failed ? 1 : 0);
