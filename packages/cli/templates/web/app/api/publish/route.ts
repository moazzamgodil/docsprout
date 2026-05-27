import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

type GeneratedPage = {
  title: string;
  slug: string;
  content: string;
  status?: "draft" | "published";
  metadata?: Record<string, unknown>;
};

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

const syncGeneratedPages = async () => {
  const root = await resolveDocsRoot();
  const generatedPath = path.join(root, "docsprout", "generated", "pages.json");

  try {
    const raw = await fs.readFile(generatedPath, "utf-8");
    const pages = JSON.parse(raw) as GeneratedPage[];

    for (const page of pages) {
      const exists = await prisma.page.findUnique({ where: { slug: page.slug }, select: { id: true } });
      if (exists) continue;

      await prisma.page.create({
        data: {
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status ?? "published",
          metadata: JSON.stringify(page.metadata ?? {})
        }
      });
    }
  } catch {
    // Ignore when generated pages are not available yet.
  }
};

export async function GET() {
  await syncGeneratedPages();
  const pages = await prisma.page.findMany({ orderBy: [{ status: "asc" }, { updatedAt: "desc" }] });
  return NextResponse.json({ pages });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const page = await prisma.page.upsert({
    where: { slug: payload.slug },
    create: {
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      status: payload.status,
      metadata: payload.metadata ?? "{}"
    },
    update: {
      title: payload.title,
      content: payload.content,
      status: payload.status,
      metadata: payload.metadata ?? "{}"
    }
  });

  return NextResponse.json({ page });
}
