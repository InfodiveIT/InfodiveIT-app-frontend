import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Clock, ExternalLink, Package, Play, User } from "lucide-react";
import {
  type ArtigoBloco,
  type Artigo,
  type TipoConteudo,
  TIPO_CONFIG,
} from "@/lib/blog-data";
import { InteractiveGridPattern } from "@/components/animations/interactive-grid-pattern";
import { Reveal } from "@/components/animations/reveal";
import { ArtigoCard } from "@/sections/blog/article-card";
import { BlogCta } from "@/sections/blog/cta";
import { Footer } from "@/layout/footer";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface PageProps {
  params: { slug: string };
}

const TIPO_MAP: Record<string, TipoConteudo> = {
  ARTIGO: "artigo",
  WHITEPAPER: "whitepaper",
  CASE: "case",
  DATASHEET: "datasheet",
  VIDEO: "video",
};

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}`;
  }
  if (url.includes('youtube.com/embed/')) return url;
  return null;
}

function parseMarkdownToBlocos(text?: string): ArtigoBloco[] {
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

async function getArtigo(slug: string): Promise<{ artigo: Artigo; rawConteudo?: string; publicadoEmIso: string } | null> {
  try {
    const dto = await api.conteudo(slug);
    if (!dto || !dto.ativo) return null;

    const [categorias, fabricantes, produtosPage] = await Promise.all([
      api.solucoes().catch(() => []),
      api.fabricantes().catch(() => []),
      api.produtos({ size: 100 }).catch(() => null),
    ]);
    const produtos = produtosPage?.content || [];

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

    let blocos: ArtigoBloco[] = [];
    if (dto.conteudo) {
      blocos = parseMarkdownToBlocos(dto.conteudo);
    }

    const artigo: Artigo = {
      slug: dto.slug,
      tipo: TIPO_MAP[dto.tipo] ?? "artigo",
      categoria: categoriaObj ? categoriaObj.nome : "",
      fabricante: fabricanteObj ? fabricanteObj.nome : "",
      titulo: dto.titulo,
      descricao: dto.descricao ?? "",
      data: dto.publicadoEm
        ? new Date(dto.publicadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
        : "",
      imagemBg: "#0D1221",
      imagemUrl: dto.imagemUrl,
      urlExterna: dto.urlExterna,
      autor: dto.autor ?? "Equipe Infodive",
      tempoLeitura: dto.tempoLeitura ?? "",
      conteudo: blocos,
      produto: produtoObj ? {
        id: produtoObj.id,
        nome: produtoObj.nome,
        slug: produtoObj.slug,
        descricaoCurta: produtoObj.descricaoCurta,
        imagemUrl: produtoObj.imagemUrl,
        fabricanteNome: fabricanteObj?.nome,
        categoriaNome: categoriaObj?.nome,
      } : undefined,
    };

    return { artigo, rawConteudo: dto.conteudo, publicadoEmIso: dto.publicadoEm || new Date().toISOString() };
  } catch (e) {
    return null;
  }
}

async function getRelacionados(currentSlug: string, limit = 3): Promise<Artigo[]> {
  try {
    const page = await api.conteudos({ size: 10 });
    const filtrados = page.content.filter((c) => c.slug !== currentSlug);

    const [categorias, fabricantes, produtosPage] = await Promise.all([
      api.solucoes().catch(() => []),
      api.fabricantes().catch(() => []),
      api.produtos({ size: 100 }).catch(() => null),
    ]);
    const produtos = produtosPage?.content || [];

    return filtrados.slice(0, limit).map((dto) => {
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
        tipo: TIPO_MAP[dto.tipo] ?? "artigo",
        categoria: categoriaObj ? categoriaObj.nome : "",
        fabricante: fabricanteObj ? fabricanteObj.nome : "",
        titulo: dto.titulo,
        descricao: dto.descricao ?? "",
        data: dto.publicadoEm
          ? new Date(dto.publicadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
          : "",
        imagemBg: "#0D1221",
        imagemUrl: dto.imagemUrl,
        urlExterna: dto.urlExterna,
        autor: dto.autor ?? "Equipe Infodive",
        tempoLeitura: dto.tempoLeitura ?? "",
        conteudo: [],
        produto: produtoObj ? {
          id: produtoObj.id,
          nome: produtoObj.nome,
          slug: produtoObj.slug,
          descricaoCurta: produtoObj.descricaoCurta,
          imagemUrl: produtoObj.imagemUrl,
          fabricanteNome: fabricanteObj?.nome,
          categoriaNome: categoriaObj?.nome,
        } : undefined,
      };
    });
  } catch (e) {
    return [];
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const page = await api.conteudos({ size: 100 });
    if (page && page.content) {
      return page.content
        .map((c) => ({ slug: c.slug }));
    }
  } catch (e) {}
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getArtigo(params.slug);

  if (!result) {
    return { title: "Conteúdo não encontrado | Infodive" };
  }

  const { artigo } = result;
  const seoTitle = `${artigo.titulo} | Infodive IT`
  const seoDesc = artigo.descricao

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: `https://infodive.com.br/blog/${params.slug}`,
    },
    keywords: [
      artigo.categoria,
      artigo.fabricante,
      'Artigo técnico',
      'Infodive',
      artigo.titulo,
    ],
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: `https://infodive.com.br/blog/${params.slug}`,
      type: "article",
      siteName: "Infodive IT",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
    },
  };
}

/** Renderiza um bloco do corpo do conteúdo. */
function Bloco({ bloco }: { bloco: ArtigoBloco }) {
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
          {bloco.itens.map((item) => (
            <li key={item} className="flex gap-3 text-ink-900">
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

export default async function ArtigoDetailPage({ params }: PageProps) {
  const result = await getArtigo(params.slug);

  if (!result) {
    notFound();
  }

  const { artigo, publicadoEmIso } = result;
  const config = (artigo.tipo && TIPO_CONFIG[artigo.tipo]) ? TIPO_CONFIG[artigo.tipo] : TIPO_CONFIG.artigo;
  const Icon = config.icon || BookOpen;
  const relacionados = await getRelacionados(artigo.slug);

  const isoDate = (publicadoEmIso || new Date().toISOString()).split('T')[0];
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: artigo.titulo,
    description: artigo.descricao,
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Organization',
      name: 'Infodive IT',
      url: 'https://infodive.com.br',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Infodive IT',
      logo: {
        '@type': 'ImageObject',
        url: 'https://infodive.com.br/icon.png',
      },
    },
  };

  const embedUrl = getYouTubeEmbedUrl(artigo.urlExterna);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <main id="main-content" className="relative z-20 bg-white">
        {/* 1. Hero dark */}
        <header className="relative overflow-hidden border-b border-white/5 bg-[#050507] pb-12 pt-28 text-white sm:pt-36">
          <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
            <InteractiveGridPattern
              width={48}
              height={48}
              squares={[50, 16]}
              className="absolute inset-0 h-full w-full stroke-white/[0.04] [mask-image:radial-gradient(ellipse_at_top,white_25%,transparent_80%)] opacity-40"
              squaresClassName="hover:fill-brand/10 transition-all duration-150"
            />
            <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[520px] -translate-x-1/2 rounded-full bg-brand/10 blur-[140px]" />
          </div>

          <div className="container-default relative z-10">
            <div className="mx-auto max-w-3xl">
              {/* Breadcrumb + voltar */}
              <Reveal>
                <nav className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                  <Link href="/blog" className="transition-colors hover:text-brand">
                    Conteúdos
                  </Link>
                  <span>/</span>
                  <span className="text-white/70">{artigo.categoria || artigo.fabricante || "Infodive"}</span>
                </nav>
              </Reveal>

              <Reveal delay={0.06}>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 text-sm text-ink-300 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Voltar para conteúdos
                </Link>
              </Reveal>

              {/* Badge tipo */}
              <Reveal delay={0.1}>
                <span
                  className="mt-8 inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ backgroundColor: config.bg, color: config.color }}
                >
                  {config.label}
                </span>
              </Reveal>

              {/* Título */}
              <Reveal delay={0.14}>
                <h1 className="mt-5 text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">
                  {artigo.titulo}
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-ink-300 sm:text-lg">
                  {artigo.descricao}
                </p>
              </Reveal>

              {/* Meta */}
              <Reveal delay={0.26}>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
                  {Boolean(artigo.categoria || artigo.fabricante) && (
                    <span className="font-medium uppercase tracking-wide text-[#7aa9ff]">
                      {[artigo.categoria, artigo.fabricante].filter(Boolean).join(" • ")}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" aria-hidden />
                    {artigo.autor}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                    {artigo.data}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {artigo.tempoLeitura}
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
        </header>

        {/* 2. Cover visual — banda de transição do dark para o claro */}
        <div className="bg-[#050507] pb-16">
          <div className="container-default">
            <Reveal className="mx-auto max-w-4xl">
              {artigo.tipo === "video" && embedUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
                  <iframe
                    src={embedUrl}
                    title={artigo.titulo}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : artigo.imagemUrl ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-950">
                  <Image
                    src={artigo.imagemUrl}
                    alt={artigo.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="relative flex h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 sm:h-[300px]"
                  style={{ backgroundColor: artigo.imagemBg }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
                  <Icon
                    className="h-24 w-24 text-white/[0.08]"
                    strokeWidth={1}
                    aria-hidden
                  />
                  {artigo.tipo === "video" && (
                    <span className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
                      <Play className="ml-1 h-7 w-7 fill-white text-white" aria-hidden />
                    </span>
                  )}
                </div>
              )}
            </Reveal>
          </div>
        </div>

        {/* 3. Corpo do conteúdo */}
        <article className="bg-white py-16 md:py-20">
          <div className="container-default">
            <Reveal className="mx-auto max-w-3xl text-[17px]">
              <MarkdownRenderer content={result.rawConteudo || ""} />

              {/* Card de Produto Relacionado */}
              {artigo.produto && (
                <div className="mt-12 overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-[#050811] via-[#0D1221] to-[#0A101D] p-6 text-white shadow-xl sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-start gap-4">
                      {artigo.produto.imagemUrl ? (
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2 sm:h-24 sm:w-24">
                          <Image
                            src={artigo.produto.imagemUrl}
                            alt={artigo.produto.nome}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand sm:h-20 sm:w-20">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded bg-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                            Produto Relacionado
                          </span>
                          {artigo.produto.fabricanteNome && (
                            <span className="text-xs font-semibold text-white/60">
                              {artigo.produto.fabricanteNome}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white sm:text-2xl">
                          {artigo.produto.nome}
                        </h3>
                        {artigo.produto.descricaoCurta && (
                          <p className="line-clamp-2 text-sm text-ink-300">
                            {artigo.produto.descricaoCurta}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 pt-2 sm:pt-0">
                      <Link href={`/produtos/${artigo.produto.slug}`}>
                        <Button
                          variant="primary"
                          size="md"
                          className="w-full sm:w-auto font-semibold text-sm gap-2"
                        >
                          <span>Ver produto</span>
                          <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloco Saiba Mais se houver link externo para tipos não-vídeo */}
              {artigo.tipo !== "video" && artigo.urlExterna && (
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-brand/20 bg-brand/5 p-5 text-ink-950 transition-colors">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 shrink-0 text-brand" />
                    <span className="text-sm font-medium text-ink-900">
                      Saiba mais sobre esse conteúdo aqui:
                    </span>
                  </div>
                  <a
                    href={artigo.urlExterna}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep hover:underline break-all"
                  >
                    {artigo.urlExterna}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                </div>
              )}

              {/* Rodapé do artigo */}
              <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-ink-200/70 pt-6">
                <p className="text-sm text-ink-500">
                  Publicado por{" "}
                  <span className="font-medium text-ink-950">{artigo.autor}</span>{" "}
                  · {artigo.data}
                </p>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-2 text-sm font-medium text-brand transition-colors hover:text-brand-deep"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  Todos os conteúdos
                </Link>
              </div>
            </Reveal>
          </div>
        </article>

        {/* 4. Leia também */}
        {relacionados.length > 0 && (
          <section className="border-t border-ink-200/60 bg-ink-50/60 py-16 md:py-20">
            <div className="container-default">
              <Reveal>
                <p className="eyebrow">Leia também</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-balance">Outros conteúdos da Infodive.</h2>
              </Reveal>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relacionados.map((relacionado, index) => (
                  <Reveal
                    key={relacionado.slug}
                    delay={(index % 3) * 0.08}
                    className="h-full"
                  >
                    <ArtigoCard artigo={relacionado} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        <BlogCta />
      </main>
      <Footer />
    </>
  );
}
