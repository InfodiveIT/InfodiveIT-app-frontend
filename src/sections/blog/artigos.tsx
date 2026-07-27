"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/animations/reveal";
import { api, type ConteudoDTO } from "@/lib/api";
import { FILTROS, type Artigo, type TipoConteudo } from "@/lib/blog-data";
import { cn } from "@/lib/utils";
import { ArtigoCard } from "./article-card";

const TIPO_MAP: Record<string, TipoConteudo> = {
  ARTIGO: "artigo",
  WHITEPAPER: "whitepaper",
  CASE: "case",
  DATASHEET: "datasheet",
  VIDEO: "video",
};

function conteudoToArtigo(dto: ConteudoDTO): Artigo {
  return {
    slug: dto.slug,
    tipo: (TIPO_MAP[dto.tipo] || dto.tipo.toLowerCase()) as TipoConteudo,
    categoria: dto.categoriaId || "",
    fabricante: dto.fabricanteId || "",
    titulo: dto.titulo,
    descricao: dto.descricao || "",
    data: dto.publicadoEm
      ? new Date(dto.publicadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      : "",
    imagemBg: dto.imagemUrl || "#0D1221",
    autor: dto.autor || "Equipe Infodive",
    tempoLeitura: dto.tempoLeitura || "",
    conteudo: [],
  };
}

export function BlogArtigos() {
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<TipoConteudo | "todos">("todos");
  const [eyebrow, setEyebrow] = useState("Artigos & Materiais");
  const [headline, setHeadline] = useState("Conteúdo técnico produzido pela equipe Infodive.");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("infodive_blog_artigos_cache_v1");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.artigos && parsed.artigos.length > 0) setArtigos(parsed.artigos);
        if (parsed.eyebrow) setEyebrow(parsed.eyebrow);
        if (parsed.headline) setHeadline(parsed.headline);
      }
    } catch {}

    api.conteudos({ size: 50 })
      .then((page) => {
        const mapped = page.content
          .filter((dto) => TIPO_MAP[dto.tipo])
          .map(conteudoToArtigo);
        if (mapped.length > 0) {
          setArtigos(mapped);
          try {
            localStorage.setItem("infodive_blog_artigos_cache_v1", JSON.stringify({
              artigos: mapped,
              eyebrow,
              headline,
            }));
          } catch {}
        }
      })
      .catch(() => {});

    api.configBlog()
      .then((data) => {
        if (data.artigosEyebrow) setEyebrow(data.artigosEyebrow);
        if (data.artigosHeadline) setHeadline(data.artigosHeadline);
      })
      .catch(() => { /* mantém fallback */ });
  }, []);

  const artigosFiltrados =
    filtroAtivo === "todos"
      ? artigos
      : artigos.filter((artigo) => artigo.tipo === filtroAtivo);

  return (
    <section className="relative bg-white py-20 md:py-28">
      <div className="container-default">
        <div className="max-w-2xl">
          <Reveal>
            <p className="eyebrow">{eyebrow}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-balance">{headline}</h2>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {FILTROS.map((filtro) => {
              const ativo = filtroAtivo === filtro.value;
              return (
                <button
                  key={filtro.value}
                  type="button"
                  onClick={() => setFiltroAtivo(filtro.value)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                    ativo
                      ? "border-brand bg-brand text-white"
                      : "border-ink-200 bg-transparent text-ink-500 hover:border-brand",
                  )}
                >
                  {filtro.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artigosFiltrados.map((artigo, index) => (
            <Reveal key={artigo.slug} delay={(index % 3) * 0.08} className="h-full">
              <ArtigoCard artigo={artigo} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button type="button" className="btn-secondary !text-ink-950">
            Carregar mais conteúdos
          </button>
        </div>
      </div>
    </section>
  );
}
