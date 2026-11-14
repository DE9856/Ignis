import { CHUNKER_VERSION } from "@/lib/retrieval/config";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/retrieval/types";

import { localModelRoot, MODEL_REPO } from "./model-files";

/**
 * One embedding function for both stored chunks and incoming queries, so the
 * index and the search can never use different models (Member 5 brief, Part B).
 *
 * Model facts, checked on the model cards on 2026-11-14:
 * - BAAI/bge-small-en-v1.5, ONNX conversion `Xenova/bge-small-en-v1.5`
 * - 384 dimensions, CLS pooling (`1_Pooling/config.json`: pooling_mode_cls_token)
 * - Queries take the prefix below; passages take none
 * - Inputs longer than 512 tokens are truncated by the model
 *
 * Server and scripts only. The model loads lazily on first use, from the pinned files in
 * `models/` (`npm run fetch:model`), never from the network.
 */

export const ONNX_MODEL_ID = MODEL_REPO;
export const QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: ";
export const MODEL_MAX_TOKENS = 512;

export type EmbeddingKind = "passage" | "query";

export interface Embedder {
  /** Recorded on every stored chunk. Search refuses vectors from a different version. */
  readonly version: string;
  readonly dimensions: number;
  embed(texts: string[], kind: EmbeddingKind): Promise<number[][]>;
}

/**
 * 8-bit quantized weights (`onnx/model_quantized.onnx`, 34 MB instead of 133 MB for fp32), so the
 * model fits inside the search function on Vercel. Changing this changes the version below, and
 * search then refuses the stored vectors until the corpus is re-ingested.
 */
const DTYPE = "q8";

/** `bge-small-en-v1.5/onnx-q8/cls-norm/chunker-v1`: model, weights, pooling, chunk boundaries. */
export const LOCAL_EMBEDDING_VERSION = `${EMBEDDING_MODEL.split("/")[1]}/onnx-${DTYPE}/cls-norm/${CHUNKER_VERSION}`;

export function withInstruction(text: string, kind: EmbeddingKind): string {
  return kind === "query" ? `${QUERY_INSTRUCTION}${text}` : text;
}

function assertVectors(vectors: number[][], expected: number): number[][] {
  if (vectors.length !== expected) {
    throw new Error(`Embedding returned ${vectors.length} vectors for ${expected} inputs`);
  }
  for (const vector of vectors) {
    if (vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Embedding has ${vector.length} dimensions, expected ${EMBEDDING_DIMENSIONS}`);
    }
    if (!vector.every(Number.isFinite)) throw new Error("Embedding contains a non-finite value");
  }
  return vectors;
}

type FeatureExtractor = (
  texts: string[],
  options: { pooling: "cls"; normalize: boolean },
) => Promise<{ tolist(): unknown }>;

type Transformers = typeof import("@huggingface/transformers");

/** Load transformers.js pointed at the local model files only. */
async function loadTransformers(): Promise<Transformers> {
  const transformers = await import("@huggingface/transformers");
  transformers.env.localModelPath = localModelRoot();
  transformers.env.allowLocalModels = true;
  transformers.env.allowRemoteModels = false;
  return transformers;
}

function missingModel(error: unknown): Error {
  const detail = error instanceof Error ? error.message : String(error);
  return new Error(
    `Could not load ${MODEL_REPO} from ${localModelRoot()}. Run \`npm run fetch:model\`. (${detail})`,
  );
}

/** Runs the model in-process with onnxruntime, from the files in `models/`. */
export function createLocalEmbedder(options: { batchSize?: number } = {}): Embedder {
  let extractor: Promise<FeatureExtractor> | null = null;
  const batchSize = options.batchSize ?? 16;

  async function load(): Promise<FeatureExtractor> {
    const transformers = await loadTransformers();
    const pipe = await transformers
      .pipeline("feature-extraction", ONNX_MODEL_ID, { dtype: DTYPE })
      .catch((error: unknown) => {
        throw missingModel(error);
      });
    return pipe as unknown as FeatureExtractor;
  }

  return {
    version: LOCAL_EMBEDDING_VERSION,
    dimensions: EMBEDDING_DIMENSIONS,
    async embed(texts, kind) {
      if (texts.length === 0) return [];
      extractor ??= load().catch((error: unknown) => {
        extractor = null;
        throw error;
      });
      const run = await extractor;
      const out: number[][] = [];
      for (let start = 0; start < texts.length; start += batchSize) {
        const batch = texts.slice(start, start + batchSize).map((text) => withInstruction(text, kind));
        const tensor = await run(batch, { pooling: "cls", normalize: true });
        out.push(...(tensor.tolist() as number[][]));
      }
      return assertVectors(out, texts.length);
    },
  };
}

/**
 * Which embedder the server uses for queries, from `IGNIS_QUERY_EMBEDDINGS`:
 * `local` (default) runs the model in the server route; `off` skips vector
 * search and uses lexical + metadata retrieval only.
 */
export function getQueryEmbedder(): Embedder | null {
  const setting = (process.env.IGNIS_QUERY_EMBEDDINGS ?? "local").trim().toLowerCase();
  if (setting === "off") return null;
  return sharedLocalEmbedder;
}

const sharedLocalEmbedder = createLocalEmbedder();

/**
 * Exact token count with the model's own tokenizer, including [CLS] and [SEP].
 * Ingestion uses it to refuse any chunk the model would silently truncate.
 */
export async function loadModelTokenCounter(): Promise<(text: string) => number> {
  const transformers = await loadTransformers();
  const tokenizer = await transformers.AutoTokenizer.from_pretrained(ONNX_MODEL_ID).catch(
    (error: unknown) => {
      throw missingModel(error);
    },
  );
  return (text: string) => tokenizer.encode(text).length;
}

/** Cosine similarity. Vectors from this module are already unit length, so this is a dot product. */
export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }
  return normA === 0 || normB === 0 ? 0 : dot / Math.sqrt(normA * normB);
}

/** Run a promise with a time limit, so a slow model load cannot hang a search request. */
export async function withTimeout<T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} took longer than ${milliseconds} ms`)), milliseconds);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}
