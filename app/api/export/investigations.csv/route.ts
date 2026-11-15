import { toCsv, toExportRecords } from "@/lib/integration/export";
import { loadKnowledgeBase } from "@/lib/okf/loader";

/**
 * GET /api/export/investigations.csv
 *
 * Reviewed test-condition ranges as CSV. Reads only local records and no
 * request data, so it is prerendered at build time.
 */
export function GET() {
  const csv = toCsv(toExportRecords(loadKnowledgeBase().investigations));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ignis-investigations.csv"',
    },
  });
}
