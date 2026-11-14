import { CHUNKER_VERSION } from "@/lib/retrieval/config";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/retrieval/types";

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
 * Server and scripts only. The model loads lazily on first use.
 */

export const ONNX_MODEL_ID = "Xenova/bge-small-en-v1.5";
export const QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: ";
export const MODEL_MAX_TOKENS = 512;

export type EmbeddingKind = "passage" | "query";

export interface Embedder {
  /** Recorded on every stored chunk. Search refuses vectors from a different version. */
  readonly version: string;
  readonly dimensions: number;
  embed(texts: string[], kind: EmbeddingKind): Promise<number[][]>;
}

const DTYPE = "fp32";

/** `bge-small-en-v1.5/onnx-fp32/cls-norm/chunker-v1`: model, weights, pooling, chunk boundaries. */
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

/** Runs the model in-process with onnxruntime. Downloads about 130 MB on first use, then caches it. */
export function createLocalEmbedder(options: { cacheDir?: string; batchSize?: number } = {}): Embedder {
  let extractor: Promise<FeatureExtractor> | null = null;
  const batchSize = options.batchSize ?? 16;

  async function load(): Promise<FeatureExtractor> {
    const transformers = await import("@huggingface/transformers");
    if (options.cacheDir) transformers.env.cacheDir = options.cacheDir;
    const pipe = await transformers.pipeline("feature-extraction", ONNX_MODEL_ID, { dtype: DTYPE });
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

/**
 * Where the model is cached. The package folder is read-only on serverless hosts, so on
 * Vercel the cache goes to /tmp (lost between cold starts). Override with IGNIS_MODEL_CACHE_DIR.
 */
function modelCacheDir(): string | undefined {
  return (
    process.env.IGNIS_MODEL_CACHE_DIR?.trim() || (process.env.VERCEL ? "/tmp/ignis-model-cache" : undefined)
  );
}

const sharedLocalEmbedder = createLocalEmbedder({ cacheDir: modelCacheDir() });

/**
 * Exact token count with the model's own tokenizer, including [CLS] and [SEP].
 * Ingestion uses it to refuse any chunk the model would silently truncate.
 */
export async function loadModelTokenCounter(
  options: { cacheDir?: string } = {},
): Promise<(text: string) => number> {
  const transformers = await import("@huggingface/transformers");
  if (options.cacheDir) transformers.env.cacheDir = options.cacheDir;
  const tokenizer = await transformers.AutoTokenizer.from_pretrained(ONNX_MODEL_ID);
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
