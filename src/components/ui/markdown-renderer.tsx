import React from "react";

export type ArtigoBloco =
  | { tipo: "subtitulo"; texto: string }
  | { tipo: "citacao"; texto: string }
  | { tipo: "lista"; itens: string[] }
  | { tipo: "paragrafo"; texto: string };

/** Converte texto Markdown em estrutura de blocos exatamente igual à página do Blog */
export function parseMarkdownToBlocos(text?: string): ArtigoBloco[] {
  if (!text || !text.trim()) return [];

  if (text.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.tipo) {
        return parsed;
      }
    } catch (e) {}
  }

  const rawBlocks = text.split(/\n\n+/);
  const blocos: ArtigoBloco[] = [];

  for (const rawBlock of rawBlocks) {
    const trimmed = rawBlock.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("###") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
      blocos.push({
        tipo: "subtitulo",
        texto: trimmed.replace(/^#+\s*/, "").trim(),
      });
    } else if (trimmed.startsWith(">")) {
      blocos.push({
        tipo: "citacao",
        texto: trimmed.replace(/^>\s*/, "").trim(),
      });
    } else if (
      trimmed.split("\n").every((line) => line.trim().startsWith("- ") || line.trim().startsWith("* ") || /^\d+\.\s/.test(line.trim()))
    ) {
      const itens = trimmed
        .split("\n")
        .map((line) => line.replace(/^([-*]|\d+\.)\s*/, "").trim())
        .filter(Boolean);
      blocos.push({
        tipo: "lista",
        itens,
      });
    } else {
      blocos.push({
        tipo: "paragrafo",
        texto: trimmed,
      });
    }
  }

  return blocos;
}

/** Renderiza um único bloco igualzinho ao Bloco do Blog */
export function Bloco({ bloco }: { bloco: ArtigoBloco }) {
  switch (bloco.tipo) {
    case "subtitulo":
      return (
        <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
          {bloco.texto}
        </h2>
      );
    case "lista":
      return (
        <ul className="mt-6 space-y-3">
          {bloco.itens.map((item, idx) => (
            <li key={idx} className="flex gap-3 text-ink-900">
              <span
                className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand"
                aria-hidden
              />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    case "citacao":
      return (
        <blockquote className="my-10 border-l-2 border-brand pl-6 text-xl font-medium leading-relaxed text-ink-950">
          {bloco.texto}
        </blockquote>
      );
    default:
      return (
        <p className="mt-6 text-pretty leading-relaxed text-ink-900">
          {bloco.texto}
        </p>
      );
  }
}

export function MarkdownRenderer({ content, className = "" }: { content?: string; className?: string }) {
  const blocos = parseMarkdownToBlocos(content);
  if (!blocos.length) return null;

  return (
    <div className={`max-w-none text-[16px] md:text-[17px] leading-relaxed text-ink-900 ${className}`}>
      {blocos.map((bloco, index) => (
        <Bloco key={index} bloco={bloco} />
      ))}
    </div>
  );
}
