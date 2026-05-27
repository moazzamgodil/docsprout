"use client";

import { useMemo, useRef, useState } from "react";
import { MarkdownContent } from "./markdown-content";

type Mode = "write" | "preview";

const wrapSelection = (value: string, start: number, end: number, before: string, after: string) => {
  const selected = value.slice(start, end);
  return `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
};

const insertLine = (value: string, start: number, text: string) => {
  return `${value.slice(0, start)}${text}${value.slice(start)}`;
};

export const RichEditor = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const [mode, setMode] = useState<Mode>("write");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const apply = (handler: (value: string, start: number, end: number) => string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = handler(value, start, end);
    onChange(next);

    queueMicrotask(() => {
      el.focus();
      el.setSelectionRange(start, end);
    });
  };

  const actions = useMemo(() => ([
    { label: "H1", fn: () => apply((v, s) => insertLine(v, s, "# ")) },
    { label: "H2", fn: () => apply((v, s) => insertLine(v, s, "## ")) },
    { label: "H3", fn: () => apply((v, s) => insertLine(v, s, "### ")) },
    { label: "Bold", fn: () => apply((v, s, e) => wrapSelection(v, s, e, "**", "**")) },
    { label: "Italic", fn: () => apply((v, s, e) => wrapSelection(v, s, e, "*", "*")) },
    { label: "Strike", fn: () => apply((v, s, e) => wrapSelection(v, s, e, "~~", "~~")) },
    { label: "Quote", fn: () => apply((v, s) => insertLine(v, s, "> ")) },
    { label: "Code", fn: () => apply((v, s, e) => wrapSelection(v, s, e, "```\n", "\n```")) },
    { label: "Bullet", fn: () => apply((v, s) => insertLine(v, s, "- ")) },
    { label: "Number", fn: () => apply((v, s) => insertLine(v, s, "1. ")) },
    { label: "Task", fn: () => apply((v, s) => insertLine(v, s, "- [ ] ")) },
    { label: "Link", fn: () => apply((v, s, e) => wrapSelection(v, s, e, "[", "](https://)")) },
    { label: "Image", fn: () => apply((v, s) => insertLine(v, s, "![alt](https://)")) },
    { label: "Table", fn: () => apply((v, s) => insertLine(v, s, "| Col A | Col B |\n| --- | --- |\n| Value | Value |\n")) },
    { label: "Mermaid", fn: () => apply((v, s) => insertLine(v, s, "```mermaid\nflowchart LR\n  A[Start] --> B[Done]\n```\n")) }
  ]), [value]);

  return (
    <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2 dark:border-slate-800">
        <button
          className={`rounded px-2 py-1 text-xs ${mode === "write" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "border border-slate-300 dark:border-slate-700"}`}
          onClick={() => setMode("write")}
          type="button"
        >
          Write
        </button>
        <button
          className={`rounded px-2 py-1 text-xs ${mode === "preview" ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900" : "border border-slate-300 dark:border-slate-700"}`}
          onClick={() => setMode("preview")}
          type="button"
        >
          Preview
        </button>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
        {actions.map((action) => (
          <button key={action.label} type="button" onClick={action.fn} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            {action.label}
          </button>
        ))}
      </div>

      {mode === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[calc(100%-44px)] min-h-[360px] w-full resize-none rounded-b-xl bg-transparent p-4 font-mono text-sm outline-none"
          spellCheck={false}
        />
      ) : (
        <div className="h-[calc(100%-44px)] min-h-[360px] overflow-y-auto p-4 markdown-content">
          <MarkdownContent content={value} />
        </div>
      )}
    </div>
  );
};

