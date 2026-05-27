import { notFound, redirect } from "next/navigation";
import { getPageBySlug, getPublishedPages, readSidebar } from "../../../../lib/content";
import { Sidebar } from "../../../../components/sidebar";
import { Toc } from "../../../../components/toc";
import { MarkdownContent } from "../../../../components/markdown-content";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

const extractHeadings = (content: string) => {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      const text = line.replace(/^#{2,3}\s+/, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      return { text, id };
    })
    .slice(0, 12);
};

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages.map((page) => ({ slug: page.slug.split("/") }));
}

export default async function DocPage({ params }: Props) {
  const route = await params;
  const slug = route.slug?.join("/") ?? "index";
  const page = await getPageBySlug(slug);

  if (!page) {
    if (slug === "index") {
      const allPages = await getPublishedPages();
      if (allPages.length > 0) {
        redirect(`/docs/${allPages[0].slug}`);
      }
    }
    notFound();
  }

  const allPages = await getPublishedPages();
  const index = allPages.findIndex((p) => p.slug === page.slug);
  const prev = index > 0 ? allPages[index - 1] : null;
  const next = index < allPages.length - 1 ? allPages[index + 1] : null;
  const sidebar = await readSidebar();
  const headings = extractHeadings(page.content);

  return (
    <main className="grid w-full grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
      <Sidebar items={sidebar} />

      <article className="min-w-0 rounded-2xl border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{page.slug}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{page.title}</h1>

        <div className="mt-8 markdown-content">
          <MarkdownContent content={page.content} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800 sm:grid-cols-2">
          <span>{prev ? <a className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white" href={`/docs/${prev.slug}`}>Previous: {prev.title}</a> : ""}</span>
          <span className="sm:text-right">{next ? <a className="text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white" href={`/docs/${next.slug}`}>Next: {next.title}</a> : ""}</span>
        </div>
      </article>

      <aside className="hidden lg:block">
        <Toc headings={headings} />
      </aside>
    </main>
  );
}

