import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const file = path.join(process.cwd(), "docsprout", "generated", "search-index.json");
  const raw = await fs.readFile(file, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}


