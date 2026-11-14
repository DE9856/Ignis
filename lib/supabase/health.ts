import { EMBEDDING_DIMENSIONS } from "@/lib/retrieval/types";

import { getSupabaseClient } from "./client";
import { EVIDENCE_CHUNKS_TABLE } from "./types";

/**
 * On-demand database health check. Never called during page load; used by
 * `npm run check:db`, `/api/health?deep=1` and the dev status page.
 *
 * Everything returned here is safe to show: states, booleans, counts and fixed
 * sentences. Raw driver errors are never copied into the result, because they
 * can contain hostnames or request details.
 *
 * `null` means "could not be determined", which is different from `false`.
 */
export type DatabaseStatus =
  | "NOT_CONFIGURED"
  | "CONFIGURED_BUT_UNREACHABLE"
  | "KEY_REJECTED"
  | "CONNECTED"
  | "PGVECTOR_UNAVAILABLE"
  | "EVIDENCE_CHUNKS_TABLE_MISSING"
  | "EMBEDDING_DIMENSION_MISMATCH"
  | "READY";

export interface DatabaseHealth {
  /** Single summary state. */
  status: DatabaseStatus;
  configured: boolean;
  reachable: boolean | null;
  evidenceChunksTable: boolean | null;
  vectorExtension: boolean | null;
  /** Declared size of the embedding column, when it could be read. */
  embeddingDimension: number | null;
  /** Row count visible to the anon key (verified chunks only, by row-level security). */
  visibleChunkCount: number | null;
  /** Short fixed sentence for developers. Never contains a key, URL or raw error. */
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
    ): PromiseLike<{ error: QueryError | null; count: number | null; status?: number }>;
  };
  rpc(name: string): PromiseLike<{ data: unknown; error: QueryError | null }>;
}

/** PostgREST / Postgres codes that mean "the server answered, the object is missing". */
const MISSING_OBJECT_CODES = new Set(["42P01", "PGRST205", "PGRST202", "42883"]);

/** The server answered and refused the credentials: HTTP 401/403, or PostgREST's JWT and key errors. */
function isKeyRejected(error: QueryError, httpStatus: number | undefined): boolean {
  return (
    httpStatus === 401 ||
    httpStatus === 403 ||
    error.code === "401" ||
    error.code === "PGRST301" ||
    error.code === "PGRST302" ||
    /invalid api key|no api key|jwt|apikey/i.test(error.message)
  );
}

const DEFAULT_TIMEOUT_MS = 8000;

const DETAILS = {
  notConfigured: "Supabase is not configured. The app runs on local knowledge files.",
  unreachable: "Supabase is configured but could not be reached. Check the project URL, key and network.",
  keyRejected:
    "Supabase answered but rejected the key. Check that the URL and both keys come from the same project and were copied in full.",
  tableMissing: "evidence_chunks table not found. Apply supabase/migrations/.",
  pgvector: "The pgvector extension is not installed. Apply supabase/migrations/.",
  dimension: `The embedding column is not vector(${EMBEDDING_DIMENSIONS}). Re-apply the migration.`,
  dimensionUnknown:
    "Embedding dimension could not be read. Re-apply the latest migration to enable that check.",
} as const;

function emptyHealth(status: DatabaseStatus, configured: boolean, detail: string | null): DatabaseHealth {
  return {
    status,
    configured,
    reachable: null,
    evidenceChunksTable: null,
    vectorExtension: null,
    embeddingDimension: null,
    visibleChunkCount: null,
    detail,
  };
}

function withTimeout<T>(work: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    Promise.resolve(work).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function checkDatabaseHealth(
  client: HealthCheckClient | null = getSupabaseClient() as unknown as HealthCheckClient | null,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<DatabaseHealth> {
  if (!client) return emptyHealth("NOT_CONFIGURED", false, DETAILS.notConfigured);

  const health = emptyHealth("CONFIGURED_BUT_UNREACHABLE", true, DETAILS.unreachable);

  try {
    const table = await withTimeout(
      client.from(EVIDENCE_CHUNKS_TABLE).select("chunk_id", { count: "exact", head: true }),
      timeoutMs,
    );
    if (table.error === null) {
      health.reachable = true;
      health.evidenceChunksTable = true;
      health.visibleChunkCount = table.count;
    } else if (table.error.code && MISSING_OBJECT_CODES.has(table.error.code)) {
      health.reachable = true;
      health.evidenceChunksTable = false;
    } else if (isKeyRejected(table.error, table.status)) {
      return { ...health, status: "KEY_REJECTED", reachable: true, detail: DETAILS.keyRejected };
    } else {
      // Network policy, server error: "could not use it".
      return health;
    }

    const extension = await withTimeout(client.rpc("ignis_vector_available"), timeoutMs);
    if (extension.error === null) {
      health.vectorExtension = extension.data === true;
    } else if (health.evidenceChunksTable) {
      // The table has a vector column, so it cannot exist without the extension.
      health.vectorExtension = true;
    }

    if (health.evidenceChunksTable) {
      const dimension = await withTimeout(client.rpc("ignis_embedding_dimension"), timeoutMs);
      if (dimension.error === null && typeof dimension.data === "number") {
        health.embeddingDimension = dimension.data;
      }
    }
  } catch {
    return health; // unreachable or timed out; the summary state already says so
  }

  if (health.vectorExtension === false) {
    health.status = "PGVECTOR_UNAVAILABLE";
    health.detail = DETAILS.pgvector;
  } else if (health.evidenceChunksTable === false) {
    health.status = "EVIDENCE_CHUNKS_TABLE_MISSING";
    health.detail = DETAILS.tableMissing;
  } else if (health.embeddingDimension !== null && health.embeddingDimension !== EMBEDDING_DIMENSIONS) {
    health.status = "EMBEDDING_DIMENSION_MISMATCH";
    health.detail = DETAILS.dimension;
  } else {
    health.status = "READY";
    health.detail = health.embeddingDimension === null ? DETAILS.dimensionUnknown : null;
  }
  return health;
}
