import { describe, expect, it } from "vitest";

import {
  ENV_SPECS,
  findEnvironmentProblems,
  getLlmState,
  getSupabaseState,
  inspectEnvironment,
} from "@/lib/core/env";

const state = (env: Record<string, string>, name: string) =>
  inspectEnvironment(env).find((report) => report.name === name)?.state;

describe("inspectEnvironment", () => {
  it("treats every variable as optional, so an empty environment is fine", () => {
    expect(ENV_SPECS.every((spec) => spec.requirement === "OPTIONAL")).toBe(true);
    expect(inspectEnvironment({}).every((report) => report.state === "UNAVAILABLE")).toBe(true);
    expect(findEnvironmentProblems({})).toEqual([]);
  });

  it("classifies configured, blank and invalid values", () => {
    expect(state({ NEXT_PUBLIC_SUPABASE_URL: "https://test.invalid" }, "NEXT_PUBLIC_SUPABASE_URL")).toBe(
      "CONFIGURED",
    );
    expect(state({ NEXT_PUBLIC_SUPABASE_URL: "   " }, "NEXT_PUBLIC_SUPABASE_URL")).toBe("UNAVAILABLE");
    expect(state({ NEXT_PUBLIC_SUPABASE_URL: "not a url" }, "NEXT_PUBLIC_SUPABASE_URL")).toBe("INVALID");
    expect(state({ NEXT_PUBLIC_SUPABASE_URL: "http://test.invalid" }, "NEXT_PUBLIC_SUPABASE_URL")).toBe(
      "INVALID",
    );
  });

  it("never includes a value in the report", () => {
    const secret = "test-secret-value-123";
    const text = JSON.stringify(
      inspectEnvironment({ SUPABASE_SERVICE_ROLE_KEY: secret, OPTIONAL_LLM_API_KEY: secret }),
    );
    expect(text).not.toContain(secret);
  });

  it("marks the service-role and LLM keys as server-only", () => {
    const exposure = Object.fromEntries(ENV_SPECS.map((spec) => [spec.name, spec.exposure]));
    expect(exposure.SUPABASE_SERVICE_ROLE_KEY).toBe("server");
    expect(exposure.OPTIONAL_LLM_API_KEY).toBe("server");
  });
});

describe("findEnvironmentProblems", () => {
  it("flags a service-role key exposed under a NEXT_PUBLIC_ name", () => {
    const problems = findEnvironmentProblems({
      NEXT_PUBLIC_SUPABASE_URL: "https://test.invalid",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-service-key",
      SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
    });
    expect(problems.join(" ")).toMatch(/holds the service-role key/);
  });

  it("flags secret-looking NEXT_PUBLIC_ names and half-configured Supabase", () => {
    expect(findEnvironmentProblems({ NEXT_PUBLIC_SERVICE_ROLE_KEY: "x" }).join(" ")).toMatch(
      /looks like a secret/,
    );
    expect(findEnvironmentProblems({ NEXT_PUBLIC_SUPABASE_URL: "https://test.invalid" }).join(" ")).toMatch(
      /Set both/,
    );
  });
});

describe("service states", () => {
  const ok = { NEXT_PUBLIC_SUPABASE_URL: "https://test.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon" };

  it("distinguishes Supabase configured from not configured, without throwing", () => {
    expect(getSupabaseState({})).toBe("SUPABASE_NOT_CONFIGURED");
    expect(getSupabaseState({ NEXT_PUBLIC_SUPABASE_URL: "https://test.invalid" })).toBe(
      "SUPABASE_NOT_CONFIGURED",
    );
    expect(getSupabaseState(ok)).toBe("SUPABASE_CONFIGURED");
  });

  it("distinguishes LLM configured from not configured", () => {
    expect(getLlmState({})).toBe("LLM_NOT_CONFIGURED");
    expect(getLlmState({ OPTIONAL_LLM_API_KEY: "test-llm" })).toBe("LLM_CONFIGURED");
  });
});
