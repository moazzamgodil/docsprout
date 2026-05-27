"use client";

import { useMemo, useState } from "react";

type SearchEntry = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export const SearchBox = ({ entries }: { entries: SearchEntry[] }) => {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    if (!query.trim()) return [];
    return entries.filter((entry) =>
      `${entry.title} ${entry.excerpt} ${entry.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [entries, query]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        placeholder="Search docs..."
      />
      {results.length > 0 && (
        <div className="absolute z-10 mt-2 max-h-64 w-full overflow-auto rounded border bg-white p-2 shadow dark:border-slate-700 dark:bg-slate-900">
          {results.map((result) => (
            <a key={result.slug} href={`/docs/${result.slug}`} className="block rounded p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
              <p className="text-sm font-semibold">{result.title}</p>
              <p className="text-xs text-slate-500">{result.excerpt}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};


