import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import {
  defaultConfig,
  normalizeSlug,
  relativeUnixPath,
  type DocPage,
  type DocsproutConfig,
  type ScanResult,
  type SidebarItem
} from "@docsprout/shared";

const docsproutDir = (cwd: string, outputDir: string) => path.join(cwd, outputDir);

export const ensureDocsproutStructure = async (cwd: string, cfg: DocsproutConfig = defaultConfig) => {
  const root = docsproutDir(cwd, cfg.outputDir);
  const dirs = ["content", "generated", "themes", "uploads", "cache"];

  await fs.mkdir(root, { recursive: true });
  await Promise.all(dirs.map((d) => fs.mkdir(path.join(root, d), { recursive: true })));

  await fs.writeFile(path.join(root, "config.json"), JSON.stringify(cfg, null, 2));
};

export const loadConfig = async (cwd: string): Promise<DocsproutConfig> => {
  const file = path.join(cwd, "docsprout", "config.json");
  try {
    const raw = await fs.readFile(file, "utf-8");
    return { ...defaultConfig, ...JSON.parse(raw) } as DocsproutConfig;
  } catch {
    return defaultConfig;
  }
};

const toPagesSidebar = (pages: DocPage[]): SidebarItem[] => {
  return pages.map((page) => ({
    title: page.title,
    slug: page.slug,
    path: page.sourcePath
  }));
};

const titleFromSlug = (slug: string) => {
  const token = slug.split("/").at(-1) ?? "index";
  return token
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

const getEffectiveIgnore = (cfg: DocsproutConfig): string[] => {
  const out = cfg.outputDir.replace(/\\/g, "/");
  return [
    ...cfg.ignore,
    `${out}/generated/**`,
    `${out}/cache/**`,
    `${out}/uploads/**`,
    `${out}/themes/**`,
    `${out}/web/**`
  ];
};

export const scanMarkdown = async (cwd: string, cfg: DocsproutConfig): Promise<ScanResult> => {
  const patterns = cfg.contentRoots.map((root) => `${root.replace(/\\/g, "/")}/**/*.{md,mdx,MD,MDX}`);
  const files = await fg(patterns, {
    cwd,
    absolute: true,
    ignore: getEffectiveIgnore(cfg),
    onlyFiles: true,
    unique: true,
    dot: false
  });

  const pages: DocPage[] = [];

  for (const file of files) {
    try {
      const raw = await fs.readFile(file, "utf-8");
      const parsed = matter(raw);
      const rel = relativeUnixPath(cwd, file);
      const slug = normalizeSlug(rel);
      const status = (parsed.data.status as "draft" | "published" | undefined) ?? "published";

      pages.push({
        id: slug,
        title: (parsed.data.title as string | undefined) ?? titleFromSlug(slug),
        slug,
        sourcePath: file,
        content: parsed.content,
        excerpt: parsed.excerpt,
        order: parsed.data.order as number | undefined,
        status,
        tags: Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : [],
        metadata: parsed.data ?? {},
        updatedAt: new Date().toISOString()
      });
    } catch {
      // Skip unreadable markdown files; continue scanning remaining files.
    }
  }

  pages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.slug.localeCompare(b.slug));

  return {
    pages,
    sidebar: toPagesSidebar(pages),
    generatedAt: new Date().toISOString()
  };
};

export const writeScanOutput = async (cwd: string, cfg: DocsproutConfig, result: ScanResult) => {
  const out = docsproutDir(cwd, cfg.outputDir);
  const generatedDir = path.join(out, "generated");

  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(path.join(out, "sidebar.json"), JSON.stringify(result.sidebar, null, 2));
  await fs.writeFile(path.join(generatedDir, "pages.json"), JSON.stringify(result.pages, null, 2));
  await fs.writeFile(
    path.join(generatedDir, "search-index.json"),
    JSON.stringify(
      result.pages
        .filter((p) => p.status === "published")
        .map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt ?? "", tags: p.tags })),
      null,
      2
    )
  );
};
