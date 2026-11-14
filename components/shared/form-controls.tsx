import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Shared input styling. Inputs sit on the sunken surface so they read as editable. */
export const INPUT_CLASS =
  "h-9 w-full rounded-md border border-line-strong bg-sunken px-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors hover:border-ink-faint/60 focus-visible:border-accent/70 aria-invalid:border-danger/70";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

export function Field({ id, label, hint, error, children, className }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-ink">{label}</span>
        {hint ? <span className="truncate text-ink-faint">{hint}</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface NumberInputProps {
  id: string;
  value: string;
  unit: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  label?: string;
  className?: string;
}

/**
 * Numeric text field with its unit drawn inside. Blank means "not part of the
 * scenario"; it is never filled with a suggested value.
 */
export function NumberInput({
  id,
  value,
  unit,
  onChange,
  invalid = false,
  label,
  className,
}: NumberInputProps) {
  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        aria-label={label}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(INPUT_CLASS, "pr-12 font-mono tabular-nums")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 font-mono text-2xs text-ink-faint"
      >
        {unit}
      </span>
    </div>
  );
}

interface ToggleChipProps {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  disabled?: boolean;
  className?: string;
}

/** A filter chip. `aria-pressed` carries the state; the count says what it would show. */
export function ToggleChip({ pressed, onClick, children, count, disabled, className }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        pressed
          ? "border-accent/60 bg-accent/10 text-ink"
          : "border-line-strong text-ink-muted hover:border-ink-faint/60 hover:text-ink",
        className,
      )}
    >
      {children}
      {count !== undefined ? (
        <span className={cn("font-mono text-2xs tabular-nums", pressed ? "text-accent" : "text-ink-faint")}>
          {count}
        </span>
      ) : null}
    </button>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  short?: string;
}

interface SegmentedControlProps<T extends string> {
  name: string;
  legend: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  hideLegend?: boolean;
  className?: string;
}

/** Radio group drawn as a segmented control. Arrow keys move between options natively. */
export function SegmentedControl<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  hideLegend = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className={className}>
      <legend className={cn("mb-1 text-xs font-medium text-ink", hideLegend && "sr-only")}>{legend}</legend>
      <div className="inline-flex h-9 w-full rounded-md border border-line-strong bg-sunken p-0.5">
        {options.map((option) => {
          const id = `${name}-${option.value || "none"}`;
          return (
            <div key={option.value} className="relative flex-1">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                title={option.label}
                className="flex h-full cursor-pointer items-center justify-center rounded-[5px] px-2 text-xs whitespace-nowrap text-ink-muted transition-colors peer-checked:bg-raised peer-checked:text-ink peer-checked:shadow-[inset_0_0_0_1px_var(--color-line-strong)] peer-focus-visible:outline-2 peer-focus-visible:outline-accent hover:text-ink"
              >
                {option.short ?? option.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
