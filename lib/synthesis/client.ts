import { SYNTHESIS_ENDPOINT, type SynthesisRequest, type SynthesisResponse } from "./types";

/** Browser side: asks the server to summarise selected passages. Never throws. */
export async function requestSynthesis(
  request: SynthesisRequest,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<SynthesisResponse> {
  try {
    const response = await fetchImpl(SYNTHESIS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const body = (await response.json().catch(() => null)) as SynthesisResponse | { error?: unknown } | null;
    if (body && "status" in body) return body;
    const message = body && "error" in body && typeof body.error === "string" ? body.error : null;
    return { status: "unavailable", reason: message ?? `Summary service returned HTTP ${response.status}.` };
  } catch {
    return { status: "unavailable", reason: "The summary service could not be reached." };
  }
}
