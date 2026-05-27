import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "../components/providers";
import { readConfig } from "../lib/content";

export async function generateMetadata() {
  const config = await readConfig();
  const project = config.projectName || "Project";
  return {
    title: `${project} - Docsprout`,
    description: "Plug-and-play documentation"
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const config = await readConfig();
  const project = config.projectName || "docsprout";
  const theme = config.theme || "default";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning data-docsprout-theme={theme}>
        <Providers>
          <div className="min-h-screen">
            <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
              <div className="flex w-full items-center justify-between px-6 py-4">
                <a href="/" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{project}</a>
                <nav className="flex items-center gap-5 text-sm text-slate-600 dark:text-slate-300">
                  <a className="hover:text-slate-950 dark:hover:text-white" href="/docs">Docs</a>
                  <a className="hover:text-slate-950 dark:hover:text-white" href="/docs-admin">Admin</a>
                </nav>
              </div>
            </header>
            <div className="pt-[72px]">{children}</div>
            <footer className="mt-10 border-t border-slate-200/70 bg-white/60 dark:border-slate-800/70 dark:bg-slate-950/60">
              <div className="flex w-full items-center justify-between px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                <p>Built with docsprout</p>
                <p className="text-xs uppercase tracking-[0.14em]">Modern Docs Platform</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
