import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Static guards that keep synthetic data and development code where they belong.
 */
const ROOT = process.cwd();

function walk(directory: string, extensions: string[]): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : walk(target, extensions);
    return extensions.some((extension) => entry.name.endsWith(extension)) ? [target] : [];
  });
}

const relative = (file: string) => path.relative(ROOT, file).split(path.sep).join("/");

describe("repository hygiene", () => {
  it("uses no real NASA investigation names in synthetic fixtures or mocks", () => {
    const realNames = /\b(BASS|Saffire|SAFFIRE|FLEX|ACME|SPICE|SLICE|SAME-R|CFI-G)\b/;
    const files = [
      ...walk(path.join(ROOT, "tests", "fixtures"), [".md", ".ts"]),
      ...walk(path.join(ROOT, "lib", "dev"), [".ts"]),
    ];
    const offenders = files.filter((file) => realNames.test(fs.readFileSync(file, "utf8"))).map(relative);
    expect(offenders).toEqual([]);
  });

  it("keeps synthetic TEST_ records out of the real knowledge base", () => {
    const offenders = walk(path.join(ROOT, "knowledge"), [".md"])
      .filter(
        (file) => !relative(file).includes("/_templates/") && !path.basename(file).startsWith("zz-local-"),
      )
      .filter(
        (file) =>
          /\bTEST_[A-Z]/.test(fs.readFileSync(file, "utf8")) ||
          /test\.invalid/.test(fs.readFileSync(file, "utf8")),
      )
      .map(relative);
    expect(offenders).toEqual([]);
  });

  it("never imports dev mocks or test fixtures statically from production code", () => {
    const staticImport = /^\s*(import|export)\s[^;]*?from\s+["'](@\/lib\/dev\/|@\/tests\/|(\.\.\/)+tests\/)/m;
    const files = ["app", "components", "lib"]
      .flatMap((directory) => walk(path.join(ROOT, directory), [".ts", ".tsx"]))
      .filter((file) => !relative(file).startsWith("lib/dev/"));
    const offenders = files.filter((file) => staticImport.test(fs.readFileSync(file, "utf8"))).map(relative);
    expect(offenders).toEqual([]);
  });

  it("never reads the service-role key from a client component", () => {
    const offenders = ["app", "components", "lib"]
      .flatMap((directory) => walk(path.join(ROOT, directory), [".ts", ".tsx"]))
      .filter((file) => {
        const text = fs.readFileSync(file, "utf8");
        return /^["']use client["']/m.test(text) && /SERVICE_ROLE/.test(text);
      })
      .map(relative);
    expect(offenders).toEqual([]);
  });
});
