export interface NavigationItem {
  href: string;
  label: string;
  description: string;
}

export const NAVIGATION: NavigationItem[] = [
  { href: "/", label: "Dashboard", description: "Evidence base at a glance" },
  { href: "/explore", label: "Evidence Explorer", description: "NASA combustion investigations" },
  { href: "/scenario", label: "Scenario Builder", description: "Define a mission fire-safety scenario" },
  { href: "/compare", label: "Compare", description: "Investigations side by side" },
  { href: "/evidence", label: "Evidence Desk", description: "Search source passages" },
  { href: "/methodology", label: "Methodology", description: "Provenance, AI use, limitations" },
  { href: "/about", label: "About", description: "Project and technical overview" },
];

export const AWAITING_EVIDENCE = "Awaiting verified NASA evidence";
