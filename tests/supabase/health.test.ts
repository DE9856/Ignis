import { describe, expect, it } from "vitest";

import { checkDatabaseHealth, type HealthCheckClient } from "@/lib/supabase/health";

type Err = { code?: string; message: string } | null;
type TableResult = { error: Err; count: number | null };
type RpcResult = { data: unknown; error: Err };

function fakeClient(
  table: TableResult | Error,
  rpcs: { vector?: RpcResult; dimension?: RpcResult } = {},
): HealthCheckClient {
  const vector = rpcs.vector ?? { data: true, error: null };
  const dimension = rpcs.dimension ?? { data: 384, error: null };
  return {
    from: () => ({
      select: () => (table instanceof Error ? Promise.reject(table) : Promise.resolve(table)),
    }),
    rpc: (name) => Promise.resolve(name === "ignis_embedding_dimension" ? dimension : vector),
  };
}

const ok: TableResult = { error: null, count: 12 };

describe("checkDatabaseHealth", () => {
  it("reports NOT_CONFIGURED without attempting a connection", async () => {
    expect(await checkDatabaseHealth(null)).toMatchObject({
      status: "NOT_CONFIGURED",
      configured: false,
      reachable: null,
    });
  });

  it("reports READY for a healthy database", async () => {
    expect(await checkDatabaseHealth(fakeClient(ok))).toMatchObject({
      status: "READY",
      reachable: true,
      evidenceChunksTable: true,
      vectorExtension: true,
      embeddingDimension: 384,
      visibleChunkCount: 12,
      detail: null,
    });
  });

  it("maps a missing table to EVIDENCE_CHUNKS_TABLE_MISSING", async () => {
    const health = await checkDatabaseHealth(
      fakeClient({ error: { code: "PGRST205", message: "not found" }, count: null }),
    );
    expect(health).toMatchObject({ status: "EVIDENCE_CHUNKS_TABLE_MISSING", reachable: true });
  });

  it("maps a missing extension to PGVECTOR_UNAVAILABLE, ahead of the missing table", async () => {
    const health = await checkDatabaseHealth(
      fakeClient(
        { error: { code: "42P01", message: "relation missing" }, count: null },
        { vector: { data: false, error: null } },
      ),
    );
    expect(health.status).toBe("PGVECTOR_UNAVAILABLE");
  });

  it("maps network failures, bad keys and timeouts to CONFIGURED_BUT_UNREACHABLE", async () => {
    const down = await checkDatabaseHealth(fakeClient(new Error("fetch failed")));
    expect(down).toMatchObject({ status: "CONFIGURED_BUT_UNREACHABLE", configured: true });

    const denied = await checkDatabaseHealth(
      fakeClient({ error: { code: "401", message: "Invalid API key" }, count: null }),
    );
    expect(denied.status).toBe("CONFIGURED_BUT_UNREACHABLE");

    const slow: HealthCheckClient = {
      from: () => ({ select: () => new Promise(() => {}) }),
      rpc: () => new Promise(() => {}),
    };
    expect((await checkDatabaseHealth(slow, 20)).status).toBe("CONFIGURED_BUT_UNREACHABLE");
  });

  it("flags a wrong embedding dimension", async () => {
    const health = await checkDatabaseHealth(fakeClient(ok, { dimension: { data: 768, error: null } }));
    expect(health).toMatchObject({ status: "EMBEDDING_DIMENSION_MISMATCH", embeddingDimension: 768 });
  });

  it("still reports READY, with a note, when the dimension helper is not installed yet", async () => {
    const health = await checkDatabaseHealth(
      fakeClient(ok, { dimension: { data: null, error: { code: "PGRST202", message: "no function" } } }),
    );
    expect(health.status).toBe("READY");
    expect(health.embeddingDimension).toBeNull();
    expect(health.detail).toMatch(/dimension/i);
  });

  it("infers pgvector from the table when the helper function is absent", async () => {
    const health = await checkDatabaseHealth(
      fakeClient(ok, { vector: { data: null, error: { code: "PGRST202", message: "no function" } } }),
    );
    expect(health.vectorExtension).toBe(true);
  });

  it("never copies raw driver errors into the result", async () => {
    const leak = "https://secret-project.supabase.co key=sb_secret_123";
    const health = await checkDatabaseHealth(
      fakeClient({ error: { code: "500", message: leak }, count: null }),
    );
    expect(JSON.stringify(health)).not.toMatch(/secret/);
    const thrown = await checkDatabaseHealth(fakeClient(new Error(leak)));
    expect(JSON.stringify(thrown)).not.toMatch(/secret/);
  });
});
