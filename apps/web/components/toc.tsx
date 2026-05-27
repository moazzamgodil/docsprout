"use client";

import { useEffect, useState } from "react";

type Heading = { text: string; id: string };

export const Toc = ({ headings }: { headings: Heading[] }) => {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.3, 0.6] }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  return (
    <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">On This Page</h2>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              className={active === heading.id
                ? "font-medium text-slate-950 dark:text-white"
                : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"}
              href={`#${heading.id}`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
