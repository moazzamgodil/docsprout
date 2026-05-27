import fs from "node:fs/promises";
import path from "node:path";
import type { DocPage, DocsproutConfig, SidebarItem } from "@docsprout/shared";

const resolveDocsRoot = async () => {
  let current = process.cwd();
  while (true) {
    const candidate = path.join(current, "docsprout");
    try {
      await fs.access(candidate);
      return current;
    } catch {
      const parent = path.dirname(current);
      if (parent === current) return process.cwd();
      current = parent;
    }
  }
};

const readJson = async <T>(parts: string[]): Promise<T> => {
  const root = await resolveDocsRoot();
  const file = path.join(root, ...parts);
  const raw = await fs.readFile(file, "utf-8");
  return JSON.parse(raw) as T;
};

export const readConfig = async (): Promise<DocsproutConfig> => readJson(["docsprout", "config.json"]);

export const readPages = async (): Promise<DocPage[]> => readJson(["docsprout", "generated", "pages.json"]);

export const readSidebar = async (): Promise<SidebarItem[]> => readJson(["docsprout", "sidebar.json"]);

export const getPublishedPages = async () => {
  const pages = await readPages();
  return pages.filter((page) => page.status === "published");
};

export const getPageBySlug = async (slug: string) => {
  const pages = await readPages();
  return pages.find((p) => p.slug === slug && p.status === "published") ?? null;
};
