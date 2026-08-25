"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, ArrowLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useSearchParams } from "next/navigation"


import { InteractiveGridPattern } from "@/components/animations/interactive-grid-pattern"
import { Reveal } from "@/components/animations/reveal"
import { Marquee } from "@/components/ui/marquee"
import { NumberTicker } from "@/components/ui/number-ticker"
import { BorderBeam } from "@/components/ui/border-beam"
import { SelectField } from "@/components/ui/select-field"
import { ProductCard } from "@/components/product-card"
import { ConversionCTA } from "@/components/conversion-cta"
import dynamic from "next/dynamic"
import { VENDOR_LOGOS } from "@/lib/vendor-logos"

const GsapMenu = dynamic(() => import("@/components/GsapMenu").then((mod) => mod.GsapMenu), {
  ssr: false,
})

import { useEffect } from "react"
import { api, normalizeImageUrl, type ProdutoResumoDTO } from "@/lib/api"
import type { Product } from "@/lib/products-data"

export function mapDtoToProduct(dto: ProdutoResumoDTO): Product {
  return {
    slug: dto.slug,
    nome: dto.nome,
    fabricante: dto.fabricanteNome || dto.fabricanteSlug || '',
    fabricanteSlug: dto.fabricanteSlug || '',
    logo: normalizeImageUrl(dto.fabricanteLogoUrl) || VENDOR_LOGOS[dto.fabricanteNome || ''] || '',
    logoClass: 'h-5',
    categoria: dto.categoriaTitle || dto.categoriaSlug || '',
    categoriaSlug: dto.categoriaSlug || '',
    subcategoria: dto.subcategoria || '',
    descricaoCurta: dto.descricaoCurta || '',
    descricaoCompleta: '',
    destaque: dto.destaque,
    diferenciais: [],
    casosDeUso: [],
    servicos: [],
  }
}

export type ProductsListingProps = {
  initialProducts?: Product[]
  initialFabricantes?: string[]
  initialStats?: { produtos: number; fabricantes: number; categorias: number }
  initialCta?: {
    titulo?: string
    subtitulo?: string
    ctaTexto?: string
    tipoAcao?: string
  }
}

export function ProductsListing({
  initialProducts,
  initialFabricantes,
  initialStats,
  initialCta,
}: ProductsListingProps = {}) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? [])
  const [fabricantesList, setFabricantesList] = useState<string[]>(initialFabricantes ?? [])
  const [stats, setStats] = useState(initialStats ?? {
    produtos: initialProducts?.length ?? 0,
    fabricantes: initialFabricantes?.length ?? 0,
    categorias: 0,
  })
  const [cta, setCta] = useState(initialCta ?? {
    titulo: "Não encontrou o que procurava?",
    subtitulo: "Trabalhamos com os principais fabricantes globais. Converse com nossos especialistas para dimensionar a solução exata para o seu cenário.",
    ctaTexto: "Falar com Especialista",
    tipoAcao: "CONTATO",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [selectedFabricante, setSelectedFabricante] = useState("Todos")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const searchParams = useSearchParams()
  const urlFabricante = searchParams.get("fabricante")

  useEffect(() => {
    if (initialProducts && initialFabricantes && initialStats && initialCta) return

    try {
      const cached = localStorage.getItem("infodive_products_listing_cache_v1")
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.products && !initialProducts) setProducts(parsed.products)
        if (parsed.fabricantesList && !initialFabricantes) setFabricantesList(parsed.fabricantesList)
        if (parsed.stats && !initialStats) setStats(parsed.stats)
        if (parsed.cta && !initialCta) setCta(parsed.cta)
      }
    } catch {}

    Promise.all([
      api.cta("produtos").catch(() => null),
      api.produtos({ size: 100 }).catch(() => null),
      api.fabricantes().catch(() => null),
      api.categorias().catch(() => null),
    ]).then(([ctaData, produtosPage, fabricantesData, categoriasData]) => {
      let mappedProducts = products
      let fabricantesNomes = fabricantesList

      if (ctaData) {
        setCta({
          titulo: ctaData.titulo,
          subtitulo: ctaData.subtitulo,
          ctaTexto: ctaData.ctaTexto,
          tipoAcao: ctaData.tipoAcao,
        })
      }

      if (fabricantesData && fabricantesData.length > 0) {
        fabricantesNomes = fabricantesData.map((f) => f.nome)
        setFabricantesList(fabricantesNomes)
      }

      if (produtosPage && produtosPage.content && produtosPage.content.length > 0) {
        mappedProducts = produtosPage.content.map(mapDtoToProduct)
        setProducts(mappedProducts)
      }

      const totalProdutos = produtosPage?.totalElements ?? produtosPage?.content?.length ?? mappedProducts.length
      const totalFabricantes = fabricantesData && fabricantesData.length > 0 ? fabricantesData.length : fabricantesNomes.length
      const totalCategorias = categoriasData && categoriasData.length > 0 ? categoriasData.filter((c) => c.ativo).length : 0

      const statsObj = {
        produtos: totalProdutos,
        fabricantes: totalFabricantes,
        categorias: totalCategorias,
      }
      setStats(statsObj)

      try {
        localStorage.setItem("infodive_products_listing_cache_v1", JSON.stringify({
          products: mappedProducts,
          fabricantesList: fabricantesNomes,
          stats: statsObj,
          cta: ctaData ? {
            titulo: ctaData.titulo,
            subtitulo: ctaData.subtitulo,
            ctaTexto: ctaData.ctaTexto,
            tipoAcao: ctaData.tipoAcao,
          } : cta,
        }))
      } catch {}
    }).catch(() => {})
  }, [initialProducts, initialFabricantes, initialStats, initialCta])

  const productCategories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.categoria).filter(Boolean)))
    return ["Todos", ...cats]
  }, [products])

  const fabricanteOptions = useMemo(() => {
    const set = new Set<string>()
    fabricantesList.forEach((f) => set.add(f))
    products.forEach((p) => {
      if (p.fabricante) set.add(p.fabricante)
    })
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"))
    return [
      { value: "Todos", label: "Todos os fabricantes" },
      ...sorted.map((f) => ({ value: f, label: f })),
    ]
  }, [fabricantesList, products])

  useEffect(() => {
    if (urlFabricante) {
      const match = products.find(
        (p) =>
          p.fabricanteSlug?.toLowerCase() === urlFabricante.toLowerCase() ||
          p.fabricante?.toLowerCase() === urlFabricante.toLowerCase()
      )
      if (match) {
        setSelectedFabricante(match.fabricante)
      } else {
        setSelectedFabricante(urlFabricante)
      }
    }
  }, [urlFabricante, products])

  const isDefaultView =
    selectedCategory === "Todos" &&
    selectedFabricante === "Todos" &&
    searchQuery.trim() === ""

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const fabFilter = selectedFabricante.toLowerCase()
    return products.filter((p) => {
      const matchesSearch =
        q === "" ||
        p.nome.toLowerCase().includes(q) ||
        p.subcategoria.toLowerCase().includes(q) ||
        p.descricaoCurta.toLowerCase().includes(q) ||
        p.fabricante.toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === "Todos" || p.categoria === selectedCategory
      const matchesFabricante =
        selectedFabricante === "Todos" ||
        p.fabricante.toLowerCase() === fabFilter ||
        p.fabricanteSlug?.toLowerCase() === fabFilter
      return matchesSearch && matchesCategory && matchesFabricante
    })
  }, [searchQuery, selectedCategory, selectedFabricante, products])

  const featured = useMemo(() => products.filter((p) => p.destaque).slice(0, 6), [products])
  // Na visão padrão, o grid mostra os não-destaque (os destaque já aparecem na faixa).
  const gridProducts = isDefaultView
    ? filtered.filter((p) => !p.destaque)
    : filtered

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("Todos")
    setSelectedFabricante("Todos")
  }

  return (
    <div className="relative z-20 w-full min-h-screen bg-white text-ink-900">
      {/* 1. Hero escuro */}
      <div className="relative bg-[#050507] text-white pt-20 sm:pt-36 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none z-0">
          <InteractiveGridPattern
            width={48}
            height={48}
            squares={[50, 20]}
            className="absolute inset-0 h-full w-full stroke-white/[0.04] [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_80%)] opacity-40"
            squaresClassName="hover:fill-brand/10 transition-all duration-150"
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

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
                Catálogo
              </p>
            </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-balance text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
              Produtos de{" "}
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: "1.8px #0E66FF", WebkitTextFillColor: "transparent" }}
              >
                missão crítica
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-balance text-base sm:text-lg text-ink-300 max-w-2xl leading-relaxed">
              Uma curadoria do nosso catálogo com os principais fabricantes do mundo —
              prontos para resolver desafios reais de infraestrutura, segurança e cloud.
            </p>
          </Reveal>

          {/* Stats */}
          <Reveal delay={0.28}>
            <div className="mt-10 flex items-center justify-center gap-8 sm:gap-12">
              {[
                { value: stats.produtos, label: "Produtos" },
                { value: stats.fabricantes, label: "Fabricantes" },
                { value: stats.categorias, label: "Categorias" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    <NumberTicker value={stat.value} />+
                  </span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-500">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        </div>

        {/* Marquee de fabricantes */}
        <div className="relative z-10 mt-14 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
          <Marquee pauseOnHover duration="60s">
            {(() => {
              const list = fabricantesList.length > 0 ? fabricantesList : Object.keys(VENDOR_LOGOS)
              const repeated = [...list, ...list, ...list, ...list]
              return repeated.map((fab, idx) => {
                const logo = VENDOR_LOGOS[fab]
                return (
                  <div key={`${fab}-${idx}`} className="flex h-10 items-center justify-center px-4">
                    {logo ? (
                      <Image
                        src={logo}
                        alt={fab}
                        className="h-6 w-auto object-contain opacity-40 brightness-0 invert transition-opacity duration-300 hover:opacity-80"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-white/40">{fab}</span>
                    )}
                  </div>
                )
              })
            })()}
          </Marquee>
        </div>
      </div>

      {/* 2. Seção clara */}
      <div className="bg-ink-50/50 py-16 sm:py-20">
        <div className="container-default">
          {/* Filtros */}
          <Reveal delay={0.1} className="w-full max-w-6xl mx-auto mb-12 px-2">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between border border-ink-200/60 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              {/* Busca */}
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-ink-50 border border-ink-200 rounded-xl text-ink-950 placeholder:text-ink-400 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                />
              </div>

              {/* Tabs de categoria */}
              <div className="flex overflow-x-auto no-scrollbar gap-1.5 w-full lg:flex-1 lg:min-w-0 justify-start py-1 px-1 select-none">
                {productCategories.map((category) => {
                  const isActive = selectedCategory === category
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-300 focus:outline-none cursor-pointer select-none whitespace-nowrap ${
                        isActive ? "text-white" : "text-ink-600 hover:text-ink-950"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeProductTab"
                          className="absolute inset-0 bg-brand rounded-lg shadow-[0_4px_12px_rgba(14,102,255,0.25)]"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          style={{ zIndex: 0 }}
                        />
                      )}
                      <span className="relative z-10">{category}</span>
                    </button>
                  )
                })}
              </div>

              {/* Fabricante */}
              <div className="w-full lg:w-56">
                <SelectField
                  value={selectedFabricante}
                  onChange={setSelectedFabricante}
                  options={fabricanteOptions}
                  ariaLabel="Filtrar por fabricante"
                  placeholder="Fabricante"
                />
              </div>
            </div>
          </Reveal>

          {/* Faixa "Em destaque" (só na visão padrão) */}
          {isDefaultView && featured.length > 0 && (
            <Reveal delay={0.12} className="max-w-6xl mx-auto mb-12">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-ink-950">
                  Em destaque
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featured.map((product) => (
                  <div
                    key={product.slug}
                    className="relative rounded-xl [&>a]:rounded-xl"
                  >
                    <BorderBeam size={110} duration={9} colorFrom="#0E66FF" colorTo="#7aa9ff" />
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Grid */}
          {gridProducts.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              {isDefaultView && featured.length > 0 && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-ink-950">
                    Todo o catálogo
                  </h2>
                </div>
              )}
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {gridProducts.map((product) => (
                    <motion.div
                      key={product.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                      className="h-full"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            <Reveal className="text-center py-16 max-w-md mx-auto">
              <p className="text-ink-500 text-sm mb-4">
                Nenhum produto encontrado para os filtros selecionados.
              </p>
              <button
                onClick={clearFilters}
                className="text-brand font-semibold text-sm hover:underline"
              >
                Limpar filtros e buscar novamente
              </button>
            </Reveal>
          )}

          {/* CTA */}
          <Reveal delay={0.1} className="mt-20 max-w-6xl mx-auto">
            <ConversionCTA
              title={cta.titulo ?? "Não achou o que procurava?"}
              subtitle={cta.subtitulo ?? "Nosso catálogo vai muito além desta vitrine. Fale com um especialista e encontramos o produto certo — com o melhor fabricante — para o seu desafio."}
              ctaLabel={cta.ctaTexto ?? "Falar com especialista"}
              tipoAcao={cta.tipoAcao}
              onCtaClick={() => setIsMenuOpen(true)}
            />
          </Reveal>
        </div>
      </div>

      <GsapMenu isOpen={isMenuOpen} onToggle={setIsMenuOpen} />
    </div>
  )
}
