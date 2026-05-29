import fs from "node:fs/promises";
import path from "node:path";
import { defaultConfig } from "@docsprout/shared";
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

const readJsonOrDefault = async <T>(parts: string[], fallback: T): Promise<T> => {
  try {
    return await readJson<T>(parts);
  } catch (error) {
    const known = error as NodeJS.ErrnoException;
    if (known.code === "ENOENT") return fallback;
    throw error;
  }
};

export const readConfig = async (): Promise<DocsproutConfig> =>
  readJsonOrDefault(["docsprout", "config.json"], defaultConfig);

export const readPages = async (): Promise<DocPage[]> =>
  readJsonOrDefault(["docsprout", "generated", "pages.json"], []);

export const readSidebar = async (): Promise<SidebarItem[]> =>
  readJsonOrDefault(["docsprout", "sidebar.json"], []);

export const getPublishedPages = async () => {
  const pages = await readPages();
  return pages.filter((page) => page.status === "published");
};

export const getPageBySlug = async (slug: string) => {
  const pages = await readPages();
  return pages.find((p) => p.slug === slug && p.status === "published") ?? null;
};
