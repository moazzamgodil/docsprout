import fs from "node:fs/promises";
import path from "node:path";
import { ensureDocsproutStructure, loadConfig, scanMarkdown, writeScanOutput } from "./scanner";
import { detectWorkspaceRoots } from "./plugins";

export const initProject = async (cwd: string) => {
  await ensureDocsproutStructure(cwd);

  const samplePath = path.join(cwd, "docsprout", "content", "getting-started.md");
  try {
    await fs.access(samplePath);
  } catch {
    await fs.writeFile(
      samplePath,
      `---\ntitle: Getting Started\nstatus: published\norder: 1\n---\n\n# Welcome to docsprout\n\nThis page was generated automatically.`
    );
  }

  const workspaceRoots = await detectWorkspaceRoots(cwd);
  const cfg = await loadConfig(cwd);
  cfg.contentRoots = Array.from(new Set([".", ...workspaceRoots]));
  await fs.writeFile(path.join(cwd, "docsprout", "config.json"), JSON.stringify(cfg, null, 2));

  const scan = await scanMarkdown(cwd, cfg);
  await writeScanOutput(cwd, cfg, scan);

  return { cfg, scan };
};

export const runScan = async (cwd: string) => {
  const cfg = await loadConfig(cwd);
  const scan = await scanMarkdown(cwd, cfg);
  await writeScanOutput(cwd, cfg, scan);
  return { cfg, scan };
};

