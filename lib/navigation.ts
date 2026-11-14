export interface NavigationItem {
  href: string;
  label: string;
  description: string;
}

/** Primary navigation, in header order. The landing page is reached from the IGNIS mark. */
export const NAVIGATION: NavigationItem[] = [
  { href: "/explore", label: "Investigations", description: "NASA combustion investigations" },
  { href: "/scenario", label: "Scenario", description: "Define a mission fire-safety scenario" },
  { href: "/compare", label: "Compare", description: "Investigations side by side" },
  { href: "/evidence", label: "Evidence Desk", description: "Search source passages" },
  { href: "/methodology", label: "Methodology", description: "Provenance, AI use, limitations" },
  { href: "/about", label: "About", description: "Project and technical overview" },
];

/** Shown in every footer. */
export const DISCLAIMER =
  "NASA is the source of scientific evidence. IGNIS is an independent hackathon prototype built for NASA Space Apps 2026 and is not an official NASA product. Not for flight safety decisions.";

export const AWAITING_EVIDENCE = "Awaiting verified NASA evidence";
