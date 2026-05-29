"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarItem } from "@docsprout/shared";

export const Sidebar = ({ items }: { items: SidebarItem[] }) => {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Pages</h2>
        <ul className="space-y-1">
          {items.map((item) => {
            const href = `/docs/${item.slug}`;
            const active = pathname === href;
            return (
              <li key={item.slug}>
                <Link
                  href={href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${active
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};
