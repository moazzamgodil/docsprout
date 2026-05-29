import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

const rootPackagePath = path.join(repoRoot, "package.json");
const cliPackagePath = path.join(repoRoot, "packages", "cli", "package.json");

const rootPkg = JSON.parse(await fs.readFile(rootPackagePath, "utf-8"));
const cliPkg = JSON.parse(await fs.readFile(cliPackagePath, "utf-8"));

if (!rootPkg.version || typeof rootPkg.version !== "string") {
  throw new Error("Root package.json is missing a valid version field");
}

if (cliPkg.version !== rootPkg.version) {
  cliPkg.version = rootPkg.version;
  await fs.writeFile(cliPackagePath, `${JSON.stringify(cliPkg, null, 2)}\n`, "utf-8");
  console.log(`[docsprout] Synced packages/cli/package.json version to ${rootPkg.version}`);
} else {
  console.log(`[docsprout] packages/cli/package.json version already ${rootPkg.version}`);
}
