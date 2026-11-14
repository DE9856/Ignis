import { describe, expect, it } from "vitest";

import { checkDatabaseHealth, type HealthCheckClient } from "@/lib/supabase/health";

type TableResult = { error: { code?: string; message: string } | null; count: number | null };
type RpcResult = { data: unknown; error: { code?: string; message: string } | null };

function fakeClient(table: TableResult | Error, rpc: RpcResult): HealthCheckClient {
  return {
    from: () => ({
      select: () => (table instanceof Error ? Promise.reject(table) : Promise.resolve(table)),
    }),
    rpc: () => Promise.resolve(rpc),
  };
}

describe("checkDatabaseHealth", () => {
  it("reports not configured without attempting a connection", async () => {
    expect(await checkDatabaseHealth(null)).toMatchObject({ configured: false, reachable: null });
  });

  it("reports a healthy database", async () => {
    const health = await checkDatabaseHealth(
      fakeClient({ error: null, count: 12 }, { data: true, error: null }),
    );
    expect(health).toMatchObject({
      configured: true,
      reachable: true,
      evidenceChunksTable: true,
      vectorExtension: true,
      visibleChunkCount: 12,
    });
  });

  it("distinguishes a missing table from an unreachable database", async () => {
    const missing = await checkDatabaseHealth(
      fakeClient(
        { error: { code: "PGRST205", message: "not found" }, count: null },
        { data: false, error: null },
      ),
    );
    expect(missing).toMatchObject({ reachable: true, evidenceChunksTable: false, vectorExtension: false });

    const down = await checkDatabaseHealth(
      fakeClient(new Error("fetch failed"), { data: null, error: null }),
    );
    expect(down).toMatchObject({ configured: true, reachable: false, evidenceChunksTable: null });
  });

  it("infers pgvector from the table when the helper function is absent", async () => {
    const health = await checkDatabaseHealth(
      fakeClient(
        { error: null, count: 0 },
        { data: null, error: { code: "PGRST202", message: "no function" } },
      ),
    );
    expect(health.vectorExtension).toBe(true);
  });
});
