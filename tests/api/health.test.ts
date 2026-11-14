import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/health/route";

// Stand-in for the network: a client whose every call fails with a leaky message.
vi.mock("@/lib/supabase/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/supabase/client")>()),
  getSupabaseClient: () => ({
    from: () => ({
      select: () => Promise.reject(new Error("fetch failed https://secret-project.supabase.invalid")),
    }),
    rpc: () => Promise.reject(new Error("secret-service-key")),
  }),
}));

afterEach(() => vi.unstubAllEnvs());

const call = (query = "") => GET(new NextRequest(`http://localhost/api/health${query}`));

describe("GET /api/health", () => {
  it("answers with booleans and counts when nothing is configured", async () => {
    for (const name of [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "OPTIONAL_LLM_API_KEY",
    ]) {
      vi.stubEnv(name, "");
    }
    const response = await call();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      database: { configured: false },
      retrieval: { implemented: false, configured: false },
      llm: { configured: false },
      // The approved methodology is installed in code, not configured by environment.
      methodology: { configured: true },
    });
    expect(body.knowledge).toMatchObject({ loaded: true });
    expect(body.database.check).toBeUndefined(); // no live request unless ?deep=1
  });

  it("deep check against a failing database reports a state and does not fail", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const body = await (await call("?deep=1")).json();
    // The mocked client always fails, so this is the unreachable path; the
    // not-configured path is covered in tests/supabase/health.test.ts.
    expect(body.database.check.status).toBe("CONFIGURED_BUT_UNREACHABLE");
  });

  it("never echoes secrets, URLs or filesystem paths", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://secret-project.supabase.invalid");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "secret-anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "secret-service-key");
    vi.stubEnv("OPTIONAL_LLM_API_KEY", "secret-llm-key");
    const text = await (await call("?deep=1")).text();
    expect(text).not.toMatch(/secret/);
    expect(text).not.toContain(process.cwd());
    expect(JSON.parse(text).database.configured).toBe(true);
  });
});
