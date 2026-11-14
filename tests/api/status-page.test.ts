import { afterEach, describe, expect, it, vi } from "vitest";

import DevStatusPage from "@/app/dev/status/page";

afterEach(() => vi.unstubAllEnvs());

describe("/dev/status", () => {
  it("answers 404 in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    // Next's notFound() throws an error carrying the 404 fallback digest.
    expect(() => DevStatusPage()).toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND/);
  });

  it("renders in development without secrets", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "secret-service-key");
    expect(JSON.stringify(DevStatusPage())).not.toContain("secret-service-key");
  });
});
