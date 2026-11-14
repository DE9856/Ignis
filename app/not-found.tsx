import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="This route does not exist in IGNIS."
      action={
        <Link href="/" className="text-xs text-ink underline underline-offset-2">
          Back to dashboard
        </Link>
      }
    />
  );
}
