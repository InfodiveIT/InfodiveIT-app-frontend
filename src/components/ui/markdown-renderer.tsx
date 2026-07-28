import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/** Processa sintaxe markdown inline: **negrito**, *itálico*, [link](url) */
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex para capturar **negrito**, *itálico* e [link](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Negrito **texto**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={index} className="font-bold text-ink-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Itálico *texto*
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    // Link [texto](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target={linkMatch[2].startsWith("http") ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="font-medium text-brand hover:underline underline-offset-2 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  // Separa o texto em blocos por linhas em branco
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className={`max-w-none text-[16px] md:text-[17px] leading-relaxed text-ink-900 ${className}`}>
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Título H1
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={blockIdx} className="mt-10 mb-4 text-3xl font-extrabold tracking-tight text-ink-950">
              {parseInline(trimmed.replace(/^#\s+/, ""))}
            </h1>
          );
        }

        // Título H2
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={blockIdx} className="mt-10 mb-4 text-2xl font-bold tracking-tight text-ink-950 border-b border-ink-200/60 pb-2">
              {parseInline(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // Título H3
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={blockIdx} className="mt-8 mb-3 text-xl font-semibold tracking-tight text-ink-950">
              {parseInline(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        // Título H4
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={blockIdx} className="mt-6 mb-2 text-lg font-semibold text-ink-950">
              {parseInline(trimmed.replace(/^####\s+/, ""))}
            </h4>
          );
        }

        // Citação (Blockquote)
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote key={blockIdx} className="my-6 border-l-4 border-brand bg-brand/5 p-4 rounded-r-lg text-ink-950 italic">
              {parseInline(trimmed.replace(/^>\s+/, ""))}
            </blockquote>
          );
        }

        // Divisor (Horizontal Rule)
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={blockIdx} className="my-8 border-t border-ink-200/70" />;
        }

        // Lista não-ordenada (- item ou * item)
        const lines = trimmed.split("\n");
        const isUnorderedList = lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
        if (isUnorderedList) {
          return (
            <ul key={blockIdx} className="my-5 space-y-2.5">
              {lines.map((line, lineIdx) => {
                const itemText = line.trim().replace(/^[-*]\s+/, "");
                return (
                  <li key={lineIdx} className="flex items-start gap-3 text-ink-900">
                    <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
                    <span className="leading-relaxed">{parseInline(itemText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Lista ordenada (1. item)
        const isOrderedList = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
        if (isOrderedList) {
          return (
            <ol key={blockIdx} className="my-5 space-y-2.5 list-decimal list-inside text-ink-900">
              {lines.map((line, lineIdx) => {
                const itemText = line.trim().replace(/^\d+\.\s+/, "");
                return (
                  <li key={lineIdx} className="leading-relaxed pl-1">
                    {parseInline(itemText)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Parágrafo padrão
        return (
          <p key={blockIdx} className="mt-5 text-pretty leading-relaxed text-ink-900">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {parseInline(line)}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
