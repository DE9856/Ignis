/**
 * Download the pinned embedding model into models/ and verify every file by sha256.
 *
 *   npm run fetch:model       (also runs automatically before `npm run build`)
 *
 * Idempotent: files already present with the right hash are kept. A file with the wrong
 * hash is replaced; a download with the wrong hash fails the run and leaves nothing behind.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { localModelRoot, MODEL_FILES, MODEL_REPO, MODEL_REVISION } from "../lib/embeddings/model-files";

const sha256 = (data: Uint8Array) => createHash("sha256").update(data).digest("hex");

async function existingHash(file: string): Promise<string | null> {
  try {
    return sha256(await readFile(file));
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const root = path.join(localModelRoot(), MODEL_REPO);
  let downloaded = 0;

  for (const entry of MODEL_FILES) {
    const target = path.join(root, entry.file);
    if ((await existingHash(target)) === entry.sha256) continue;

    const url = `https://huggingface.co/${MODEL_REPO}/resolve/${MODEL_REVISION}/${entry.file}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${entry.file}: HTTP ${response.status} from ${url}`);
    const data = new Uint8Array(await response.arrayBuffer());
    const actual = sha256(data);
    if (actual !== entry.sha256) {
      throw new Error(`${entry.file}: sha256 ${actual}, expected ${entry.sha256}. Not saved.`);
    }

    await mkdir(path.dirname(target), { recursive: true });
    const partial = `${target}.partial`;
    await writeFile(partial, data);
    await rm(target, { force: true });
    await rename(partial, target);
    downloaded += 1;
    console.log(`fetched ${entry.file} (${(entry.bytes / 1e6).toFixed(1)} MB)`);
  }

  const total = MODEL_FILES.reduce((sum, entry) => sum + entry.bytes, 0);
  console.log(
    `Model ${MODEL_REPO}@${MODEL_REVISION.slice(0, 7)} ready in ${path.relative(process.cwd(), root) || root} ` +
      `(${(total / 1e6).toFixed(1)} MB, ${downloaded} file(s) downloaded, all hashes verified).`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
