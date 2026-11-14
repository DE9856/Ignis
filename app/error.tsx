"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="This page failed to render"
      description={error instanceof Error ? error.message : "Unexpected error"}
      action={
        <button
          type="button"
          onClick={() => retry()}
          className="h-8 rounded border border-line-strong px-3 text-xs text-ink"
        >
          Try again
        </button>
      }
    />
  );
}
