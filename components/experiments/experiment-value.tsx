import { isMissingDisplay, NOT_REPORTED } from "@/components/shared/labels";
import { cn } from "@/lib/utils/cn";
import { UNKNOWN_LABEL } from "@/lib/utils/numbers";

/**
 * Renders a field value. A missing value is a visible state ("Not reported",
 * muted and italic), never an empty cell.
 */
export function ExperimentValue({
  value,
  numeric = false,
  className,
}: {
  value: string;
  numeric?: boolean;
  className?: string;
}) {
  const missing = isMissingDisplay(value);
  return (
    <span
      className={cn(
        missing ? "text-ink-faint italic" : "text-ink",
        numeric && !missing && "font-mono text-[0.92em] tabular-nums",
        className,
      )}
    >
      {value === UNKNOWN_LABEL ? NOT_REPORTED : value}
    </span>
  );
}
