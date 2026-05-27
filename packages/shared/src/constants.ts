import type { DocsproutConfig } from "./types";

export const DEFAULT_IGNORES = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.next/**",
  "**/.*/**"
];

export const defaultConfig: DocsproutConfig = {
  projectName: "My Docsprout Site",
  contentRoots: ["."],
  ignore: DEFAULT_IGNORES,
  theme: "default",
  basePath: "/docs",
  adminPath: "/docs-admin",
  outputDir: "docsprout",
  includeDraftsInDev: true
};

