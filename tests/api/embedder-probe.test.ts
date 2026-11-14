import { afterEach, describe, expect, it, vi } from "vitest";

import type { Embedder } from "@/lib/embeddings";

const embed = vi.fn<Embedder["embed"]>();
let enabled = true;

vi.mock("@/lib/embeddings", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/embeddings")>()),
  getQueryEmbedder: (): Embedder | null =>
    enabled ? { version: "test-version", dimensions: 384, embed } : null,
}));

const { GET } = await import("@/app/api/evidence/search/route");
const call = () => GET(new Request("http://localhost/api/evidence/search"));

afterEach(() => {
  embed.mockReset();
  enabled = true;
});

describe("GET /api/evidence/search (embedding probe)", () => {
  it("reports a working embedder with its version and timing", async () => {
    embed.mockResolvedValue([new Array(384).fill(0.05)]);
    const response = await call();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      embeddings: "local",
      ready: true,
      version: "test-version",
      dimensions: 384,
    });
    expect(embed).toHaveBeenCalledWith(["embedding probe"], "query");
  });

  it("reports a failed model load as 503 without leaking the error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    embed.mockRejectedValue(new Error("Could not load from /var/task/models secret-detail"));
    const response = await call();
    expect(response.status).toBe(503);
    const text = await response.text();
    expect(JSON.parse(text)).toMatchObject({ embeddings: "local", ready: false });
    expect(text).not.toContain("/var/task");
    expect(text).not.toContain("secret-detail");
  });

  it("says embeddings are off without loading anything", async () => {
    enabled = false;
    const response = await call();
    expect(await response.json()).toEqual({ embeddings: "off", ready: false });
    expect(embed).not.toHaveBeenCalled();
  });
});
