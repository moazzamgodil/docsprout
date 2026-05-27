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
