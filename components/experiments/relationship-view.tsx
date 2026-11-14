"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { SAFETY_LABELS, SAFETY_LETTERS } from "@/components/shared/labels";
import { slugify, type GenericOkfDocument } from "@/lib/okf/parser";
import type { Investigation } from "@/lib/okf/types";
import { cn } from "@/lib/utils/cn";

import { displayTitle } from "./experiment-fields";

interface Node {
  key: string;
  label: string;
}

interface Chain {
  investigation: Investigation;
  /** Hardware the record names, each followed by the hardware it sits in, if recorded. */
  paths: Node[][];
}

function hardwareChains(investigation: Investigation, hardware: GenericOkfDocument[]): Node[][] {
  const byId = new Map(hardware.map((document) => [document.id, document]));
  const named = new Map<string, Node>();

  for (const name of investigation.hardware) named.set(slugify(name), { key: slugify(name), label: name });
  for (const link of investigation.related) {
    const [folder, id] = link.id.split("/");
    if (folder !== "hardware" || named.has(id)) continue;
    named.set(id, { key: id, label: byId.get(id)?.metadata.title ?? id });
  }

  return [...named.values()].map((node) => {
    const parents = (byId.get(node.key)?.metadata.related ?? [])
      .map((link) => link.id.split("/"))
      .filter(([folder, id]) => folder === "hardware" && id !== node.key)
      .map(([, id]) => ({ key: id, label: byId.get(id)?.metadata.title ?? id }));
    return [node, ...parents.slice(0, 1)];
  });
}

/**
 * Knowledge relationships, kept simple: each investigation, the hardware it
 * names, the facility that hardware sits in when a hardware record says so,
 * and its fire-safety role. Only links stated in the records are drawn.
 * Hover or focus a hardware node to see every investigation that shares it.
 */
export function RelationshipView({
  investigations,
  hardware,
  className,
}: {
  investigations: Investigation[];
  hardware: GenericOkfDocument[];
  className?: string;
}) {
  const [highlight, setHighlight] = useState<string | null>(null);

  const active = investigations.filter((investigation) => investigation.status !== "deprecated");

  if (active.length === 0) {
    return (
      <EmptyState
        description="Links between investigations, hardware and fire-safety roles are drawn from the records once they exist."
        className={className}
      />
    );
  }

  const chains: Chain[] = active.map((investigation) => ({
    investigation,
    paths: hardwareChains(investigation, hardware),
  }));
  const shareCount = new Map<string, number>();
  for (const chain of chains) {
    for (const key of new Set(chain.paths.flat().map((node) => node.key))) {
      shareCount.set(key, (shareCount.get(key) ?? 0) + 1);
    }
  }

  return (
    <div className={className}>
      <ul className="divide-y divide-line rounded-md border border-line">
        {chains.map(({ investigation, paths }) => {
          const involved =
            highlight === null || paths.some((path) => path.some((node) => node.key === highlight));
          return (
            <li
              key={investigation.id}
              className={cn(
                "grid gap-x-4 gap-y-2 px-3 py-2.5 transition-opacity sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center",
                !involved && "opacity-35",
              )}
            >
              <a
                href={`#${investigation.id}`}
                className="truncate text-sm2 font-medium text-ink hover:text-accent"
              >
                {displayTitle(investigation)}
              </a>
              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1.5">
                <span aria-hidden className="hidden h-px w-4 bg-line-strong sm:block" />
                {paths.length === 0 ? (
                  <span className="text-xs text-ink-faint italic">Hardware not reported</span>
                ) : (
                  paths.map((path, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5">
                      {index > 0 ? <span aria-hidden className="mx-1 h-3 w-px bg-line-strong" /> : null}
                      {path.map((node, step) => (
                        <span key={node.key} className="inline-flex items-center gap-1.5">
                          {step > 0 ? (
                            <span className="inline-flex items-center text-ink-faint">
                              <ArrowRight aria-hidden className="size-3" />
                              <span className="sr-only">inside</span>
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onMouseEnter={() => setHighlight(node.key)}
                            onMouseLeave={() => setHighlight(null)}
                            onFocus={() => setHighlight(node.key)}
                            onBlur={() => setHighlight(null)}
                            aria-label={`${node.label}, named by ${shareCount.get(node.key) ?? 1} investigation${(shareCount.get(node.key) ?? 1) === 1 ? "" : "s"}`}
                            className={cn(
                              "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 font-mono text-xs transition-colors",
                              highlight === node.key
                                ? "border-accent/60 bg-accent/10 text-ink"
                                : "border-line-strong bg-raised/60 text-ink-muted hover:text-ink",
                            )}
                          >
                            {node.label}
                            {(shareCount.get(node.key) ?? 0) > 1 ? (
                              <span className="text-2xs text-ink-faint">×{shareCount.get(node.key)}</span>
                            ) : null}
                          </button>
                        </span>
                      ))}
                    </span>
                  ))
                )}
                <span className="mx-1 inline-flex items-center text-ink-faint">
                  <ArrowRight aria-hidden className="size-3" />
                  <span className="sr-only">fire-safety role</span>
                </span>
                {investigation.safetyCategories.length === 0 ? (
                  <span className="text-xs text-ink-faint italic">Role not reported</span>
                ) : (
                  investigation.safetyCategories.map((objective) => (
                    <span
                      key={objective}
                      title={SAFETY_LABELS[objective]}
                      className="inline-flex h-6 items-center gap-1 rounded-md border border-line-strong px-1.5 text-xs text-ink"
                    >
                      <span aria-hidden className="font-mono text-2xs font-semibold text-ink-faint">
                        {SAFETY_LETTERS[objective]}
                      </span>
                      {SAFETY_LABELS[objective]}
                    </span>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-ink-faint">
        Hover or focus a hardware name to highlight every investigation that shares it. Hardware to hardware
        arrows read &quot;sits inside&quot;, as stated in hardware records; the last arrow leads to the
        record&apos;s fire-safety role.
      </p>
    </div>
  );
}
