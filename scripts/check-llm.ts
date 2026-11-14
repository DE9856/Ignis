/**
 * npm run check:llm [-- --models]
 *
 * Checks that grounded synthesis can reach Groq: the key is accepted, the
 * configured model exists, and one tiny JSON-mode request succeeds.
 * Prints states and model ids; never the key.
 *
 *   --models  also list every model id the key can use.
 *
 * Exit codes:
 *   0  ready, or no key configured (synthesis is optional)
 *   1  a key is configured but synthesis would fail
 */
import { completeChat, LlmError, readLlmConfig } from "@/lib/synthesis/groq";

import { loadLocalEnv, pad, parseArgs } from "./lib/cli";

const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

loadLocalEnv();
const listModels = parseArgs().flags.has("models");

async function main(): Promise<number> {
  const config = readLlmConfig();
  if (!config) {
    console.log("OPTIONAL_LLM_API_KEY is not set. Synthesis stays off; the rest of IGNIS is unaffected.");
    return 0;
  }
  console.log(`${pad("Provider", 16)}Groq`);
  console.log(
    `${pad("Model", 16)}${config.model}${process.env.OPTIONAL_LLM_MODEL?.trim() ? "" : " (default)"}`,
  );

  const response = await fetch(GROQ_MODELS_URL, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!response) {
    console.log(`${pad("Key", 16)}unknown: Groq could not be reached`);
    return 1;
  }
  if (response.status === 401) {
    console.log(`${pad("Key", 16)}rejected. Copy the key again from console.groq.com/keys.`);
    return 1;
  }
  if (!response.ok) {
    console.log(`${pad("Key", 16)}unknown: Groq answered HTTP ${response.status}`);
    return 1;
  }
  console.log(`${pad("Key", 16)}accepted`);

  const body = (await response.json().catch(() => null)) as {
    data?: { id: string; active?: boolean }[];
  } | null;
  const models = (body?.data ?? [])
    .filter((model) => model.active !== false)
    .map((model) => model.id)
    .sort();
  const available = models.includes(config.model);
  console.log(`${pad("Model exists", 16)}${available ? "yes" : "no"}`);
  if (listModels || !available) {
    console.log(`\nModels this key can use (set one as OPTIONAL_LLM_MODEL):`);
    for (const id of models) console.log(`  ${id}`);
  }
  if (!available) return 1;

  try {
    const reply = await completeChat(
      [
        { role: "system", content: 'Reply with the JSON object {"ok": true} and nothing else.' },
        { role: "user", content: "Health check." },
      ],
      config,
    );
    const ok = /"ok"\s*:\s*true/.test(reply);
    console.log(
      `${pad("Test request", 16)}${ok ? "ok (JSON mode works)" : "answered, but not with the expected JSON"}`,
    );
    return ok ? 0 : 1;
  } catch (error) {
    console.log(
      `${pad("Test request", 16)}failed: ${error instanceof LlmError ? error.message : "unknown error"}`,
    );
    return 1;
  }
}

main().then((code) => process.exit(code));
