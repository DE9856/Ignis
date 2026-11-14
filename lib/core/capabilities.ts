import { isVerified } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";
import { getMethodologyStatus } from "@/lib/ranking/methodology";
import { RETRIEVAL_IMPLEMENTED } from "@/lib/retrieval";

import { isEnvConfigured } from "./env";

/**
 * What this running instance can actually do. Pages read these flags to pick
 * between a working feature and an honest degraded state. Nothing here throws.
 */
export interface Capabilities {
  /** Public Supabase URL and anon key are both set and valid. */
  supabaseEnabled: boolean;
  /** Service-role key is available to server code and scripts. */
  ingestionEnabled: boolean;
  /** A real retriever exists AND Supabase is configured. */
  retrievalEnabled: boolean;
  /** Synthesis is implemented AND an LLM key is set. */
  llmEnabled: boolean;
  /** At least one human-reviewed investigation is loaded. */
  verifiedKnowledgeAvailable: boolean;
  /** Member 3 has supplied an approved methodology configuration. */
  methodologyConfigured: boolean;
  /** Synthetic development mocks are switched on. Always false in production. */
  devMocksEnabled: boolean;
}

/** Flip to true in the pull request that adds grounded synthesis. */
export const SYNTHESIS_IMPLEMENTED = false;

/**
 * Development mocks need two things: a non-production build and an explicit
 * opt-in. A production build can never serve synthetic data.
 */
export function areDevMocksEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_IGNIS_DEV_MOCKS === "1";
}

/** Server-side view. Pass the loaded investigations to fill in the knowledge flag. */
export function getCapabilities(investigations: Investigation[] = []): Capabilities {
  const supabaseEnabled =
    isEnvConfigured("NEXT_PUBLIC_SUPABASE_URL") && isEnvConfigured("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    supabaseEnabled,
    ingestionEnabled: supabaseEnabled && isEnvConfigured("SUPABASE_SERVICE_ROLE_KEY"),
    retrievalEnabled: RETRIEVAL_IMPLEMENTED && supabaseEnabled,
    llmEnabled: SYNTHESIS_IMPLEMENTED && isEnvConfigured("OPTIONAL_LLM_API_KEY"),
    verifiedKnowledgeAvailable: investigations.some(isVerified),
    methodologyConfigured: getMethodologyStatus().configured,
    devMocksEnabled: areDevMocksEnabled(),
  };
}
