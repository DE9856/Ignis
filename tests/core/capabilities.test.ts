import { afterEach, describe, expect, it, vi } from "vitest";

import { areDevMocksEnabled, getCapabilities } from "@/lib/core/capabilities";
import { DEGRADED_MESSAGES, getDegradedNotices } from "@/lib/core/degraded";
import { ERROR_MESSAGES, IgnisError, toUserFacingError } from "@/lib/core/errors";

import { makeInvestigation } from "../helpers";

afterEach(() => vi.unstubAllEnvs());

function clearEnv() {
  for (const name of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPTIONAL_LLM_API_KEY",
    "NEXT_PUBLIC_IGNIS_DEV_MOCKS",
  ]) {
    vi.stubEnv(name, "");
  }
}

describe("getCapabilities", () => {
  it("reports everything off, without throwing, when nothing is configured", () => {
    clearEnv();
    expect(getCapabilities()).toEqual({
      supabaseConfigured: false,
      // The retriever is installed in code; without Supabase it is still not enabled.
      retrievalImplemented: true,
      llmConfigured: false,
      supabaseEnabled: false,
      ingestionEnabled: false,
      retrievalEnabled: false,
      llmEnabled: false,
      verifiedKnowledgeAvailable: false,
      // The approved methodology is installed in code, not configured by environment.
      methodologyConfigured: true,
      devMocksEnabled: false,
    });
  });

  it("needs both Supabase values for retrieval, and does not claim synthesis that is not built", () => {
    clearEnv();
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.invalid");
    expect(getCapabilities().supabaseEnabled).toBe(false);

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service");
    vi.stubEnv("OPTIONAL_LLM_API_KEY", "test-llm");
    const capabilities = getCapabilities();
    expect(capabilities.supabaseEnabled).toBe(true);
    expect(capabilities.supabaseConfigured).toBe(true);
    expect(capabilities.llmConfigured).toBe(true); // key present...
    expect(capabilities.retrievalImplemented).toBe(true);
    expect(capabilities.ingestionEnabled).toBe(true);
    expect(capabilities.retrievalEnabled).toBe(true); // implemented in code AND Supabase configured
    expect(capabilities.llmEnabled).toBe(false);
  });

  it("sees verified knowledge only when a human-reviewed record is loaded", () => {
    clearEnv();
    const draft = makeInvestigation({ status: "draft", verified: [] });
    expect(getCapabilities([draft]).verifiedKnowledgeAvailable).toBe(false);
    expect(getCapabilities([draft, makeInvestigation()]).verifiedKnowledgeAvailable).toBe(true);
  });
});

describe("areDevMocksEnabled", () => {
  it("requires an explicit opt-in", () => {
    clearEnv();
    expect(areDevMocksEnabled()).toBe(false);
    vi.stubEnv("NEXT_PUBLIC_IGNIS_DEV_MOCKS", "1");
    expect(areDevMocksEnabled()).toBe(true);
  });

  it("is always off in production, even with the opt-in set", () => {
    vi.stubEnv("NEXT_PUBLIC_IGNIS_DEV_MOCKS", "1");
    vi.stubEnv("NODE_ENV", "production");
    expect(areDevMocksEnabled()).toBe(false);
  });
});

describe("getDegradedNotices", () => {
  it("gives each page the notices for its area", () => {
    clearEnv();
    const capabilities = getCapabilities();
    expect(getDegradedNotices(capabilities, "retrieval").map((notice) => notice.message)).toEqual([
      DEGRADED_MESSAGES.noRetrieval,
    ]);
    expect(getDegradedNotices(capabilities, "scoring").map((notice) => notice.reason)).toEqual([
      "noVerifiedKnowledge",
    ]);
    expect(
      getDegradedNotices({ ...capabilities, methodologyConfigured: false }, "scoring").map(
        (notice) => notice.reason,
      ),
    ).toEqual(["noMethodology", "noVerifiedKnowledge"]);
  });

  it("is empty when everything is available", () => {
    const all = {
      supabaseConfigured: true,
      retrievalImplemented: true,
      llmConfigured: true,
      supabaseEnabled: true,
      ingestionEnabled: true,
      retrievalEnabled: true,
      llmEnabled: true,
      verifiedKnowledgeAvailable: true,
      methodologyConfigured: true,
      devMocksEnabled: false,
    };
    expect(getDegradedNotices(all)).toEqual([]);
    expect(getDegradedNotices({ ...all, devMocksEnabled: true }, "retrieval").map((n) => n.reason)).toEqual([
      "devMocks",
    ]);
  });
});

describe("errors", () => {
  it("keeps internal detail out of production output", () => {
    const error = new IgnisError("OKF_PARSE_ERROR", { detail: "knowledge/x.md line 3" });
    expect(toUserFacingError(error, false)).toEqual({
      code: "OKF_PARSE_ERROR",
      message: ERROR_MESSAGES.OKF_PARSE_ERROR,
      detail: null,
    });
    expect(toUserFacingError(error, true).detail).toBe("knowledge/x.md line 3");
  });

  it("turns unknown errors into a generic message without a stack trace", () => {
    const output = toUserFacingError(new Error("boom at /srv/app/file.ts:1"), false);
    expect(output).toEqual({ code: "UNEXPECTED", message: ERROR_MESSAGES.UNEXPECTED, detail: null });
    expect(JSON.stringify(toUserFacingError(new Error("boom"), true))).not.toMatch(/\bat\s.+:\d+/);
  });
});
