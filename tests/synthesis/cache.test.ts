import { describe, expect, it, vi } from "vitest";

import { createMemoryStore } from "@/lib/retrieval/memory-store";
import type { EvidenceChunk } from "@/lib/retrieval/types";
import { createSummaryCache, normalizeQuestion, summaryCacheKey } from "@/lib/synthesis/cache";
import { LlmError } from "@/lib/synthesis/groq";
import { synthesize, type ChatFunction } from "@/lib/synthesis/server";
import type { SynthesisResponse } from "@/lib/synthesis/types";
import { VERIFIER_PROMPT } from "@/lib/synthesis/verify";

import { TEST_CHUNK_ALPHA_CONDITIONS, TEST_CHUNK_ALPHA_OBJECTIVE } from "../fixtures";

const CONDITIONS: EvidenceChunk = {
  ...TEST_CHUNK_ALPHA_CONDITIONS,
  content: "Synthetic conditions: pressure 1,000 Pa.",
};
const key = (question: string, chunks: EvidenceChunk[], versions = ["p1", "v1"]) =>
  summaryCacheKey({ question, chunks, model: "m", versions });

describe("summary cache key", () => {
  it("ignores case, spacing, trailing punctuation and passage order", () => {
    expect(normalizeQuestion("  What   PRESSURE was used?? ")).toBe("what pressure was used");
    expect(key("What pressure was used?", [CONDITIONS, TEST_CHUNK_ALPHA_OBJECTIVE])).toBe(
      key("what pressure was used", [TEST_CHUNK_ALPHA_OBJECTIVE, CONDITIONS]),
    );
  });

  it("changes when the question, a passage's text, the model or a prompt version changes", () => {
    const base = key("What pressure was used?", [CONDITIONS]);
    expect(key("What oxygen was used?", [CONDITIONS])).not.toBe(base);
    expect(key("What pressure was used?", [{ ...CONDITIONS, content: "Edited and re-ingested." }])).not.toBe(
      base,
    );
    expect(key("What pressure was used?", [CONDITIONS], ["p2", "v1"])).not.toBe(base);
    expect(
      summaryCacheKey({
        question: "What pressure was used?",
        chunks: [CONDITIONS],
        model: "other",
        versions: ["p1", "v1"],
      }),
    ).not.toBe(base);
  });
});

describe("summary cache store", () => {
  const value = { status: "ok" } as Extract<SynthesisResponse, { status: "ok" }>;

  it("expires entries after the TTL", () => {
    let time = 0;
    const cache = createSummaryCache({ ttlMs: 100, now: () => time });
    cache.set("a", value);
    time = 99;
    expect(cache.get("a")).toBe(value);
    time = 250;
    expect(cache.get("a")).toBeNull();
  });

  it("drops the least recently used entry when full", () => {
    const cache = createSummaryCache({ maxEntries: 2 });
    cache.set("a", value);
    cache.set("b", value);
    cache.get("a"); // a is now the most recently used
    cache.set("c", value);
    expect(cache.get("b")).toBeNull();
    expect(cache.get("a")).toBe(value);
    expect(cache.size).toBe(2);
  });
});

describe("synthesize() with a cache", () => {
  const store = createMemoryStore([TEST_CHUNK_ALPHA_OBJECTIVE, CONDITIONS]);
  const llm = { apiKey: "test-key", model: "test-model" };

  /** A fake model: writes one statement, and the reviewer supports it. */
  function model(): ChatFunction {
    return vi.fn(async (messages) =>
      messages[0].content === VERIFIER_PROMPT
        ? JSON.stringify({ verdicts: [{ id: "T1", verdict: "supported", reason: "" }] })
        : JSON.stringify({ answer: [{ text: "Pressure was 1,000 Pa.", sources: ["S1"] }] }),
    );
  }

  it("answers a repeated question without calling the model again", async () => {
    const cache = createSummaryCache();
    const chat = model();
    const first = await synthesize("What pressure was used?", [CONDITIONS.id], { store, llm, chat, cache });
    expect(chat).toHaveBeenCalledTimes(2); // write + review
    const again = await synthesize("what pressure was used", [CONDITIONS.id], { store, llm, chat, cache });
    expect(chat).toHaveBeenCalledTimes(2);
    expect(again).toEqual(first);
    expect(first.status).toBe("ok");
  });

  it("never caches a failure, so a rate-limited attempt is retried", async () => {
    const cache = createSummaryCache();
    const limited: ChatFunction = async () => {
      throw new LlmError(
        "The language model request failed: the rate limit was reached; try again in a minute.",
        429,
      );
    };
    const failed = await synthesize("What pressure was used?", [CONDITIONS.id], {
      store,
      llm,
      chat: limited,
      cache,
    });
    expect(failed.status).toBe("unavailable");
    expect(cache.size).toBe(0);

    const chat = model();
    const retried = await synthesize("What pressure was used?", [CONDITIONS.id], { store, llm, chat, cache });
    expect(retried.status).toBe("ok");
    expect(chat).toHaveBeenCalledTimes(2);
  });

  it("never caches a summary whose review failed", async () => {
    const cache = createSummaryCache();
    const chat: ChatFunction = async (messages) =>
      messages[0].content === VERIFIER_PROMPT
        ? "not json"
        : JSON.stringify({ answer: [{ text: "Pressure was 1,000 Pa.", sources: ["S1"] }] });
    expect(
      (await synthesize("What pressure was used?", [CONDITIONS.id], { store, llm, chat, cache })).status,
    ).toBe("unavailable");
    expect(cache.size).toBe(0);
  });
});
