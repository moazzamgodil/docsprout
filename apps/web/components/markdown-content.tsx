"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeHighlight from "rehype-highlight";
import mermaid from "mermaid";

const MermaidBlock = ({ code }: { code: string }) => {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;

    mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" });
    mermaid
      .render(id, code)
      .then((result) => {
        if (mounted) setSvg(result.svg);
      })
      .catch((error) => {
        if (mounted) setSvg(`<pre>Diagram error: ${String(error?.message ?? "invalid syntax")}</pre>`);
      });

    return () => {
      mounted = false;
    };
  }, [code]);

  return <div className="mermaid-wrap" dangerouslySetInnerHTML={{ __html: svg }} />;
};

const normalizeDiagramCode = (lang: string, raw: string) => {
  const code = raw.trim();
  const first = code.split("\n")[0]?.trim().toLowerCase() ?? "";
  const token = lang.toLowerCase();

  if (token === "mermaid") return code;
  if (token === "flowchart" || token === "graph") {
    return first.startsWith("flowchart") || first.startsWith("graph") ? code : `flowchart TD\n${code}`;
  }
  if (token === "sequence") {
    return first.startsWith("sequencediagram") ? code : `sequenceDiagram\n${code}`;
  }
  if (token === "gantt") {
    return first.startsWith("gantt") ? code : `gantt\n${code}`;
  }
  if (token === "state") {
    return first.startsWith("statediagram") ? code : `stateDiagram-v2\n${code}`;
  }
  if (token === "er") {
    return first.startsWith("erdiagram") ? code : `erDiagram\n${code}`;
  }

  if (
    first.startsWith("graph") ||
    first.startsWith("flowchart") ||
    first.startsWith("sequencediagram") ||
    first.startsWith("gantt") ||
    first.startsWith("statediagram") ||
    first.startsWith("erdiagram")
  ) {
    return code;
  }

  return null;
};

export const MarkdownContent = ({ content }: { content: string }) => {
  const normalized = useMemo(() => content.replace(/\r\n/g, "\n"), [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeHighlight]}
      components={{
        table: ({ ...props }) => (
          <div className="table-wrap">
            <table {...props} />
          </div>
        ),
        code({ className, children }) {
          const raw = String(children).replace(/\n$/, "");
          const lang = className?.replace("language-", "") ?? "";
          const isCodeBlock = Boolean(className);
          const diagram = isCodeBlock ? normalizeDiagramCode(lang, raw) : null;

          if (diagram) {
            return <MermaidBlock code={diagram} />;
          }

          return <code className={className}>{children}</code>;
        }
      }}
    >
      {normalized}
    </ReactMarkdown>
  );
};
