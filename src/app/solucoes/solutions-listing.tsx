"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Search, ArrowUpRight, ArrowLeft, Server } from "lucide-react";
import type { Solution } from "@/lib/solutions-data";
import { categoriaToSolution } from "@/lib/converters";
import { resolveLucideIcon } from "@/lib/lucide-icon-resolver";
import { InteractiveGridPattern } from "@/components/animations/interactive-grid-pattern";
import { Reveal } from "@/components/animations/reveal";
import { Button } from "@/components/ui/button";
import { GlowBorderOverlay, handleGlowMove } from "@/components/ui/glow-border";
import { motion } from "framer-motion";
import { ConversionCTA } from "@/components/conversion-cta";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { api, type CategoriaDTO } from "@/lib/api";

const GsapMenu = dynamic(() => import("@/components/GsapMenu").then((mod) => mod.GsapMenu), {
  ssr: false,
});

const FALLBACK_CATEGORIES = [
  "Todas",
  "Segurança",
  "Infraestrutura",
  "Armazenamento",
  "Proteção de Dados",
  "Cloud",
  "Inteligência Artificial",
];

const FALLBACK_CATEGORY_MAP: Record<string, string[]> = {
  "Segurança": ["seguranca"],
  "Infraestrutura": ["infraestrutura", "virtualizacao", "endpoints"],
  "Armazenamento": ["armazenamento"],
  "Proteção de Dados": ["protecao-de-dados"],
  "Cloud": ["cloud", "observability"],
  "Inteligência Artificial": ["inteligencia-artificial"],
};

export type SolutionsListingProps = {
  initialSolutions?: Solution[]
  initialCategories?: string[]
  initialCategoryList?: CategoriaDTO[]
  initialCta?: {
    titulo?: string
    subtitulo?: string
    ctaTexto?: string
    tipoAcao?: string
  }
}

export function SolutionsListing({
  initialSolutions,
  initialCategories,
  initialCategoryList,
  initialCta,
}: SolutionsListingProps = {}) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>(initialSolutions ?? []);
  const [categories, setCategories] = useState<string[]>(initialCategories ?? ["Todas"]);
  const [categoryList, setCategoryList] = useState<CategoriaDTO[]>(initialCategoryList ?? []);
  const [cta, setCta] = useState<{ titulo?: string; subtitulo?: string; ctaTexto?: string; tipoAcao?: string }>(initialCta ?? {
    titulo: "Sua infraestrutura crítica precisa de sustentação?",
    subtitulo: "Fale com nossos arquitetos de soluções. Projetamos, implementamos e sustentamos seu ambiente 24/7 com garantia de SLA.",
    ctaTexto: "Falar com especialista",
    tipoAcao: "DRAWER",
  });

  useEffect(() => {
    if (initialSolutions && initialCategoryList && initialCta) return;

    try {
      const cached = localStorage.getItem("infodive_solutions_listing_cache_v1");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.solutions && parsed.solutions.length > 0 && !initialSolutions) setSolutions(parsed.solutions);
        if (parsed.categories && parsed.categories.length > 0 && !initialCategories) setCategories(parsed.categories);
        if (parsed.categoryList && parsed.categoryList.length > 0 && !initialCategoryList) setCategoryList(parsed.categoryList);
        if (parsed.cta && !initialCta) setCta(parsed.cta);
      }
    } catch {}

    Promise.all([
      api.cta("solucoes").catch(() => null),
      api.categorias().catch(() => []),
      api.solucoes().catch(() => []),
    ]).then(([ctaData, cats, solucoesData]) => {
      if (ctaData) {
        setCta({
          titulo: ctaData.titulo,
          subtitulo: ctaData.subtitulo,
          ctaTexto: ctaData.ctaTexto,
          tipoAcao: ctaData.tipoAcao,
        });
      }

      let activeCats: CategoriaDTO[] = [];
      let newCats = ["Todas"];
      if (cats && cats.length > 0) {
        activeCats = cats.filter(c => c.ativo).sort((a, b) => a.ordem - b.ordem);
        newCats = ["Todas", ...activeCats.map(c => c.nome)];
        setCategoryList(activeCats);
        setCategories(newCats);
      }

      let mappedSolutions: Solution[] = [];
      if (solucoesData && solucoesData.length > 0) {
        const sorted = [...solucoesData].sort((a, b) => a.ordem - b.ordem);
        mappedSolutions = sorted.map(cat => categoriaToSolution(cat));
        setSolutions(mappedSolutions);
      }

      try {
        localStorage.setItem("infodive_solutions_listing_cache_v1", JSON.stringify({
          solutions: mappedSolutions,
          categories: newCats,
          categoryList: activeCats,
          cta: ctaData ? {
            titulo: ctaData.titulo,
            subtitulo: ctaData.subtitulo,
            ctaTexto: ctaData.ctaTexto,
            tipoAcao: ctaData.tipoAcao,
          } : cta,
        }));
      } catch {}
    }).catch(() => {});
  }, [initialSolutions, initialCategoryList, initialCta]);

  // Sync selectedCategory with searchParams (e.g. ?seguranca)
  useEffect(() => {
    let foundCategory = "Todas";
    if (categoryList.length > 0) {
      const matched = categoryList.find(c => searchParams.has(c.slug));
      if (matched) {
        foundCategory = matched.nome;
      }
    } else {
      for (const [cat, slugs] of Object.entries(FALLBACK_CATEGORY_MAP)) {
        if (slugs.some(slug => searchParams.has(slug))) {
          foundCategory = cat;
          break;
        }
      }
    }
    setSelectedCategory(foundCategory);
  }, [searchParams, categoryList]);

  // Filter solutions based on search input and selected category tab
  const filteredSolutions = useMemo(() => {
    return solutions.filter((solution) => {
      const matchesSearch =
        solution.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        solution.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        solution.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedCategory === "Todas") {
        return matchesSearch;
      }

      if (categoryList.length > 0 && solution.categoriaId) {
        const selectedCatObj = categoryList.find(c => c.nome === selectedCategory);
        if (selectedCatObj) {
          return matchesSearch && solution.categoriaId === selectedCatObj.id;
        }
      }

      const slugs = FALLBACK_CATEGORY_MAP[selectedCategory] || [];
      return matchesSearch && slugs.includes(solution.slug);
    });
  }, [searchQuery, selectedCategory, solutions, categoryList]);

  return (
    <div className="relative z-20 w-full min-h-screen bg-white text-ink-900">
      {/* 1. Dark Hero Header Section */}
      <div className="relative bg-[#050507] text-white pt-20 sm:pt-36 pb-20 overflow-hidden border-b border-white/5">
        {/* Decorative Interactive Grid in Hero Background */}
        <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none z-0">
          <InteractiveGridPattern
            width={48}
            height={48}
            squares={[50, 20]}
            className="absolute inset-0 h-full w-full stroke-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)] opacity-40"
            squaresClassName="hover:fill-brand/10 transition-all duration-150"
          />
          {/* Subtle blur glow in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Header Hero Content */}
        <div className="container-default relative z-10 mx-auto flex flex-col px-4">
          <div className="flex justify-start mb-4 sm:mb-6 mt-[-8px] sm:mt-0">
            <Reveal>
              <Link
                href="/"
                className="inline-flex h-9 w-9 sm:h-10 sm:w-auto items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.08] p-0 sm:px-4 sm:py-2 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.15] hover:text-white hover:scale-[1.02] shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>
            </Reveal>
          </div>

          <div className="flex max-w-4xl flex-col items-center mx-auto text-center w-full">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent mb-4">
                Nosso Portfólio
              </p>
            </Reveal>
          
          <Reveal delay={0.1}>
            <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Soluções de{" "}
              <span 
                className="text-transparent"
                style={{ WebkitTextStroke: "1.8px #0E66FF", WebkitTextFillColor: "transparent" }}
              >
                Missão Crítica
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-balance text-base sm:text-lg text-ink-300 max-w-2xl leading-relaxed">
              Desenhamos e gerenciamos infraestruturas elásticas, segurança de dados ativa e plataformas cognitivas para que sua empresa nunca pare.
            </p>
          </Reveal>
        </div>
        </div>
      </div>

      {/* 2. Light Main Content Section */}
      <div className="bg-ink-50/50 py-16 sm:py-20">
        <div className="container-default">
          {/* Filter and Search Section (Light Theme) */}
          <Reveal delay={0.3} className="w-full max-w-6xl mx-auto mb-12 px-2">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between border border-ink-200/60 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              {/* Search Input */}
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Buscar solução..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-ink-50 border border-ink-200 rounded-xl text-ink-950 placeholder:text-ink-400 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex overflow-x-auto no-scrollbar gap-1.5 w-full lg:flex-1 lg:min-w-0 justify-start py-2 px-1 select-none">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        if (typeof window !== "undefined") {
                          const url = new URL(window.location.href);
                          const allSlugs = [
                            ...categoryList.map(c => c.slug),
                            ...Object.values(FALLBACK_CATEGORY_MAP).flat()
                          ];
                          allSlugs.forEach(slug => {
                            url.searchParams.delete(slug);
                          });
                          if (category !== "Todas") {
                            const dynamicCat = categoryList.find(c => c.nome === category);
                            const slug = dynamicCat ? dynamicCat.slug : FALLBACK_CATEGORY_MAP[category]?.[0];
                            if (slug) {
                              url.search = `?${slug}`;
                            }
                          } else {
                            url.search = "";
                          }
                          window.history.pushState({}, "", url.pathname + url.search);
                        }
                      }}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-300 focus:outline-none cursor-pointer select-none whitespace-nowrap ${
                        isActive
                          ? "text-white"
                          : "text-ink-600 hover:text-ink-950"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-brand rounded-lg shadow-[0_4px_12px_rgba(14,102,255,0.25)]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          style={{ zIndex: 0 }}
                        />
                      )}
                      <span className="relative z-10">{category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Solutions Grid (Light Cards) */}
          {filteredSolutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredSolutions.map((solution, index) => {
                const Icon = resolveLucideIcon(solution.iconName, Server);
                return (
                  <Reveal 
                    key={solution.slug} 
                    delay={0.1 + (index % 3) * 0.08}
                    className="h-full"
                  >
                    <Link 
                      href={`/solucoes/${solution.slug}`} 
                      onMouseMove={handleGlowMove}
                      className="group relative flex h-full flex-col rounded-xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:border-ink-300 hover:shadow-[0_12px_24px_rgba(20,20,19,0.06)]"
                    >
                      {/* Interactive Glow Border overlay */}
                      <GlowBorderOverlay glowColor="#0E66FF" glowSize={240} />

                      <div className="flex flex-col h-full justify-between relative z-10">
                        <div>
                          {/* Header of Card */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="h-10 w-10 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300">
                              <Icon className="h-5 w-5" strokeWidth={1.75} />
                            </div>
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-50 text-ink-400 group-hover:text-brand group-hover:bg-brand/10 transition-all duration-300">
                              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                          </div>

                          {/* Content */}
                          <h3 className="text-lg font-bold text-ink-950 mb-2 leading-tight group-hover:text-brand transition-colors duration-300">
                            {solution.title}
                          </h3>
                          <p className="text-xs text-brand font-medium tracking-wide mb-4">
                            {solution.subtitle}
                          </p>
                          <p className="text-sm text-ink-500 font-light leading-relaxed mb-6">
                            {solution.description}
                          </p>

                          {/* Quick Highlights / Bullet points */}
                          <div className="border-t border-ink-100 pt-4 mb-6">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400 mb-2">Recursos Chave</p>
                            <ul className="space-y-1.5">
                              {((solution.recursosChave && solution.recursosChave.length > 0)
                                ? solution.recursosChave
                                : solution.features.map(f => f.title)
                              ).slice(0, 3).map((item, i) => (
                                <li key={i} className="text-xs text-ink-600 flex items-center gap-1.5 font-light">
                                  <span className="h-1 w-1 rounded-full bg-brand shrink-0" />
                                  <span className="truncate">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Footer Vendors & Action */}
                        <div className="flex items-center justify-between border-t border-ink-100 pt-4">
                          {/* Vendor badges */}
                          <div className="flex items-center gap-1">
                            {solution.vendors.slice(0, 2).map((vend, i) => (
                              <span 
                                key={i}
                                className="px-2 py-0.5 rounded bg-ink-50 border border-ink-200/60 text-[9px] font-medium text-ink-500"
                              >
                                {vend}
                              </span>
                            ))}
                            {solution.vendors.length > 2 && (
                              <span className="text-[9px] font-medium text-ink-400 pl-1">
                                +{solution.vendors.length - 2}
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-semibold text-brand flex items-center gap-1 group-hover:text-brand-deep transition-colors">
                            Ver detalhes
                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <Reveal className="text-center py-16 max-w-md mx-auto">
              <p className="text-ink-500 text-sm mb-4">Nenhuma solução encontrada para os termos pesquisados.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todas");
                }}
                className="text-brand font-semibold text-sm hover:underline"
              >
                Limpar filtros e buscar novamente
              </button>
            </Reveal>
          )}

          {/* CTA Section */}
          <Reveal delay={0.2} className="mt-20 max-w-6xl mx-auto">
            <ConversionCTA
              title={cta.titulo ?? "Sua infraestrutura crítica precisa de sustentação?"}
              subtitle={cta.subtitulo ?? "Fale com nossos arquitetos de soluções. Projetamos, implementamos e sustentamos seu ambiente 24/7 com garantia de SLA."}
              ctaLabel={cta.ctaTexto ?? "Falar com especialista"}
              tipoAcao={cta.tipoAcao}
              onCtaClick={() => setIsMenuOpen(true)}
            />
          </Reveal>
        </div>
      </div>
      <GsapMenu isOpen={isMenuOpen} onToggle={setIsMenuOpen} />
    </div>
  );
}
