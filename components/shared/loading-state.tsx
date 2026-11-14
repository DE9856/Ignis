import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** The only animation in IGNIS: a spinner while something is genuinely in progress. */
export function LoadingState({ label = "Loading", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-2.5 px-6 py-10 text-xs text-ink-muted", className)}
    >
      <LoaderCircle aria-hidden className="size-4 animate-spin text-ink-faint" />
      <span>{label}</span>
    </div>
  );
}
