import { CircleDashed } from "lucide-react";

import { DIMENSION_LABELS } from "@/components/shared/labels";
import { DEGRADED_MESSAGES } from "@/lib/core/degraded";
import { RESEARCH_QUESTION_LABEL, type ResearchQuestion } from "@/lib/ranking/types";
import { cn } from "@/lib/utils/cn";

/**
 * The project-generated research question for the largest gap. Written from
 * the methodology's templates, never by a language model, and never presented
 * as a NASA recommendation. Shows an honest waiting state until a question exists.
 */
export function ResearchQuestionPanel({
  question,
  className,
}: {
  question: ResearchQuestion | null;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative rounded-md border border-dashed border-interpretation/40 bg-interpretation/[0.04] px-3.5 py-3",
        className,
      )}
    >
      <figcaption className="font-mono text-2xs tracking-[0.1em] text-interpretation uppercase">
        {RESEARCH_QUESTION_LABEL}
      </figcaption>
      {question ? (
        <>
          <blockquote className="mt-2 text-sm leading-relaxed text-pretty text-ink">
            {question.text}
          </blockquote>
          <p className="mt-2 text-xs text-ink-faint">
            Based on the {DIMENSION_LABELS[question.basedOn].toLowerCase()} gap. A question for further
            research, not a NASA recommendation.
          </p>
        </>
      ) : (
        <p className="mt-2 flex items-start gap-2 text-xs text-ink-muted">
          <CircleDashed aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
          <span>
            {DEGRADED_MESSAGES.noMethodology} Research questions are written from its templates for the
            largest gap, and are labelled as project-generated.
          </span>
        </p>
      )}
    </figure>
  );
}
