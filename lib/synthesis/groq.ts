import type { ChatMessage } from "./prompt";

/**
 * Minimal Groq client: one chat completion through Groq's OpenAI-compatible
 * API. Server only: it reads the key from the environment and the key never
 * leaves this process. No SDK, so no new dependency.
 */

export const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Used when OPTIONAL_LLM_MODEL is not set. Check availability with `npm run check:llm`. */
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

const TIMEOUT_MS = 30_000;
/** Reasoning models spend part of this on thinking, so it is generous. */
const MAX_COMPLETION_TOKENS = 4_000;

/** gpt-oss models reason before answering; the summary needs little of it. */
function reasoningOptions(model: string): Record<string, string> {
  return model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {};
}

export interface LlmConfig {
  apiKey: string;
  model: string;
}

export function readLlmConfig(env: Record<string, string | undefined> = process.env): LlmConfig | null {
  const apiKey = env.OPTIONAL_LLM_API_KEY?.trim();
  if (!apiKey) return null;
  return { apiKey, model: env.OPTIONAL_LLM_MODEL?.trim() || DEFAULT_GROQ_MODEL };
}

export class LlmError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

interface ChatCompletion {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
}

/** Returns the model's reply text. Throws LlmError with a message safe to show. */
export async function completeChat(
  messages: ChatMessage[],
  config: LlmConfig,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<string> {
  let response: Response;
  try {
    response = await fetchImpl(GROQ_CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        response_format: { type: "json_object" },
        ...reasoningOptions(config.model),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = (error as Error).name === "TimeoutError";
    throw new LlmError(
      timedOut ? "The language model did not answer in time." : "The language model could not be reached.",
    );
  }

  const body = (await response.json().catch(() => null)) as ChatCompletion | null;
  if (!response.ok) {
    const detail =
      response.status === 401
        ? "the API key was rejected"
        : response.status === 429
          ? "the rate limit was reached; try again in a minute"
          : response.status === 404
            ? `model "${config.model}" was not found`
            : (body?.error?.message ?? `HTTP ${response.status}`);
    throw new LlmError(`The language model request failed: ${detail}.`, response.status);
  }

  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new LlmError("The language model returned an empty answer.");
  }
  return content;
}
