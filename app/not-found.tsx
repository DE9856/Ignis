import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { PRIMARY_ACTION, RouteMessage, SECONDARY_ACTION } from "@/components/layout/route-message";

export default function NotFound() {
  return (
    <RouteMessage
      code="404 · Not found"
      title="No record at this address."
      description="This route does not exist in IGNIS. The investigations, the scenario builder and the evidence desk are all reachable from the bar above."
      actions={
        <>
          <Link href="/" className={PRIMARY_ACTION}>
            Back to home
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
          <Link href="/explore" className={SECONDARY_ACTION}>
            Browse investigations
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </>
      }
    />
  );
}
