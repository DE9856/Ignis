import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

import type { Metadata } from "next";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export const metadata: Metadata = {
  title: { default: "IGNIS", template: "%s · IGNIS" },
  description:
    "Evidence-first exploration of NASA microgravity combustion research for spacecraft fire safety. Independent hackathon prototype, not an official NASA product.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <a
          href="#main"
          className="sr-only rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main id="main" className="mx-auto w-full max-w-[84rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </main>
            <footer className="border-t border-line px-4 py-4 sm:px-6 lg:px-8">
              <p className="mx-auto max-w-[84rem] text-2xs leading-relaxed text-ink-faint">
                NASA is the source of scientific evidence. IGNIS is an independent hackathon prototype built
                for NASA Space Apps 2026 and is not an official NASA product. Not for flight safety decisions.
              </p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
