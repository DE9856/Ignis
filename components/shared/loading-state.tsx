import { LoaderCircle } from "lucide-react";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 px-6 py-10 text-xs text-ink-muted">
      <LoaderCircle aria-hidden className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
