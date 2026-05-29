#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import chokidar from "chokidar";
import path from "node:path";
import fs from "node:fs/promises";
import { execa } from "execa";
import { initProject, loadConfig, runScan } from "@docsprout/core";

const program = new Command();
const cwd = process.cwd();
const webDirPrimary = path.join(cwd, "docsprout", "web");
const webDirLegacy = path.join(cwd, "apps", "web");

type Colorizer = {
  red: (text: string) => string;
  cyan: (text: string) => string;
  bold: (text: string) => string;
};

const color = (() => {
  const maybe = chalk as unknown as { default?: Colorizer } & Partial<Colorizer>;
  return (maybe.default ?? maybe) as Colorizer;
})();

type PromptApi = {
  prompt: <T = unknown>(questions: unknown) => Promise<T>;
};

const promptApi = (() => {
  const maybe = inquirer as unknown as { default?: PromptApi } & Partial<PromptApi>;
  return (maybe.default ?? maybe) as PromptApi;
})();

const log = (message: string) => console.log(color.cyan(`[docsprout] ${message}`));

const copyDir = async (src: string, dest: string) => {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const source = path.join(src, entry.name);
    const target = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(source, target);
    } else {
      await fs.copyFile(source, target);
    }
  }
};

const getCliDir = () => {
  // CLI entry path is always available for node-invoked commands.
  return path.dirname(path.resolve(process.argv[1]));
};

const templateWebPath = () => {
  const here = getCliDir();
  return path.resolve(here, "../templates/web");
};

const resolveWebDir = async (): Promise<string | null> => {
  try {
    await fs.access(path.join(webDirPrimary, "package.json"));
    return webDirPrimary;
  } catch {
    // continue
  }

  try {
    await fs.access(path.join(webDirLegacy, "package.json"));
    log("Using legacy web app location at apps/web. Re-run `docsprout init` to migrate to docsprout/web.");
    return webDirLegacy;
  } catch {
    return null;
  }
};

const ensureWebApp = async () => {
  const dir = await resolveWebDir();
  if (!dir) {
    console.error(color.red("Web app not found. Run `docsprout init` first."));
    return null;
  }
  return dir;
};

const ensureWebDependencies = async (webDir: string) => {
  const packageJson = path.join(webDir, "package.json");
  const nodeModules = path.join(webDir, "node_modules");
  const mermaidModule = path.join(webDir, "node_modules", "mermaid", "package.json");
  const lockFile = path.join(webDir, "package-lock.json");

  try {
    await fs.access(packageJson);
    await fs.access(nodeModules);
    await fs.access(lockFile);
    await fs.access(mermaidModule);
  } catch {
    log("Installing web app dependencies...");
    await execa("npm", ["install"], { cwd: webDir, stdio: "inherit" });
  }
};

const ensurePrismaDatabase = async (webDir: string) => {
  log("Ensuring Prisma database schema is ready...");
  await execa("npx", ["prisma", "db", "push", "--skip-generate"], { cwd: webDir, stdio: "inherit" });
};

const scaffoldWebApp = async () => {
  const webPackageFile = path.join(webDirPrimary, "package.json");
  try {
    await fs.access(webPackageFile);
    log("docsprout/web already exists. Keeping existing app scaffold.");
    return;
  } catch {
    // Continue scaffold
  }

  const src = templateWebPath();
  await copyDir(src, webDirPrimary);
  log(`Scaffolded web app at ${color.bold(webDirPrimary)}`);
};

const upgradeWebApp = async () => {
  const template = templateWebPath();
  const target = webDirPrimary;
  const legacyExists = await fs.access(path.join(webDirLegacy, "package.json")).then(() => true).catch(() => false);

  if (legacyExists) {
    log("Legacy apps/web detected. Migrating runtime to docsprout/web.");
  }

  const exists = await fs.access(path.join(target, "package.json")).then(() => true).catch(() => false);
  if (exists) {
    const answer = await promptApi.prompt<{ confirm: boolean }>([
      {
        type: "confirm",
        name: "confirm",
        message: "Replace docsprout/web with latest template? This overwrites local web customizations.",
        default: false
      }
    ]);

    if (!answer.confirm) {
      log("Upgrade canceled.");
      return;
    }

    await fs.rm(target, { recursive: true, force: true });
  }

  await copyDir(template, target);
  log(`Upgraded web scaffold at ${color.bold(target)}`);
  log("Run `docsprout dev` to install deps, sync database, and start.");
};

const resolveCliVersion = async () => {
  const pkgPath = path.resolve(getCliDir(), "../package.json");
  try {
    const raw = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(raw) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
};

program.name("docsprout").description("Plug-and-play documentation platform");

program
  .command("init")
  .description("Initialize docsprout in current project")
  .option("--project-name <name>", "Project name to use in generated config")
  .action(async () => {
    const cmd = program.commands.find((c) => c.name() === "init");
    const optionName = cmd?.opts<{ projectName?: string }>()?.projectName;
    const defaultProjectName = "My Docsprout Site";
    const projectName =
      optionName ||
      (!process.stdin.isTTY
        ? defaultProjectName
        : (
            await promptApi.prompt<{ projectName: string }>([
              {
                type: "input",
                name: "projectName",
                message: "Project name",
                default: defaultProjectName
              }
            ])
          ).projectName);

    const { cfg, scan } = await initProject(cwd);
    cfg.projectName = projectName;
    await fs.writeFile(path.join(cwd, "docsprout", "config.json"), JSON.stringify(cfg, null, 2));

    await scaffoldWebApp();

    log(`Initialized at ${color.bold(path.join(cwd, "docsprout"))}`);
    log(`Discovered ${scan.pages.length} markdown pages.`);
    log("Run `docsprout dev` to start docs + admin.");
  });

program
  .command("upgrade")
  .description("Upgrade docsprout web scaffold to latest template")
  .action(async () => {
    await upgradeWebApp();
  });

program
  .command("scan")
  .description("Scan markdown and regenerate sidebar/search index")
  .action(async () => {
    const { scan } = await runScan(cwd);
    log(`Scan complete: ${scan.pages.length} pages, generated sidebar + index.`);
  });

program
  .command("dev")
  .description("Start development mode with markdown watcher + Next.js")
  .action(async () => {
    const webDir = await ensureWebApp();
    if (!webDir) return;

    const cfg = await loadConfig(cwd);
    await runScan(cwd);
    await ensureWebDependencies(webDir);
    await ensurePrismaDatabase(webDir);

    const watchPatterns = cfg.contentRoots.map((root) => path.join(cwd, root, "**/*.{md,mdx}"));
    const watcher = chokidar.watch(watchPatterns, {
      ignored: cfg.ignore,
      ignoreInitial: true
    });

    watcher.on("all", async (event, filePath) => {
      log(`${event}: ${filePath}`);
      await runScan(cwd);
      log("Regenerated sidebar and page index.");
    });

    log("Starting Next.js dev server...");
    await execa("npm", ["run", "dev"], { cwd: webDir, stdio: "inherit" });
  });

program
  .command("build")
  .description("Build production documentation output")
  .action(async () => {
    const webDir = await ensureWebApp();
    if (!webDir) return;

    await runScan(cwd);
    await ensureWebDependencies(webDir);
    await ensurePrismaDatabase(webDir);
    log("Building web output...");
    await execa("npm", ["run", "build"], { cwd: webDir, stdio: "inherit" });
    log("Build completed.");
  });

program
  .command("publish")
  .description("Prepare production content (published-only) and build")
  .action(async () => {
    const webDir = await ensureWebApp();
    if (!webDir) return;

    const { cfg, scan } = await runScan(cwd);
    const published = scan.pages.filter((p) => p.status === "published");
    await fs.writeFile(
      path.join(cwd, cfg.outputDir, "generated", "published-pages.json"),
      JSON.stringify(published, null, 2)
    );

    await ensureWebDependencies(webDir);
    await ensurePrismaDatabase(webDir);
    log(`Published pages: ${published.length}/${scan.pages.length}`);
    await execa("npm", ["run", "build"], { cwd: webDir, stdio: "inherit" });
    log("Publish build ready.");
  });

resolveCliVersion()
  .then((version) => {
    program.version(version);
    return program.parseAsync(process.argv);
  })
  .catch((error) => {
    console.error(color.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  });
