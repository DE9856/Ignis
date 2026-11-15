import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { ProvenanceBadge } from "@/components/evidence/provenance-badge";
import { Section } from "@/components/shared/section";
import { isPartialGravityScenario, scenarioQuestion } from "@/lib/integration/scenario";
import { EVIDENCE_QUESTION_PARAM } from "@/lib/navigation";
import type { MissionScenario } from "@/lib/ranking/types";

/**
 * Hands the scenario to the Evidence Desk as a question. There, the grounded
 * summary is written only from retrieved reviewed passages, checked, and shown
 * above the passages it came from.
 */
export function AskEvidence({
  scenario,
  synthesisAvailable,
}: {
  scenario: MissionScenario;
  synthesisAvailable: boolean;
}) {
  const question = scenarioQuestion(scenario);
  const href = question ? `/evidence?${new URLSearchParams({ [EVIDENCE_QUESTION_PARAM]: question })}` : null;

  return (
    <Section
      id="interpret"
      title="Interpret this scenario"
      description={
        synthesisAvailable
          ? "The ranking compares exact values. The Evidence Desk explains what the reviewed passages say about conditions like these, in a summary written from them alone, with citations; a summary that fails its checks is withheld."
          : "The ranking compares exact values. The Evidence Desk retrieves the reviewed passages about conditions like these. Generated summaries are switched off on this deployment, so the passages are the answer."
      }
      meta={synthesisAvailable ? <ProvenanceBadge value="GENERATED_SUMMARY" /> : undefined}
    >
      {href ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-ink">
              <span className="text-ink-faint">Question: </span>
              {question}
            </p>
            {isPartialGravityScenario(scenario) ? (
              <p className="text-xs text-ink-muted">
                Your scenario is at {scenario.gravityG} g. No reviewed investigation was run in partial
                gravity, so the answer describes microgravity, which can only bound your case.
              </p>
            ) : null}
          </div>
          <Link
            href={href}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-accent px-4 text-xs font-medium text-accent-ink transition-[filter] hover:brightness-110"
          >
            <Sparkles aria-hidden className="size-3.5" />
            Ask the Evidence Desk
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">Set at least one condition to ask about it.</p>
      )}
    </Section>
  );
}
