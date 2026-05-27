import fs from "node:fs/promises";
import path from "node:path";
import type { DocsproutPlugin } from "@docsprout/shared";

export class PluginManager {
  constructor(private readonly plugins: DocsproutPlugin[] = []) {}

  async runBefore(ctx: Parameters<NonNullable<DocsproutPlugin["beforeScan"]>>[0]) {
    for (const plugin of this.plugins) {
      if (plugin.beforeScan) await plugin.beforeScan(ctx);
    }
  }

  async runAfter(ctx: Parameters<NonNullable<DocsproutPlugin["afterScan"]>>[0]) {
    for (const plugin of this.plugins) {
      if (plugin.afterScan) await plugin.afterScan(ctx);
    }
  }
}

export const detectWorkspaceRoots = async (cwd: string): Promise<string[]> => {
  const packageJsonPath = path.join(cwd, "package.json");
  try {
    const raw = await fs.readFile(packageJsonPath, "utf-8");
    const pkg = JSON.parse(raw) as { workspaces?: string[] | { packages?: string[] } };

    if (Array.isArray(pkg.workspaces)) return pkg.workspaces;
    if (pkg.workspaces && Array.isArray(pkg.workspaces.packages)) return pkg.workspaces.packages;
  } catch {
    return ["."];
  }

  return ["."];
};

