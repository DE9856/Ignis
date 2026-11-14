import path from "node:path";

/**
 * The exact model files the app runs, pinned to one Hugging Face revision and checked by
 * sha256. `scripts/fetch-model.ts` downloads them into `models/` (git-ignored) before every
 * build, and the search route ships them via `outputFileTracingIncludes`, so a deployed
 * function never downloads anything at request time.
 */

export const MODEL_REPO = "Xenova/bge-small-en-v1.5";
export const MODEL_REVISION = "ea104dacec62c0de699686887e3f920caeb4f3e3";

/** Relative to `models/<repo>/`. `model_quantized.onnx` is what transformers.js loads for dtype q8. */
export const MODEL_FILES: ReadonlyArray<{ file: string; sha256: string; bytes: number }> = [
  {
    file: "config.json",
    sha256: "fa73f90bf92c8cace1fbcb709626306f2bdbc9ea3e5b5f94b440df9b6aa56350",
    bytes: 683,
  },
  {
    file: "tokenizer.json",
    sha256: "d241a60d5e8f04cc1b2b3e9ef7a4921b27bf526d9f6050ab90f9267a1f9e5c66",
    bytes: 711_396,
  },
  {
    file: "tokenizer_config.json",
    sha256: "9261e7d79b44c8195c1cada2b453e55b00aeb81e907a6664974b4d7776172ab3",
    bytes: 366,
  },
  {
    file: "onnx/model_quantized.onnx",
    sha256: "6c9c6101a956d62dfb5e7190c538226c0c5bb9cb27b651234b6df063ee7dbfe4",
    bytes: 34_014_426,
  },
];

/** `<project>/models`. transformers.js resolves `<localModelPath>/<repo>/<file>`. */
export function localModelRoot(): string {
  return process.env.IGNIS_MODEL_DIR?.trim() || path.join(process.cwd(), "models");
}
