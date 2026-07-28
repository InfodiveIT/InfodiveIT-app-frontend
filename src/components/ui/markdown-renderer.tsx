import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface MarkdownRendererProps {
  content?: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || !content.trim()) return null;

  return (
    <div className={`max-w-none text-[16px] md:text-[17px] leading-relaxed text-ink-900 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-10 mb-4 text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-12 mb-5 text-2xl font-bold tracking-tight text-ink-950 border-b border-ink-200/60 pb-2 sm:text-3xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight text-ink-950 sm:text-2xl">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-6 mb-2 text-lg font-semibold text-ink-950">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mt-6 text-pretty leading-relaxed text-ink-900">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-6 space-y-3 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-6 space-y-3 list-decimal list-inside text-ink-900 font-medium pl-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-ink-900 leading-relaxed">
              <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
              <div className="flex-1">{children}</div>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-8 border-l-4 border-brand bg-brand/5 p-5 rounded-r-xl text-ink-950 italic font-medium leading-relaxed shadow-sm">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-10 border-t border-ink-200/80" />
          ),
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-ink-200/80 shadow-sm bg-white">
              <table className="min-w-full divide-y divide-ink-200/80 text-left text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-ink-100/70 font-semibold text-ink-950">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-ink-200/60 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-ink-50/60 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3.5 font-bold border-r border-ink-200/60 last:border-r-0 text-ink-950">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-ink-900 border-r border-ink-200/60 last:border-r-0 leading-relaxed">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-ink-950">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          code: ({ children }) => (
            <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-brand">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="font-medium text-brand hover:underline underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
