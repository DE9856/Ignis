import { cn } from "@/lib/utils/cn";
import { UNKNOWN_LABEL } from "@/lib/utils/numbers";

/** Renders a field value; unknown values are visibly muted rather than blank. */
export function ExperimentValue({ value, numeric = false }: { value: string; numeric?: boolean }) {
  const unknown = value === UNKNOWN_LABEL;
  return (
    <span
      className={cn(
        unknown ? "text-ink-faint italic" : "text-ink",
        numeric && !unknown && "font-mono tabular-nums",
      )}
    >
      {value}
    </span>
  );
}
