"use client";

import { ArrowRight, RotateCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { PRIMARY_ACTION, RouteMessage, SECONDARY_ACTION } from "@/components/layout/route-message";

export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <RouteMessage
      tone="danger"
      code="Render error"
      title="This page failed to render."
      description={
        <>
          Something went wrong while drawing this page. The records are unchanged; trying again usually works.
          {digest ? (
            <span className="mt-2 block font-mono text-xs text-ink-faint">Reference: {digest}</span>
          ) : null}
        </>
      }
      actions={
        <>
          <button type="button" onClick={() => retry()} className={PRIMARY_ACTION}>
            Try again
            <RotateCw aria-hidden className="size-4" />
          </button>
          <Link href="/" className={SECONDARY_ACTION}>
            Back to home
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </>
      }
    />
  );
}
