import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseClient, getSupabasePublicConfig } from "@/lib/supabase/client";
import { getSupabaseServiceClient, getSupabaseStatus } from "@/lib/supabase/server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function setEnv(values: Record<string, string>) {
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    vi.stubEnv(name, values[name] ?? "");
  }
}

describe("Supabase clients without configuration", () => {
  it("return null instead of throwing", () => {
    setEnv({});
    expect(getSupabasePublicConfig()).toBeNull();
    expect(getSupabaseClient()).toBeNull();
    expect(getSupabaseServiceClient()).toBeNull();
    expect(getSupabaseStatus()).toEqual({ publicConfigured: false, serviceRoleConfigured: false });
  });

  it("treat a malformed or insecure URL as not configured", () => {
    setEnv({ NEXT_PUBLIC_SUPABASE_URL: "not a url", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon" });
    expect(getSupabaseClient()).toBeNull();
    setEnv({
      NEXT_PUBLIC_SUPABASE_URL: "http://example.invalid",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon",
    });
    expect(getSupabasePublicConfig()).toBeNull();
  });
});

describe("service-role isolation", () => {
  const base = {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.invalid",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon",
  };

  it("needs the service-role key; the anon key alone yields no admin client", () => {
    setEnv(base);
    expect(getSupabaseServiceClient()).toBeNull();
    setEnv({ ...base, SUPABASE_SERVICE_ROLE_KEY: "test-service" });
    expect(getSupabaseServiceClient()).not.toBeNull();
  });

  it("refuses a service-role key that equals the public anon key", () => {
    setEnv({ ...base, SUPABASE_SERVICE_ROLE_KEY: "test-anon" });
    expect(getSupabaseServiceClient()).toBeNull();
  });

  it("refuses to run in a browser", () => {
    setEnv({ ...base, SUPABASE_SERVICE_ROLE_KEY: "test-service" });
    vi.stubGlobal("window", {});
    expect(() => getSupabaseServiceClient()).toThrow(/browser/);
  });
});
