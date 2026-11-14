import { describe, expect, it, vi } from "vitest";

import { chunkDocument } from "@/lib/retrieval/chunker";
import { createHttpRetriever } from "@/lib/retrieval/http-client";
import { fromRecord, toPgVector, toRecord } from "@/lib/retrieval/rows";
import { stem, terms, tsqueryTerms } from "@/lib/retrieval/text";

import { SYNTHETIC_CORPUS, syntheticDocument } from "./fixtures";

describe("text helpers", () => {
  it("keeps experiment acronyms that Postgres would treat as stop words", () => {
    expect(terms("Which experiments studied the SAME smoke?")).toEqual([
      "experiment",
      "study",
      "same",
      "smoke",
    ]);
    expect(terms("SAME-R and BASS-II")).toEqual(["same-r", "same", "r", "bass-ii", "bass", "ii"]);
  });

  it("stems plurals and verb endings predictably", () => {
    expect(stem("detectors")).toBe("detector");
    expect(stem("studies")).toBe("study");
    expect(stem("burning")).toBe("burn");
    expect(stem("gas")).toBe("gas");
    expect(stem("0.16")).toBe("0.16");
  });

  it("produces tsquery terms that cannot carry operators", () => {
    const unsafe = tsqueryTerms("smoke' | !detector & (x:*) <-> drop table;");
    for (const term of unsafe) expect(term).toMatch(/^[a-z0-9]+$/);
    expect(unsafe).toContain("smoke");
    expect(unsafe).toContain("detector");
  });
});

describe("row mapping", () => {
  it("round-trips a chunk through the database shape", () => {
    const chunk = chunkDocument(syntheticDocument(SYNTHETIC_CORPUS[0])).chunks[1];
    const record = toRecord(chunk, "test-version", "hash");
    expect(record.human_verified).toBe(true);
    expect(record.search_names).toContain("Bench Zeta");
    expect(fromRecord(record)).toEqual({ ...chunk, embeddingVersion: "test-version" });
  });

  it("does not trust unknown enum values coming back from the database", () => {
    const chunk = chunkDocument(syntheticDocument(SYNTHETIC_CORPUS[0])).chunks[0];
    const record = {
      ...toRecord(chunk, "v", "h"),
      source_class: "MADE_UP" as never,
      gravity_condition: "moon" as never,
    };
    const back = fromRecord(record);
    expect(back.sourceClass).toBe("UNVERIFIED");
    expect(back.gravityCondition).toBeNull();
  });

  it("formats vectors for pgvector", () => {
    expect(toPgVector([0.5, -1, 0])).toBe("[0.5,-1,0]");
  });
});

describe("createHttpRetriever", () => {
  it("passes a valid response through", async () => {
    const body = { status: "unavailable", reason: "x" };
    const fetchImpl = vi.fn(async () => Response.json(body));
    await expect(createHttpRetriever("/x", fetchImpl).search({ text: "q" })).resolves.toEqual(body);
    expect(fetchImpl).toHaveBeenCalledWith("/x", expect.objectContaining({ method: "POST" }));
  });

  it("turns an error body into an unavailable response with the server's message", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ error: "Too many searches." }, { status: 429 }));
    await expect(createHttpRetriever("/x", fetchImpl).search({ text: "q" })).resolves.toEqual({
      status: "unavailable",
      reason: "Too many searches.",
    });
  });

  it("never throws when the network fails", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("offline");
    });
    const response = await createHttpRetriever("/x", fetchImpl).search({ text: "q" });
    expect(response.status).toBe("unavailable");
  });
});
