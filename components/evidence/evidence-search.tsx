"use client";

import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { getRetriever, type RetrievalResponse } from "@/lib/retrieval";

import { EvidenceCard } from "./evidence-card";

/** Search box wired to the retriever interface. The retriever itself is a placeholder. */
export function EvidenceSearch() {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<RetrievalResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (text.trim() === "") return;
    setPending(true);
    try {
      setResponse(await getRetriever().search({ text: text.trim() }));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="evidence-query" className="sr-only">
          Search evidence
        </label>
        <input
          id="evidence-query"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Search verified passages, e.g. a material, a condition, a measurement"
          className="h-9 min-w-0 flex-1 rounded border border-line-strong bg-canvas px-3 text-sm text-ink placeholder:text-ink-faint"
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center gap-2 rounded bg-accent px-3 text-sm font-medium text-accent-ink hover:brightness-110"
        >
          <Search aria-hidden className="size-4" />
          Search
        </button>
      </form>

      {pending ? <LoadingState label="Searching evidence" /> : null}

      {!pending && response === null ? (
        <EmptyState description="Results will list source passages with their NASA citation and review status." />
      ) : null}

      {!pending && response?.status === "unavailable" ? (
        <EmptyState title="Retrieval is not available yet" description={response.reason} />
      ) : null}

      {!pending && response?.status === "ok" ? (
        response.results.length === 0 ? (
          <EmptyState title="No verified passages match" description="Try fewer or broader terms." />
        ) : (
          <div className="space-y-3">
            {response.results.map((result) => (
              <EvidenceCard key={result.chunk.id} chunk={result.chunk} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
