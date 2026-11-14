import { getSupabaseClient } from "./client";
import { EVIDENCE_CHUNKS_TABLE } from "./types";

/**
 * On-demand database health check. Never called during page load; used by
 * `npm run check:db`, `/api/health?deep=1` and the dev status page.
 *
 * `null` means "could not be determined", which is different from `false`.
 */
export interface DatabaseHealth {
  configured: boolean;
  reachable: boolean | null;
  evidenceChunksTable: boolean | null;
  vectorExtension: boolean | null;
  /** Row count visible to the anon key (verified chunks only, by row-level security). */
  visibleChunkCount: number | null;
  /** Short developer-facing note. Never contains a key. */
  detail: string | null;
}

interface QueryError {
  code?: string;
  message: string;
}

/** The small part of the Supabase client this check needs. Easy to fake in tests. */
export interface HealthCheckClient {
  from(table: string): {
    select(
      columns: string,
      options: { count: "exact"; head: true },
    ): PromiseLike<{ error: QueryError | null; count: number | null }>;
  };
  rpc(name: string): PromiseLike<{ data: unknown; error: QueryError | null }>;
}

/** PostgREST / Postgres codes that mean "the server answered, the object is missing". */
const MISSING_OBJECT_CODES = new Set(["42P01", "PGRST205", "PGRST202", "42883"]);

const NOT_CONFIGURED: DatabaseHealth = {
  configured: false,
  reachable: null,
  evidenceChunksTable: null,
  vectorExtension: null,
  visibleChunkCount: null,
  detail: "Supabase is not configured. The app runs on local knowledge files.",
};

export async function checkDatabaseHealth(
  client: HealthCheckClient | null = getSupabaseClient() as unknown as HealthCheckClient | null,
): Promise<DatabaseHealth> {
  if (!client) return NOT_CONFIGURED;

  const health: DatabaseHealth = {
    configured: true,
    reachable: null,
    evidenceChunksTable: null,
    vectorExtension: null,
    visibleChunkCount: null,
    detail: null,
  };

  try {
    const table = await client.from(EVIDENCE_CHUNKS_TABLE).select("chunk_id", { count: "exact", head: true });
    if (table.error === null) {
      health.reachable = true;
      health.evidenceChunksTable = true;
      health.visibleChunkCount = table.count;
    } else if (table.error.code && MISSING_OBJECT_CODES.has(table.error.code)) {
      health.reachable = true;
      health.evidenceChunksTable = false;
      health.detail = "evidence_chunks table not found. Apply supabase/migrations/.";
    } else {
      health.reachable = false;
      health.detail = `Database query failed: ${table.error.message}`;
      return health;
    }

    const extension = await client.rpc("ignis_vector_available");
    if (extension.error === null) {
      health.vectorExtension = extension.data === true;
    } else if (health.evidenceChunksTable) {
      // The table has a vector column, so it cannot exist without the extension.
      health.vectorExtension = true;
    }
  } catch (cause) {
    health.reachable = false;
    health.detail = `Database unreachable: ${cause instanceof Error ? cause.message : "network error"}`;
  }

  return health;
}
