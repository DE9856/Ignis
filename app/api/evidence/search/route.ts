import { handleSearchRequest } from "@/lib/retrieval/server";

// Evidence search for the Evidence Desk. All logic lives in lib/retrieval/server.ts (Member 5).
// No `runtime` export: Cache Components uses the Node.js runtime and rejects that option.
export async function POST(request: Request) {
  return handleSearchRequest(request);
}
