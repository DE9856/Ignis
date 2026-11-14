import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig, type IgnisSupabaseClient } from "./client";
import type { Database } from "./types";

/**
 * Server-side Supabase access. Never import this file from a client component:
 * the service-role key bypasses row-level security.
 */

export interface SupabaseStatus {
  publicConfigured: boolean;
  serviceRoleConfigured: boolean;
}

export function getSupabaseStatus(): SupabaseStatus {
  return {
    publicConfigured: getSupabasePublicConfig() !== null,
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  };
}

/** Service-role client for ingestion scripts and server code, or null when not configured. */
export function getSupabaseServiceClient(): IgnisSupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseServiceClient must not be called in the browser");
  }
  const config = getSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  // Refuse a service-role key that is also the public anon key: that means the
  // admin key was pasted into a NEXT_PUBLIC_ variable and is already exposed.
  if (serviceRoleKey && serviceRoleKey === config?.anonKey) return null;
  if (!config || !serviceRoleKey) return null;
  return createClient<Database>(config.url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
