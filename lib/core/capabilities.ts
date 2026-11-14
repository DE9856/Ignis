import { isVerified } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";
import { getMethodologyStatus } from "@/lib/ranking/methodology";
import { RETRIEVAL_IMPLEMENTED } from "@/lib/retrieval";

import { getLlmState, getSupabaseState, isEnvConfigured } from "./env";

/**
 * What this running instance can actually do. Pages read these flags to pick
 * between a working feature and an honest degraded state. Nothing here throws.
 */
export interface Capabilities {
  /**
   * Raw facts, each true only for the thing it names:
   * - `supabaseConfigured`: public URL and anon key are set and valid.
   * - `retrievalImplemented`: a real retriever has been installed in code
   *   (Member 5 flips `RETRIEVAL_IMPLEMENTED`). Never inferred from pgvector.
   * - `llmConfigured`: an LLM key is set. Says nothing about synthesis code.
   */
  supabaseConfigured: boolean;
  retrievalImplemented: boolean;
  llmConfigured: boolean;
  /** Usable features, derived from the facts above. */
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

/** Grounded synthesis is built (`lib/synthesis/`). It is enabled only when an LLM key is set. */
export const SYNTHESIS_IMPLEMENTED = true;

/**
 * Development mocks need two things: a non-production build and an explicit
 * opt-in. A production build can never serve synthetic data.
 */
export function areDevMocksEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_IGNIS_DEV_MOCKS === "1";
}

/** Server-side view. Pass the loaded investigations to fill in the knowledge flag. */
export function getCapabilities(investigations: Investigation[] = []): Capabilities {
  const supabaseEnabled = getSupabaseState() === "SUPABASE_CONFIGURED";

  return {
    supabaseConfigured: supabaseEnabled,
    retrievalImplemented: RETRIEVAL_IMPLEMENTED,
    llmConfigured: getLlmState() === "LLM_CONFIGURED",
    supabaseEnabled,
    ingestionEnabled: supabaseEnabled && isEnvConfigured("SUPABASE_SERVICE_ROLE_KEY"),
    retrievalEnabled: RETRIEVAL_IMPLEMENTED && supabaseEnabled,
    llmEnabled: SYNTHESIS_IMPLEMENTED && isEnvConfigured("OPTIONAL_LLM_API_KEY"),
    verifiedKnowledgeAvailable: investigations.some(isVerified),
    methodologyConfigured: getMethodologyStatus().configured,
    devMocksEnabled: areDevMocksEnabled(),
  };
}
