/**
 * npm run check:db [-- --strict]
 *
 * Checks that Supabase is reachable and the evidence schema is in place.
 * Prints a state and fixed explanations; never a key, URL or raw error.
 *
 * Exit codes:
 *   0  READY, or Supabase is not configured (it is optional)
 *   1  configured but not READY (unreachable, pgvector or table missing, wrong dimension)
 *   --strict also exits 1 when Supabase is not configured, for deploy gates.
 */
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/retrieval/types";
import { checkDatabaseHealth } from "@/lib/supabase/health";

import { loadLocalEnv, pad, parseArgs } from "./lib/cli";

loadLocalEnv();

const strict = parseArgs().flags.has("strict");
const show = (value: boolean | null) => (value === null ? "unknown" : value ? "yes" : "no");

checkDatabaseHealth()
  .then((health) => {
    console.log(`${pad("Status", 28)}${health.status}`);
    console.log(`${pad("Configured", 28)}${show(health.configured)}`);
    console.log(`${pad("Reachable", 28)}${show(health.reachable)}`);
    console.log(`${pad("pgvector extension", 28)}${show(health.vectorExtension)}`);
    console.log(`${pad("evidence_chunks table", 28)}${show(health.evidenceChunksTable)}`);
    console.log(
      `${pad("Embedding dimension", 28)}${health.embeddingDimension ?? "unknown"} (expected ${EMBEDDING_DIMENSIONS}, ${EMBEDDING_MODEL})`,
    );
    console.log(`${pad("Verified chunks visible", 28)}${health.visibleChunkCount ?? "unknown"}`);
    if (health.detail) console.log(`\n${health.detail}`);
    if (health.status === "READY" && health.visibleChunkCount === 0) {
      console.log("\nThe index is empty. That is expected until ingestion (Member 5) has run.");
    }

    const failed = health.status === "NOT_CONFIGURED" ? strict : health.status !== "READY";
    process.exit(failed ? 1 : 0);
  })
  .catch(() => {
    console.log("Status                      CONFIGURED_BUT_UNREACHABLE");
    process.exit(1);
  });
