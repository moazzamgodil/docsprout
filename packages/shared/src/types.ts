export type DocStatus = "draft" | "published";

export interface DocsproutConfig {
  projectName: string;
  contentRoots: string[];
  ignore: string[];
  theme: string;
  basePath: string;
  adminPath: string;
  outputDir: string;
  includeDraftsInDev: boolean;
}

export interface DocPage {
  id: string;
  title: string;
  slug: string;
  sourcePath: string;
  content: string;
  excerpt?: string;
  order?: number;
  status: DocStatus;
  tags: string[];
  metadata: Record<string, unknown>;
  updatedAt: string;
}

export interface SidebarItem {
  title: string;
  slug: string;
  path: string;
  children?: SidebarItem[];
}

export interface ScanResult {
  pages: DocPage[];
  sidebar: SidebarItem[];
  generatedAt: string;
}

export interface ThemeConfig {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  layout: {
    sidebarWidth: string;
    pageWidth: string;
  };
  navbar: {
    title: string;
    logo?: string;
  };
  footer: {
    text: string;
  };
  codeTheme: "github-dark" | "github-light";
}

export interface PluginContext {
  config: DocsproutConfig;
  scanResult: ScanResult;
}

export interface DocsproutPlugin {
  name: string;
  beforeScan?: (ctx: PluginContext) => Promise<void> | void;
  afterScan?: (ctx: PluginContext) => Promise<void> | void;
}

