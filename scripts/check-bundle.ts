/**
 * Post-build check of the search function's file trace (runs as `postbuild`, so it also
 * runs on Vercel and stops a broken bundle before it is deployed).
 *
 * The query embedder needs files the tracer cannot find on its own (see next.config.ts).
 * Without them the route still deploys and search quietly drops to keyword-only, so this
 * fails loudly instead. It also keeps the function well under Vercel's 250 MB limit.
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

import { MODEL_FILES, MODEL_REPO } from "../lib/embeddings/model-files";

const TRACE = ".next/server/app/api/evidence/search/route.js.nft.json";
const LIMIT_MB = 200;
const RUNTIME = "node_modules/onnxruntime-node/bin/napi-v6/linux/x64/";

function main(): void {
  const traceFile = path.join(process.cwd(), TRACE);
  const trace = JSON.parse(readFileSync(traceFile, "utf8")) as { files: string[] };
  const files = trace.files.map((file) =>
    path
      .relative(process.cwd(), path.resolve(path.dirname(traceFile), file))
      .split(path.sep)
      .join("/"),
  );
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

  if (problems.length > 0) {
    console.error(`Bundle check failed for /api/evidence/search:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(
    `Bundle check passed: /api/evidence/search ships ${files.length} files, ${megabytes.toFixed(1)} MB ` +
      `(limit ${LIMIT_MB} MB), with the q8 model and the Linux x64 CPU runtime.`,
  );
}

main();
