/**
 * npm run check:db
 *
 * Checks that Supabase is reachable and the schema is in place.
 * Exits 0 when Supabase is simply not configured (it is optional), and 1 when
 * it is configured but not usable.
 */
import { checkDatabaseHealth } from "@/lib/supabase/health";

import { loadLocalEnv, pad } from "./lib/cli";

loadLocalEnv();

const show = (value: boolean | null) => (value === null ? "unknown" : value ? "yes" : "no");

checkDatabaseHealth().then((health) => {
  console.log(`${pad("Configured", 26)}${show(health.configured)}`);
  console.log(`${pad("Reachable", 26)}${show(health.reachable)}`);
  console.log(`${pad("evidence_chunks table", 26)}${show(health.evidenceChunksTable)}`);
  console.log(`${pad("pgvector extension", 26)}${show(health.vectorExtension)}`);
  console.log(`${pad("Verified chunks visible", 26)}${health.visibleChunkCount ?? "unknown"}`);
  if (health.detail) console.log(`\n${health.detail}`);

  const usable = health.reachable === true && health.evidenceChunksTable === true;
  process.exit(health.configured && !usable ? 1 : 0);
});
