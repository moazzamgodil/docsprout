import type { ThemeConfig } from "@docsprout/shared";

export const defaultTheme: ThemeConfig = {
  colors: {
    background: "#0b1020",
    foreground: "#f8fafc",
    primary: "#22c55e",
    muted: "#94a3b8"
  },
  fonts: {
    heading: "'Space Grotesk', sans-serif",
    body: "'IBM Plex Sans', sans-serif",
    mono: "'JetBrains Mono', monospace"
  },
  spacing: {
    page: "1.5rem",
    section: "1rem"
  },
  layout: {
    sidebarWidth: "280px",
    pageWidth: "920px"
  },
  navbar: {
    title: "docsprout"
  },
  footer: {
    text: "Built with docsprout"
  },
  codeTheme: "github-dark"
};

