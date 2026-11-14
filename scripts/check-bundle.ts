/**
 * Post-build check of the search function's file trace (runs as `postbuild`, so it also
 * runs on Vercel and stops a broken bundle before it is deployed).
 *
 * The query embedder needs files the tracer cannot find on its own (see next.config.ts).
 * Without them the route still deploys and search quietly drops to keyword-only, so this
 * fails loudly instead:
 *
 * 1. Static: the model, the Linux runtime and the require()-loaded files are traced; no
 *    GPU libraries or other platforms' binaries; the function stays well under 250 MB.
 * 2. Simulation: copy ONLY the traced files into an empty folder and embed one query from
 *    there, as the deployed function would. A file the tracer missed fails here the same
 *    way it fails on Vercel. On Linux x64 (Vercel's builder) this runs the exact binary
 *    that ships; elsewhere the host's onnxruntime binary is swapped in for the run.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { MODEL_FILES, MODEL_REPO } from "../lib/embeddings/model-files";

const TRACE = ".next/server/app/api/evidence/search/route.js.nft.json";
const LIMIT_MB = 200;
const BIN = "node_modules/onnxruntime-node/bin/napi-v6";
const RUNTIME = `${BIN}/linux/x64/`;

function tracedFiles(): string[] {
  const traceFile = path.join(process.cwd(), TRACE);
  const trace = JSON.parse(readFileSync(traceFile, "utf8")) as { files: string[] };
  return trace.files
    .map((file) =>
      path
        .relative(process.cwd(), path.resolve(path.dirname(traceFile), file))
        .split(path.sep)
        .join("/"),
    )
    .filter((file) => !file.startsWith("../"));
}

function staticProblems(files: string[]): { problems: string[]; megabytes: number } {
  const has = (file: string) => files.includes(file);
  const problems: string[] = [];

  for (const entry of MODEL_FILES) {
    const file = `models/${MODEL_REPO}/${entry.file}`;
    if (!has(file)) problems.push(`missing ${file} (did \`npm run fetch:model\` run?)`);
  }
  for (const file of ["onnxruntime_binding.node", "libonnxruntime.so.1"]) {
    if (!has(RUNTIME + file)) problems.push(`missing ${RUNTIME}${file}`);
  }
  for (const file of files) {
    if (/libonnxruntime_providers_/.test(file)) problems.push(`GPU provider library traced: ${file}`);
    if (/onnxruntime-node\/bin\/napi-v6\/(win32|darwin)\//.test(file))
      problems.push(`non-Linux runtime: ${file}`);
  }

  let bytes = 0;
  for (const file of files) {
    try {
      bytes += statSync(file).size;
    } catch {
      // Trace entries can name optional files that are absent; they are not shipped.
    }
  }
  const megabytes = bytes / 1e6;
  if (megabytes > LIMIT_MB)
    problems.push(`search function is ${megabytes.toFixed(1)} MB, over ${LIMIT_MB} MB`);
  return { problems, megabytes };
}

const SIMULATION = `
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = process.cwd();
const t = await import(pathToFileURL(path.join(root, "node_modules/@huggingface/transformers/dist/transformers.node.mjs")).href);
t.env.localModelPath = path.join(root, "models");
t.env.allowLocalModels = true;
t.env.allowRemoteModels = false;
const pipe = await t.pipeline("feature-extraction", ${JSON.stringify(MODEL_REPO)}, { dtype: "q8" });
const out = await pipe(["bundle check"], { pooling: "cls", normalize: true });
const dims = out.tolist()[0].length;
if (dims !== 384) throw new Error("expected 384 dimensions, got " + dims);
`;

/** Embed one query using only the traced files. Returns an error message, or null. */
function simulate(files: string[]): string | null {
  const platform = `${process.platform}/${process.arch}`;
  if (platform !== "linux/x64" && !existsSync(`${BIN}/${platform}`)) {
    console.warn(`Bundle check: no onnxruntime binary for ${platform}; skipping the load simulation.`);
    return null;
  }

  const dir = mkdtempSync(path.join(os.tmpdir(), "ignis-bundle-"));
  try {
    for (const file of files) {
      if (!existsSync(file) || statSync(file).isDirectory()) continue;
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      copyFileSync(file, path.join(dir, file));
    }
    if (platform !== "linux/x64") {
      // The only difference from the deployed function: this machine's native binary.
      const source = `${BIN}/${platform}`;
      mkdirSync(path.join(dir, source), { recursive: true });
      for (const name of readdirSync(source)) {
        if (!/providers_/.test(name)) copyFileSync(path.join(source, name), path.join(dir, source, name));
      }
    }
    const run = spawnSync(process.execPath, ["--input-type=module", "-e", SIMULATION], {
      cwd: dir,
      encoding: "utf8",
      timeout: 120_000,
    });
    if (run.status === 0) return null;
    const output = `${run.stderr ?? ""}${run.stdout ?? ""}`.trim();
    const reason = output.split("\n").find((line) => /Error|Cannot find/.test(line)) ?? output.slice(0, 500);
    return `embedding from the traced files alone failed: ${reason || `exit ${run.status ?? run.signal}`}`;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function main(): void {
  const files = tracedFiles();
  const { problems, megabytes } = staticProblems(files);
  if (problems.length === 0) {
    const failure = simulate(files);
    if (failure) problems.push(failure);
  }

  if (problems.length > 0) {
    console.error(`Bundle check failed for /api/evidence/search:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(
    `Bundle check passed: /api/evidence/search ships ${files.length} files, ${megabytes.toFixed(1)} MB ` +
      `(limit ${LIMIT_MB} MB); the q8 model loads and embeds from those files alone.`,
  );
}

main();
