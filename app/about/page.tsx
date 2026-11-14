import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ReadSection } from "@/components/shared/read-section";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/retrieval";

export const metadata: Metadata = { title: "About" };

const STACK = [
  ["Application", "Next.js App Router, React, TypeScript"],
  ["Styling", "Tailwind CSS, GSAP, Lucide icons, Recharts"],
  ["Knowledge", "OKF-style Markdown with YAML frontmatter, parsed with gray-matter, validated with Zod"],
  ["Computation", "Plain TypeScript functions for ranking and gap analysis"],
  [
    "Search",
    `Hybrid vector, keyword and metadata retrieval; ${EMBEDDING_MODEL} embeddings (${EMBEDDING_DIMENSIONS} dimensions)`,
  ],
  ["Storage (optional)", "Supabase PostgreSQL with pgvector; local records are used without it"],
  ["Answers (optional)", "Groq-hosted language model, reviewed against the retrieved passages"],
  ["Tests", "Vitest"],
];

const PATHS = [
  ["knowledge/", "The source of truth. One Markdown file per record."],
  ["lib/okf", "Types, schema, parser and loader for those files."],
  ["lib/ranking", "Relevance scoring and gap analysis."],
  ["lib/retrieval", "Chunking, embedding and hybrid search over reviewed records."],
  ["lib/synthesis", "Optional grounded answers and their review."],
  ["components/", "UI, grouped by page area."],
  ["docs/", "Architecture, data contract, retrieval evaluation, contribution guide."],
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="About IGNIS"
        description="An evidence-first way to explore NASA microgravity combustion research and relate it to fire-safety scenarios for future human spaceflight."
      />
      <ScrollReveal className="space-y-0">
        <ReadSection id="what" title="What it is">
          <div className="max-w-[40rem] space-y-4 text-pretty">
            <p>
              Fire behaves differently without buoyancy. NASA has studied this for decades. IGNIS collects
              that research into structured, cited records, then lets you ask which experiments tested
              conditions close to a mission scenario and where no evidence exists.
            </p>
            <p>
              Built for NASA Space Apps 2026. NASA is the source of scientific evidence. IGNIS is an
              independent hackathon prototype and is not an official NASA product. Not for flight safety
              decisions.
            </p>
          </div>
        </ReadSection>

        <ReadSection
          id="stack"
          title="Technical overview"
          lede="What it is built with. Without any environment variables it runs on the local records alone."
        >
          <dl className="divide-y divide-line border-y border-line">
            {STACK.map(([layer, detail]) => (
              <div key={layer} className="grid gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[11rem_1fr]">
                <dt className="font-medium text-ink">{layer}</dt>
                <dd className="text-pretty">{detail}</dd>
              </div>
            ))}
          </dl>
        </ReadSection>

        <ReadSection id="paths" title="Where things live" lede="For anyone reading the code.">
          <dl className="divide-y divide-line border-y border-line">
            {PATHS.map(([path, detail]) => (
              <div key={path} className="grid gap-x-4 gap-y-0.5 py-3 sm:grid-cols-[11rem_1fr]">
                <dt className="font-mono text-sm2 text-ink">{path}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </ReadSection>
      </ScrollReveal>
    </>
  );
}
