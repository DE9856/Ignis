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
          className="sr-only rounded bg-accent px-3 py-2 text-accent-ink focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8">
              {children}
            </main>
            <footer className="border-t border-line px-4 py-3 text-[11px] text-ink-faint lg:px-8">
              NASA is the source of scientific evidence. IGNIS is an independent hackathon prototype and is
              not an official NASA product.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
