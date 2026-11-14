import { getServerStore } from "@/lib/retrieval/server";
import { handleSynthesisRequest } from "@/lib/synthesis/server";

// Optional grounded synthesis for the Evidence Desk. All logic lives in lib/synthesis/server.ts.
// No `runtime` export: Cache Components uses the Node.js runtime and rejects that option.
export async function POST(request: Request) {
  return handleSynthesisRequest(request, getServerStore);
}
