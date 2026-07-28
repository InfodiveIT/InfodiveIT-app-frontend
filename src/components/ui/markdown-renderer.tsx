import React from "react";

export interface MarkdownRendererProps {
  content?: string;
  className?: string;
}

/** Processa formatação inline: **negrito**, *itálico*, `código`, [link](url) */
export function parseInlineContent(text: string): React.ReactNode[] {
  if (!text) return [];

  // Regex para capturar **negrito**, *itálico*, `código` e [link](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Negrito **texto**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-ink-950">
          {parseInlineContent(part.slice(2, -2))}
        </strong>
      );
    }

    // Itálico *texto*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <em key={index}>{parseInlineContent(part.slice(1, -1))}</em>;
    }

    // Código `texto`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code key={index} className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-brand">
          {part.slice(1, -1)}
        </code>
      );
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

/** Processa tabelas em markdown */
function parseTableBlock(trimmedBlock: string) {
  const lines = trimmedBlock.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 1) return null;

  // Filtra linhas separadoras tipo |---|---|
  const tableLines = lines.filter((line) => !/^\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?$/.test(line));
  if (tableLines.length === 0) return null;

  const rows = tableLines.map((line) => {
    const rawCells = line.replace(/^\|/, "").replace(/\|$/, "").split("|");
    return rawCells.map((c) => c.trim());
  });

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return { headers, dataRows };
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content || !content.trim()) return null;

  // Divide o texto por blocos separados por linhas em branco
  const rawBlocks = content.split(/\n\s*\n/);

  return (
    <div className={`max-w-none text-[16px] md:text-[17px] leading-relaxed text-ink-900 ${className}`}>
      {rawBlocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Título H1 (# Título)
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={blockIdx} className="mt-10 mb-4 text-3xl font-extrabold tracking-tight text-ink-950">
              {parseInlineContent(trimmed.replace(/^#\s+/, ""))}
            </h1>
          );
        }

        // 2. Título H2 (## Título)
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={blockIdx} className="mt-12 mb-5 text-2xl font-bold tracking-tight text-ink-950 border-b border-ink-200/60 pb-2">
              {parseInlineContent(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // 3. Título H3 (### Título)
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={blockIdx} className="mt-8 mb-3 text-xl font-semibold tracking-tight text-ink-950">
              {parseInlineContent(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        // 4. Título H4 (#### Título)
        if (trimmed.startsWith("#### ")) {
          return (
            <h4 key={blockIdx} className="mt-6 mb-2 text-lg font-semibold text-ink-950">
              {parseInlineContent(trimmed.replace(/^####\s+/, ""))}
            </h4>
          );
        }

        // 5. Linha Divisora (--- ou *** ou ___)
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <hr key={blockIdx} className="my-10 border-t border-ink-200/80" />;
        }

        // 6. Citação (> Frase)
        if (trimmed.startsWith(">")) {
          const quoteText = trimmed.replace(/^>\s*/gm, "").trim();
          return (
            <blockquote key={blockIdx} className="my-8 border-l-4 border-brand bg-brand/5 p-5 rounded-r-xl text-ink-950 italic font-medium leading-relaxed shadow-sm">
              {parseInlineContent(quoteText)}
            </blockquote>
          );
        }

        // 7. Tabela Markdown (| Coluna 1 | Coluna 2 |)
        if (trimmed.includes("|") && trimmed.split("\n").some((l) => l.includes("|"))) {
          const tableData = parseTableBlock(trimmed);
          if (tableData) {
            return (
              <div key={blockIdx} className="my-8 overflow-x-auto rounded-xl border border-ink-200/80 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-ink-200/80 text-left text-sm">
                  <thead className="bg-ink-100/70 font-semibold text-ink-950">
                    <tr>
                      {tableData.headers.map((h, i) => (
                        <th key={i} className="px-4 py-3.5 font-bold border-r border-ink-200/60 last:border-r-0 text-ink-950">
                          {parseInlineContent(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-200/60 bg-white">
                    {tableData.dataRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-ink-50/60 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 text-ink-900 border-r border-ink-200/60 last:border-r-0 leading-relaxed">
                            {parseInlineContent(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 8. Lista não-ordenada (- item ou * item)
        const lines = trimmed.split("\n");
        const isUnordered = lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));
        if (isUnordered) {
          return (
            <ul key={blockIdx} className="my-6 space-y-3">
              {lines.map((line, lineIdx) => {
                const itemText = line.trim().replace(/^[-*]\s+/, "");
                return (
                  <li key={lineIdx} className="flex items-start gap-3 text-ink-900">
                    <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
                    <span className="leading-relaxed">{parseInlineContent(itemText)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 9. Lista ordenada (1. item)
        const isOrdered = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
        if (isOrdered) {
          return (
            <ol key={blockIdx} className="my-6 space-y-3 list-decimal list-inside text-ink-900 font-medium">
              {lines.map((line, lineIdx) => {
                const itemText = line.trim().replace(/^\d+\.\s+/, "");
                return (
                  <li key={lineIdx} className="leading-relaxed pl-1 font-normal">
                    {parseInlineContent(itemText)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // 10. Parágrafo padrão (com suporte a quebras de linha manuais)
        return (
          <p key={blockIdx} className="mt-6 text-pretty leading-relaxed text-ink-900">
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {parseInlineContent(line)}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
