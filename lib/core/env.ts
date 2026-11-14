/**
 * Environment inspection. Server and scripts only.
 *
 * Nothing here returns a variable's value, only whether it is usable, so the
 * report is safe to print, log or show on the dev status page.
 *
 * Every variable is optional: IGNIS must run with none of them set.
 */

export type EnvRequirement = "REQUIRED" | "OPTIONAL";
export type EnvState = "CONFIGURED" | "UNAVAILABLE" | "INVALID";
export type EnvExposure = "browser" | "server";

export interface EnvVarSpec {
  name: string;
  requirement: EnvRequirement;
  /** `browser` variables are inlined into client code; `server` ones must never be. */
  exposure: EnvExposure;
  purpose: string;
  /** Returns a problem description, or null when the value is acceptable. */
  validate?: (value: string) => string | null;
}

export interface EnvVarReport {
  name: string;
  requirement: EnvRequirement;
  exposure: EnvExposure;
  state: EnvState;
  purpose: string;
  problem: string | null;
}

function validateHttpsUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1"
      ? null
      : "must be an https URL";
  } catch {
    return "is not a valid URL";
  }
}

export const ENV_SPECS: readonly EnvVarSpec[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    requirement: "OPTIONAL",
    exposure: "browser",
    purpose: "Supabase project URL. Without it the app reads local knowledge files only.",
    validate: validateHttpsUrl,
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    requirement: "OPTIONAL",
    exposure: "browser",
    purpose: "Supabase anon key for read-only access to verified chunks.",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    requirement: "OPTIONAL",
    exposure: "server",
    purpose: "Server-only key for ingestion scripts. Bypasses row-level security.",
  },
  {
    name: "OPTIONAL_LLM_API_KEY",
    requirement: "OPTIONAL",
    exposure: "server",
    purpose: "Optional grounded synthesis. The app is complete without it.",
  },
];

type EnvSource = Record<string, string | undefined>;

function read(env: EnvSource, name: string): string | null {
  const value = env[name]?.trim();
  return value ? value : null;
}

export function inspectEnvironment(env: EnvSource = process.env): EnvVarReport[] {
  return ENV_SPECS.map((spec) => {
    const value = read(env, spec.name);
    const base = {
      name: spec.name,
      requirement: spec.requirement,
      exposure: spec.exposure,
      purpose: spec.purpose,
    };
    if (value === null) return { ...base, state: "UNAVAILABLE", problem: null };
    const problem = spec.validate?.(value) ?? null;
    return { ...base, state: problem ? "INVALID" : "CONFIGURED", problem };
  });
}

/**
 * Cross-variable problems that a per-variable check cannot see.
 * The first one is the important one: a service-role key under a NEXT_PUBLIC_
 * name would be shipped to every browser.
 */
export function findEnvironmentProblems(env: EnvSource = process.env): string[] {
  const problems: string[] = [];
  const serviceRoleKey = read(env, "SUPABASE_SERVICE_ROLE_KEY");

  for (const [name, raw] of Object.entries(env)) {
    if (!name.startsWith("NEXT_PUBLIC_")) continue;
    const value = raw?.trim();
    if (!value) continue;
    if (serviceRoleKey && value === serviceRoleKey) {
      problems.push(`${name} holds the service-role key. NEXT_PUBLIC_ variables are sent to the browser.`);
    }
    if (/SERVICE_ROLE|SECRET|PRIVATE/i.test(name)) {
      problems.push(
        `${name} looks like a secret but has a NEXT_PUBLIC_ name, which exposes it to the browser.`,
      );
    }
  }

  const url = read(env, "NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = read(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (Boolean(url) !== Boolean(anonKey)) {
    problems.push("Set both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or neither.");
  }
  if (serviceRoleKey && !url) {
    problems.push("SUPABASE_SERVICE_ROLE_KEY is set but NEXT_PUBLIC_SUPABASE_URL is not.");
  }
  if (serviceRoleKey && anonKey && serviceRoleKey === anonKey) {
    problems.push("SUPABASE_SERVICE_ROLE_KEY and the anon key are identical. One of them is wrong.");
  }

  return problems;
}

export function isEnvConfigured(name: string, env: EnvSource = process.env): boolean {
  return inspectEnvironment(env).some((report) => report.name === name && report.state === "CONFIGURED");
}
