import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

export type IgnisSupabaseClient = SupabaseClient<Database>;

export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

/** A malformed URL makes createClient throw; treat it as "not configured" instead. */
function isUsableUrl(value: string): boolean {
  try {
    const { protocol, hostname } = new URL(value);
    return protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Public Supabase settings, or null when the app runs without Supabase. */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey || !isUsableUrl(url)) return null;
  return { url, anonKey };
}

let browserClient: IgnisSupabaseClient | null = null;

/**
 * Anon-key client for browser and read-only use.
 * Returns null instead of throwing when Supabase is not configured;
 * callers must handle that case.
 */
export function getSupabaseClient(): IgnisSupabaseClient | null {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  browserClient ??= createClient<Database>(config.url, config.anonKey);
  return browserClient;
}
