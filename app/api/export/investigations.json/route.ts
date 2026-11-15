import { toExportDocument } from "@/lib/integration/export";
import { loadKnowledgeBase } from "@/lib/okf/loader";

/**
 * GET /api/export/investigations.json
 *
 * Reviewed test-condition ranges as JSON, with units and what null means.
 * Reads only local records and no request data, so it is prerendered at build time.
 */
export function GET() {
  return Response.json(toExportDocument(loadKnowledgeBase().investigations), {
    headers: { "Content-Disposition": 'inline; filename="ignis-investigations.json"' },
  });
}
