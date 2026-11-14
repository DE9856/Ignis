import { SAFETY_OBJECTIVES, type SafetyObjective } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { NOT_REPORTED, SAFETY_LABELS, SAFETY_LETTERS } from "./labels";

interface SafetyRoleProps {
  objectives: SafetyObjective[];
  /** `strip` shows P, D, S in fixed positions; `list` names only the tagged ones. */
  variant?: "strip" | "list";
  className?: string;
}

/**
 * Fire-safety role as P / D / S badges. In the strip variant the three letters
 * always sit in the same order, so roles line up when scanning cards or columns.
 */
export function SafetyRole({ objectives, variant = "strip", className }: SafetyRoleProps) {
  const label =
    objectives.length > 0
      ? `Fire-safety role: ${objectives.map((objective) => SAFETY_LABELS[objective]).join(", ")}`
      : `Fire-safety role: ${NOT_REPORTED}`;

  if (variant === "list") {
    if (objectives.length === 0) {
      return <span className={cn("text-xs text-ink-faint italic", className)}>{NOT_REPORTED}</span>;
    }
    return (
      <ul aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
        {SAFETY_OBJECTIVES.filter((objective) => objectives.includes(objective)).map((objective) => (
          <li
            key={objective}
            className="inline-flex h-5 items-center gap-1.5 rounded-[3px] border border-line-strong bg-raised/70 pr-1.5 text-xs text-ink"
          >
            <span
              aria-hidden
              className="grid h-full w-4.5 place-items-center border-r border-line-strong font-mono text-[10px] font-semibold"
            >
              {SAFETY_LETTERS[objective]}
            </span>
            {SAFETY_LABELS[objective]}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {SAFETY_OBJECTIVES.map((objective) => {
        const active = objectives.includes(objective);
        return (
          <span
            key={objective}
            aria-hidden
            className={cn(
              "grid size-5 place-items-center rounded-[3px] border font-mono text-[10px] leading-none font-semibold",
              active
                ? "border-ink-muted/70 bg-ink/90 text-canvas"
                : "border-dashed border-line-strong text-ink-faint/70",
            )}
          >
            {SAFETY_LETTERS[objective]}
          </span>
        );
      })}
      {objectives.length === 0 ? (
        <span className="ml-1.5 text-xs text-ink-faint italic">{NOT_REPORTED}</span>
      ) : null}
    </span>
  );
}
