"use client";

import { useEffect, useMemo, useState } from "react";
import { RichEditor } from "../../components/rich-editor";

type PageRecord = {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: "draft" | "published";
};

type DocsConfig = {
  projectName: string;
  basePath: string;
  adminPath: string;
  theme: string;
  includeDraftsInDev: boolean;
};

const themes = ["default", "modern", "minimal", "classic", "ocean", "forest", "midnight"];

const blankPage: PageRecord = {
  id: 0,
  title: "New Page",
  slug: "new-page",
  content: "# New Page\n\nStart writing...",
  status: "draft"
};

const configDefaults: DocsConfig = {
  projectName: "My Docsprout Site",
  basePath: "/docs",
  adminPath: "/docs-admin",
  theme: "default",
  includeDraftsInDev: true
};

export default function AdminPage() {
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [active, setActive] = useState<PageRecord | null>(null);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<DocsConfig>(configDefaults);
  const [configSaving, setConfigSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [pagesRes, configRes] = await Promise.all([fetch("/api/publish"), fetch("/api/config")]);
    const pagesData = await pagesRes.json();
    const configData = await configRes.json();

    setPages(pagesData.pages ?? []);
    setConfig({ ...configDefaults, ...(configData.config ?? {}) });

    if (!active && pagesData.pages?.length > 0) {
      setActive(pagesData.pages[0]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((page) => `${page.title} ${page.slug}`.toLowerCase().includes(q));
  }, [pages, query]);

  const savePage = async () => {
    if (!active) return;
    setSaving(true);
    await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(active)
    });
    setSaving(false);
    await load();
  };

  const saveConfig = async () => {
    setConfigSaving(true);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config)
    });
    setConfigSaving(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      <section className="grid h-[calc(100vh-146px)] w-full grid-cols-1 gap-6 px-6 pb-4 pt-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mb-3 flex items-center justify-between gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button
              onClick={() => setActive(blankPage)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              New
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map((page) => {
                  const selected = active?.slug === page.slug;
                  return (
                    <li key={page.id}>
                      <button
                        onClick={() => setActive(page)}
                        className={`w-full rounded-xl border px-3 py-2 text-left transition ${selected ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900" : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800"}`}
                      >
                        <div className="text-sm font-semibold">{page.title}</div>
                        <div className={`text-xs ${selected ? "text-slate-200 dark:text-slate-600" : "text-slate-500"}`}>{page.slug} | {page.status}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">docsprout cms</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Page Editor</h1>
            </div>
            <button
              onClick={savePage}
              disabled={!active || saving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {saving ? "Saving..." : "Save Page"}
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-80 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ) : !active ? (
            <p className="text-sm text-slate-500">Select a page to edit.</p>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600 dark:text-slate-300">Title</span>
                  <input value={active.title} onChange={(e) => setActive({ ...active, title: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-slate-600 dark:text-slate-300">Slug</span>
                  <input value={active.slug} onChange={(e) => setActive({ ...active, slug: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600 dark:text-slate-300">Status</span>
                <select value={active.status} onChange={(e) => setActive({ ...active, status: e.target.value as "draft" | "published" })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              <div className="min-h-0 flex-1">
                <p className="mb-1 text-sm text-slate-600 dark:text-slate-300">Content</p>
                <RichEditor value={active.content} onChange={(content) => setActive({ ...active, content })} />
              </div>
            </div>
          )}
        </section>

        <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Project Config</h2>
            <button
              onClick={saveConfig}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {configSaving ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
            <label className="block">
              <span className="mb-1 block text-slate-600 dark:text-slate-300">Project Name</span>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={config.projectName} onChange={(e) => setConfig({ ...config, projectName: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-slate-600 dark:text-slate-300">Docs Base Path</span>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={config.basePath} onChange={(e) => setConfig({ ...config, basePath: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-slate-600 dark:text-slate-300">Admin Path</span>
              <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={config.adminPath} onChange={(e) => setConfig({ ...config, adminPath: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1 block text-slate-600 dark:text-slate-300">Theme</span>
              <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900" value={config.theme} onChange={(e) => setConfig({ ...config, theme: e.target.value })}>
                {themes.map((theme) => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={config.includeDraftsInDev} onChange={(e) => setConfig({ ...config, includeDraftsInDev: e.target.checked })} />
              <span className="text-slate-600 dark:text-slate-300">Include drafts in dev</span>
            </label>
          </div>
        </aside>
      </section>
    </main>
  );
}
