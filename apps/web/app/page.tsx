import { readConfig } from "../lib/content";

export default async function HomePage() {
  const cfg = await readConfig();
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-4 p-6">
      <h1 className="text-4xl font-bold">{cfg.projectName}</h1>
      <p className="text-slate-600 dark:text-slate-300">Documentation and admin are ready.</p>
      <div className="flex gap-3">
        <a href="/docs/index" className="rounded bg-green-600 px-4 py-2 text-white">Open Docs</a>
        <a href="/docs-admin" className="rounded border border-slate-400 px-4 py-2">Open Admin</a>
      </div>
    </main>
  );
}


