import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

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

const configPath = async () => {
  const root = await resolveDocsRoot();
  return path.join(root, "docsprout", "config.json");
};

export async function GET() {
  const file = await configPath();
  const raw = await fs.readFile(file, "utf-8");
  return NextResponse.json({ config: JSON.parse(raw) });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const file = await configPath();
  const raw = await fs.readFile(file, "utf-8");
  const existing = JSON.parse(raw) as Record<string, unknown>;
  const next = {
    ...existing,
    projectName: payload.projectName,
    basePath: payload.basePath,
    adminPath: payload.adminPath,
    theme: payload.theme,
    includeDraftsInDev: Boolean(payload.includeDraftsInDev)
  };

  await fs.writeFile(file, JSON.stringify(next, null, 2));
  return NextResponse.json({ config: next });
}
