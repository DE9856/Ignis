/**
 * Retrieval evaluation runner (Member 5 brief, Part F).
 *
 *   npx tsx scripts/evaluate.ts                        local corpus, keywords + metadata
 *   npx tsx scripts/evaluate.ts --embed                local corpus, full hybrid with the real model
 *   npx tsx --env-file=.env.local scripts/evaluate.ts --supabase   the shared index
 *   npx tsx scripts/evaluate.ts --url https://<preview>.vercel.app     through the deployed route
 *   add --write to save docs/retrieval-evaluation.md, --split dev|holdout to score one split
 *
 * Expected answers come from tests/retrieval/eval-set.json. Cases whose labels are
 * missing, or whose records are not yet verified, are listed as not scorable.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { createLocalEmbedder, LOCAL_EMBEDDING_VERSION } from "@/lib/embeddings";
import { embeddingText } from "@/lib/retrieval/chunker";
import { buildCorpusChunks, defaultKnowledgeRoot } from "@/lib/retrieval/corpus";
import {
  parseEvalSet,
  renderReport,
  scoreCase,
  summarize,
  type CaseOutcome,
} from "@/lib/retrieval/evaluation";
import { createHttpRetriever, SEARCH_ENDPOINT } from "@/lib/retrieval/http-client";
import { createHybridRetriever } from "@/lib/retrieval/hybrid";
import { createMemoryStore } from "@/lib/retrieval/memory-store";
import { createSupabaseStore, readSupabaseConfig } from "@/lib/retrieval/supabase-store";
import type { EvidenceChunk, EvidenceRetriever } from "@/lib/retrieval/types";

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const option = (name: string) => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? null : (argv[index + 1] ?? null);
};

async function setup(): Promise<{ retriever: EvidenceRetriever; catalog: EvidenceChunk[]; mode: string }> {
  const url = option("url");
  if (flag("supabase")) {
    const config = readSupabaseConfig("anon");
    if (!config) throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.");
    const store = createSupabaseStore(config);
    return {
      retriever: createHybridRetriever({ store, embedder: createLocalEmbedder() }),
      catalog: await store.loadCatalog(),
      mode: "Supabase index, hybrid",
    };
  }

  const corpus = buildCorpusChunks(defaultKnowledgeRoot());
  if (url) {
    return {
      retriever: createHttpRetriever(new URL(SEARCH_ENDPOINT, url).toString()),
      catalog: corpus.chunks,
      mode: `deployed route at ${url}`,
    };
  }
  if (flag("embed")) {
    const embedder = createLocalEmbedder();
    console.log(`Embedding ${corpus.chunks.length} chunks with the local model...`);
    const vectors = await embedder.embed(corpus.chunks.map(embeddingText), "passage");
    const store = createMemoryStore(corpus.chunks, {
      vectors: new Map(corpus.chunks.map((chunk, index) => [chunk.id, vectors[index]])),
      embeddingVersion: LOCAL_EMBEDDING_VERSION,
    });
    return {
      retriever: createHybridRetriever({ store, embedder }),
      catalog: corpus.chunks,
      mode: "local corpus, hybrid",
    };
  }
  return {
    retriever: createHybridRetriever({ store: createMemoryStore(corpus.chunks), embedder: null }),
    catalog: corpus.chunks,
    mode: "local corpus, keywords + metadata",
  };
}

async function main(): Promise<void> {
  const cases = parseEvalSet(
    JSON.parse(fs.readFileSync(path.join("tests", "retrieval", "eval-set.json"), "utf8")),
  );
  const split = option("split");
  const selected = split ? cases.filter((item) => item.split === split) : cases;
  const { retriever, catalog, mode } = await setup();

  const outcomes: CaseOutcome[] = [];
  for (const item of selected) {
    outcomes.push(scoreCase(item, await retriever.search({ text: item.query }), catalog));
  }

  const categories = [...new Set(selected.map((item) => item.category))];
  const summaries = [
    summarize("all", outcomes),
    summarize(
      "dev",
      outcomes.filter((outcome) => outcome.split === "dev"),
    ),
    summarize(
      "holdout",
      outcomes.filter((outcome) => outcome.split === "holdout"),
    ),
    ...categories.map((category) =>
      summarize(
        category,
        outcomes.filter((outcome) => outcome.category === category),
      ),
    ),
  ];

  let commit = "unknown";
  try {
    commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    // not a git checkout
  }
  const records = new Set(catalog.map((chunk) => chunk.investigationId)).size;
  const markdown = renderReport({
    summaries,
    outcomes,
    meta: {
      Date: new Date().toISOString().slice(0, 10),
      Commit: commit,
      Mode: mode,
      Corpus: `${records} verified records, ${catalog.length} chunks`,
      "Embedding version": LOCAL_EMBEDDING_VERSION,
      Questions: `${selected.length} (${split ?? "all splits"})`,
    },
  });
  console.log(markdown);

  if (flag("write")) {
    fs.writeFileSync(path.join("docs", "retrieval-evaluation.md"), markdown);
    console.log("Wrote docs/retrieval-evaluation.md");
  }
}

main().catch((error: unknown) => {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
