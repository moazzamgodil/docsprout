import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

const source = path.join(repoRoot, "README.md");
const target = path.join(repoRoot, "packages", "cli", "README.md");

const readme = await fs.readFile(source, "utf-8");
await fs.writeFile(target, readme, "utf-8");

console.log("[docsprout] Synced packages/cli/README.md from root README.md");
