import fs from "node:fs";
import path from "node:path";

/** Load .env.local for command-line scripts. Next.js does this itself; plain Node does not. */
export function loadLocalEnv(): void {
  for (const file of [".env.local", ".env"]) {
    const target = path.join(process.cwd(), file);
    if (fs.existsSync(target)) {
      try {
        process.loadEnvFile(target);
      } catch {
        console.warn(`Could not read ${file}; continuing without it.`);
      }
    }
  }
}

export interface CliArgs {
  flags: Set<string>;
  positional: string[];
}

export function parseArgs(argv: string[] = process.argv.slice(2)): CliArgs {
  return {
    flags: new Set(argv.filter((arg) => arg.startsWith("--")).map((arg) => arg.slice(2))),
    positional: argv.filter((arg) => !arg.startsWith("--")),
  };
}

export function pad(value: string | number, width: number): string {
  return String(value).padEnd(width);
}
