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

function conteudoToArtigo(
  dto: ConteudoDTO,
  categorias: { id: string; nome: string }[] = [],
  fabricantes: { id: string; nome: string }[] = [],
  produtos: { id: string; nome: string; solucaoId?: string; fabricanteId?: string; categoriaId?: string }[] = []
): Artigo {
  const produtoObj = dto.produtoId ? produtos.find((p) => p.id === dto.produtoId) : null;
  let categoriaObj = dto.categoriaId ? categorias.find((c) => c.id === dto.categoriaId) : null;
  let fabricanteObj = dto.fabricanteId ? fabricantes.find((f) => f.id === dto.fabricanteId) : null;

  if (!categoriaObj && produtoObj) {
    const catId = produtoObj.solucaoId || produtoObj.categoriaId;
    if (catId) {
      categoriaObj = categorias.find((c) => c.id === catId) || null;
    }
  }

  if (!fabricanteObj && produtoObj) {
    if (produtoObj.fabricanteId) {
      fabricanteObj = fabricantes.find((f) => f.id === produtoObj.fabricanteId) || null;
    }
  }

  return {
    slug: dto.slug,
    tipo: (TIPO_MAP[dto.tipo] || dto.tipo.toLowerCase()) as TipoConteudo,
    categoria: categoriaObj ? categoriaObj.nome : "",
    fabricante: fabricanteObj ? fabricanteObj.nome : "",
    titulo: dto.titulo,
    descricao: dto.descricao || "",
    data: dto.publicadoEm
      ? new Date(dto.publicadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      : "",
    imagemBg: dto.imagemUrl || "#0D1221",
    imagemUrl: dto.imagemUrl,
    urlExterna: dto.urlExterna,
    autor: dto.autor || "Equipe Infodive",
    tempoLeitura: dto.tempoLeitura || "",
    conteudo: [],
    produto: produtoObj ? {
      id: produtoObj.id,
      nome: produtoObj.nome,
      slug: (produtoObj as any).slug || "",
      descricaoCurta: (produtoObj as any).descricaoCurta,
      imagemUrl: (produtoObj as any).imagemUrl,
      fabricanteNome: fabricanteObj?.nome,
      categoriaNome: categoriaObj?.nome,
    } : undefined,
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

    Promise.all([
      api.conteudos({ size: 50 }),
      api.solucoes().catch(() => []),
      api.fabricantes().catch(() => []),
      api.produtos({ size: 100 }).catch(() => null),
      api.configBlog().catch(() => null),
    ])
      .then(([page, solucoesList, fabricantesList, produtosPage, configData]) => {
        const prods = produtosPage?.content || [];
        const mapped = page.content
          .filter((dto) => TIPO_MAP[dto.tipo])
          .map((dto) => conteudoToArtigo(dto, solucoesList, fabricantesList, prods));

        let currentEyebrow = eyebrow;
        let currentHeadline = headline;

        if (configData) {
          if (configData.artigosEyebrow) {
            currentEyebrow = configData.artigosEyebrow;
            setEyebrow(currentEyebrow);
          }
          if (configData.artigosHeadline) {
            currentHeadline = configData.artigosHeadline;
            setHeadline(currentHeadline);
          }
        }

        if (mapped.length > 0) {
          setArtigos(mapped);
          try {
            localStorage.setItem("infodive_blog_artigos_cache_v1", JSON.stringify({
              artigos: mapped,
              eyebrow: currentEyebrow,
              headline: currentHeadline,
            }));
          } catch {}
        }
      })
      .catch(() => {});
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
