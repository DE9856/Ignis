/**
 * Typed application errors.
 *
 * Each code has a fixed message that is safe to show a user. Internal detail
 * (file paths, causes) travels on the error object and is only surfaced in
 * development. Stack traces are never part of a user-facing message.
 */

export const ERROR_MESSAGES = {
  OKF_PARSE_ERROR: "A knowledge file could not be read.",
  INVALID_KNOWLEDGE_SCHEMA: "A knowledge file does not match the expected format.",
  DUPLICATE_CONCEPT_ID: "Two knowledge files share the same id.",
  NO_VERIFIED_EVIDENCE: "Verified NASA evidence has not yet been loaded.",
  SUPABASE_UNAVAILABLE: "The evidence database is not available.",
  RETRIEVAL_UNAVAILABLE: "Semantic retrieval is not available yet. Browse verified evidence instead.",
  INVALID_SCENARIO: "The scenario contains a value that cannot be used.",
  METHODOLOGY_NOT_CONFIGURED: "Mission relevance scoring is awaiting validated methodology.",
  DEV_ONLY: "This feature is only available in development.",
  UNEXPECTED: "Something went wrong.",
} as const;

export type IgnisErrorCode = keyof typeof ERROR_MESSAGES;

export interface IgnisErrorOptions {
  /** Internal detail for developers. Never shown to users in production. */
  detail?: string;
  cause?: unknown;
}

export class IgnisError extends Error {
  readonly code: IgnisErrorCode;
  readonly userMessage: string;
  readonly detail: string | null;

  constructor(code: IgnisErrorCode, options: IgnisErrorOptions = {}) {
    super(options.detail ? `${code}: ${options.detail}` : code, { cause: options.cause });
    this.name = "IgnisError";
    this.code = code;
    this.userMessage = ERROR_MESSAGES[code];
    this.detail = options.detail ?? null;
  }
}

export function isIgnisError(error: unknown): error is IgnisError {
  return error instanceof IgnisError;
}

export interface UserFacingError {
  code: IgnisErrorCode;
  message: string;
  /** Present only outside production. */
  detail: string | null;
}

/** Convert anything thrown into something safe to render or return from an API. */
export function toUserFacingError(
  error: unknown,
  isDevelopment: boolean = process.env.NODE_ENV !== "production",
): UserFacingError {
  if (isIgnisError(error)) {
    return { code: error.code, message: error.userMessage, detail: isDevelopment ? error.detail : null };
  }
  const detail = error instanceof Error ? error.message : typeof error === "string" ? error : null;
  return { code: "UNEXPECTED", message: ERROR_MESSAGES.UNEXPECTED, detail: isDevelopment ? detail : null };
}
