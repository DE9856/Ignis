import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ENV_SPECS } from "@/lib/core/env";

/**
 * Static deployment guards. They read the repository as text; no network, no database.
 */
const ROOT = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(ROOT, file), "utf8");

function walk(directory: string): string[] {
  const full = path.join(ROOT, directory);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const target = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return walk(target);
    return /\.(ts|tsx)$/.test(entry.name) ? [target] : [];
  });
}

const isClientFile = (file: string) => /^["']use client["']/m.test(read(file));

describe("environment contract", () => {
  const example = read(".env.example");

  it("documents every variable the app reads, with no values", () => {
    for (const spec of ENV_SPECS) {
      expect(example, spec.name).toMatch(new RegExp(`^${spec.name}=$`, "m"));
    }
    const assigned = example.split("\n").filter((line) => /^[A-Z_]+=./.test(line));
    expect(assigned).toEqual([]);
  });

  it("classifies variables as public, server-only or optional", () => {
    for (const label of ["PUBLIC", "SERVER-ONLY", "OPTIONAL"]) expect(example).toContain(label);
  });

  it("keeps real env files out of git", () => {
    const ignore = read(".gitignore");
    expect(ignore).toMatch(/^\.env\*$/m);
    expect(ignore).toMatch(/^!\.env\.example$/m);
  });

  it("gives server-only variables no NEXT_PUBLIC_ name", () => {
    for (const spec of ENV_SPECS.filter((s) => s.exposure === "server")) {
      expect(spec.name.startsWith("NEXT_PUBLIC_"), spec.name).toBe(false);
    }
  });
});

describe("client/server boundary", () => {
  const files = ["app", "components", "lib"].flatMap(walk);

  it("keeps Node built-ins out of client components", () => {
    const offenders = files
      .filter(isClientFile)
      .filter((file) => /from\s+["'](node:)?(fs|path|child_process)["']/.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it("never imports the server-only Supabase module into a client component, except as a type", () => {
    const offenders = files
      .filter(isClientFile)
      .filter((file) => /^import\s+(?!type\b)[^;]*from\s+["']@\/lib\/supabase\/server["']/m.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it("never reads server-only variables from a client component or the browser Supabase client", () => {
    const secrets = /SUPABASE_SERVICE_ROLE_KEY|OPTIONAL_LLM_API_KEY/;
    const offenders = files.filter(
      (file) => (isClientFile(file) || file === "lib/supabase/client.ts") && secrets.test(read(file)),
    );
    expect(offenders).toEqual([]);
  });

  it("does not opt any route into the Edge runtime, which has no filesystem", () => {
    const offenders = files.filter((file) => /export const runtime\s*=\s*["']edge["']/.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it("ships the knowledge files with the one function that reads them at request time", () => {
    expect(read("next.config.ts")).toMatch(/"\/api\/health":\s*\["\.\/knowledge\/\*\*\/\*\.md"\]/);
  });
});

describe("deployment documentation", () => {
  it("exists and covers the required sections", () => {
    const doc = read("docs/deployment.md");
    for (const heading of [
      "Local setup",
      "Supabase setup",
      "Running migrations",
      "Environment variables",
      "Vercel setup",
      "Production checklist",
      "Rollback",
      "First production deployment",
    ]) {
      expect(doc, heading).toContain(heading);
    }
  });
});
