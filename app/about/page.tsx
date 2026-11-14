import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/shared/section";

export const metadata: Metadata = { title: "About" };

const STACK = [
  ["Application", "Next.js App Router, React, TypeScript"],
  ["Styling", "Tailwind CSS, Lucide icons, Recharts"],
  ["Knowledge", "OKF-style Markdown with YAML frontmatter, parsed with gray-matter, validated with Zod"],
  ["Computation", "Plain TypeScript functions for ranking and gap analysis"],
  ["Storage (planned)", "Supabase PostgreSQL with pgvector"],
  ["Tests", "Vitest"],
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="About IGNIS"
        description="An evidence-first way to explore NASA microgravity combustion research and relate it to fire-safety scenarios for future human spaceflight."
      />
      <div className="space-y-6">
        <Section title="What it is">
          <div className="max-w-3xl space-y-3 text-[13px] text-ink-muted">
            <p>
              Fire behaves differently without buoyancy. NASA has studied this for decades. IGNIS collects
              that research into structured, cited records, then lets you ask which experiments tested
              conditions close to a mission scenario and where no evidence exists.
            </p>
            <p>
              Built for NASA Space Apps 2026. NASA is the source of scientific evidence. IGNIS is an
              independent hackathon prototype and is not an official NASA product.
            </p>
          </div>
        </Section>

        <Section title="Technical overview" description="For the team" flush>
          <table className="w-full text-left text-[13px]">
            <tbody className="divide-y divide-line">
              {STACK.map(([layer, detail]) => (
                <tr key={layer}>
                  <th scope="row" className="w-44 px-4 py-2 align-top font-medium text-ink">
                    {layer}
                  </th>
                  <td className="px-4 py-2 text-ink-muted">{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Where things live">
          <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-[13px]">
            <dt className="font-mono text-ink">knowledge/</dt>
            <dd className="text-ink-muted">The source of truth. One Markdown file per record.</dd>
            <dt className="font-mono text-ink">lib/okf</dt>
            <dd className="text-ink-muted">Types, schema, parser and loader for those files.</dd>
            <dt className="font-mono text-ink">lib/ranking</dt>
            <dd className="text-ink-muted">Relevance scoring and gap analysis.</dd>
            <dt className="font-mono text-ink">lib/retrieval</dt>
            <dd className="text-ink-muted">Interfaces for search. Implementation pending.</dd>
            <dt className="font-mono text-ink">components/</dt>
            <dd className="text-ink-muted">UI, grouped by page area.</dd>
            <dt className="font-mono text-ink">docs/</dt>
            <dd className="text-ink-muted">Architecture, data contract, contribution guide.</dd>
          </dl>
        </Section>
      </div>
    </>
  );
}
