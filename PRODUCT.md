# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary (landing page): NASA Space Apps 2026 judges.** They have a few minutes per project. They need to understand the problem, see that the tool works, and trust that the evidence is real.
- **Primary (tool pages): spacecraft and habitat fire-safety designers.** They describe a fire scenario and need to know which NASA combustion investigations tested comparable conditions, and where no evidence exists.
- Secondary: students and researchers curious about microgravity combustion.

## Product Purpose

IGNIS connects a described spacecraft or habitat fire scenario (oxygen, pressure, airflow, gravity, fuel, material) to the NASA microgravity combustion investigations that tested comparable conditions, and shows explicitly where verified evidence runs out. Success: a user leaves knowing which experiments apply, how closely, and what has never been tested.

## Positioning

Evidence-first, not answer-first. Every scientific statement traces to a cited NASA source; every record is checked against those sources by a second team member before the app uses it; unknown values stay unknown. Gaps are a result, not a failure.

## Operating Context

- Built by a five-person team for NASA Space Apps 2026; judged as a working prototype.
- Routes: `/` landing, `/explore`, `/scenario`, `/compare`, `/evidence`, `/methodology`, `/about`.
- Runs without any environment variables (local Markdown records); Supabase vector search and Groq synthesis are optional and degrade with notices.

## Capabilities and Constraints

- Stack is fixed: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, GSAP 3.15 (npm), Recharts, Lucide, IBM Plex Sans/Mono via @fontsource.
- Knowledge base: `knowledge/` OKF Markdown records. Only `status: stable` records with a `verified` entry by a non-author are ranked, searched or summarised.
- Hybrid retrieval (vector + lexical + metadata) and optional grounded LLM synthesis that is withheld when it fails verification.
- Every route shares the landing page's frame: field grid, window guide lines and the floating header. The landing page (`/`) is full-bleed with its own CTA footer; every other route uses a centred content column, display-type page header and compact footer.

## Brand Commitments

- Name: IGNIS.
- Must always state: "NASA is the source of scientific evidence. IGNIS is an independent hackathon prototype and is not an official NASA product. Not for flight safety decisions."
- No NASA logos, insignia or styling that implies an official NASA product.
- Flame imagery on the landing page is code-drawn (SVG/CSS/canvas), not photographs.

## Evidence on Hand

- 13 human-verified investigation records: ACME-BRE, ACME-CFI-G, ACME-E-FIELD, BASS, BASS-II, CFI, FLEX, FLEX-2, Saffire, SAME, SAME-R, SLICE, SPICE (`knowledge/investigations/`).
- 3 hardware and 7 concept records, still draft.
- Retrieval evaluation: `docs/retrieval-evaluation.md` (31 questions).
- Any number shown must be computed from these records at render time. No invented statistics, testimonials, users or partners exist; none may be fabricated.

## Product Principles

1. NASA is the source; IGNIS is the transcription. Never invent data; missing is `null` and shown as Unknown.
2. Show the gap. Where no evidence exists is a first-class answer.
3. Provenance is always visible: NASA source, human reviewed, computed, team interpretation, generated, unverified.
4. Prototype honesty: say what works, what is draft, and what is not for flight decisions.

## Accessibility & Inclusion

Text meets WCAG AA contrast. Motion respects `prefers-reduced-motion`; auto-advancing content pauses on hover and focus.
