"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlowBorder, GlowBorderOverlay, handleGlowMove } from "@/components/ui/glow-border"
import { Reveal } from "@/components/animations/reveal"
import { api, type ProdutoResumoDTO } from "@/lib/api"
import { Button } from "@/components/ui/button"

// Fallback estático mantido enquanto a API não está disponível
import ibmLogo from "@/assets/IBM Logo.svg"
import veeamLogo from "@/assets/Veeam Logo.svg"
import dellLogo from "@/assets/Dell Logo.svg"
import acronisLogo from "@/assets/Acronis Logo.svg"
import redhatPretoLogo from "@/assets/Red Hat Preto Logo.svg"
import { toFeaturedProduct, type FeaturedProduct } from "@/lib/converters"

export type ProductsProps = {
  initialProducts?: FeaturedProduct[]
  initialSectionInfo?: {
    eyebrow: string
    headline: string
    subtitulo: string
    headlineDestaque?: string
  }
}

export function Products({ initialProducts, initialSectionInfo }: ProductsProps = {}) {
  const [products, setProducts] = React.useState<FeaturedProduct[]>(initialProducts ?? [])
  const [active, setActive] = React.useState("Todos")
  const [sectionInfo, setSectionInfo] = React.useState(initialSectionInfo ?? {
    eyebrow: "Produtos",
    headline: "Produtos em destaque",
    subtitulo: "Uma seleção do nosso catálogo dos principais fabricantes do mundo — prontos para resolver desafios reais de infraestrutura, segurança e cloud.",
    headlineDestaque: "",
  })

  React.useEffect(() => {
    if (initialProducts && initialSectionInfo) return;

    try {
      const cached = localStorage.getItem("infodive_home_products_cache_v1")
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.products && parsed.products.length > 0 && !initialProducts) setProducts(parsed.products)
        if (parsed.sectionInfo && !initialSectionInfo) setSectionInfo(parsed.sectionInfo)
      }
    } catch {}

    let currentProducts = products
    let currentInfo = sectionInfo

    if (!initialProducts) {
      api.produtos({ destaque: true, size: 6 })
        .then((res) => {
          if (res.content.length > 0) {
            const mapped = res.content.map(toFeaturedProduct)
            setProducts(mapped)
            currentProducts = mapped
            try {
              localStorage.setItem("infodive_home_products_cache_v1", JSON.stringify({
                products: currentProducts,
                sectionInfo: currentInfo,
              }))
            } catch {}
          }
        })
        .catch(() => { /* mantém fallback */ })
    }

    if (!initialSectionInfo) {
      api.secaoHome("produtos")
        .then((data) => {
          if (data) {
            const infoObj = {
              eyebrow: data.eyebrow || "Produtos",
              headline: data.headline || "Produtos em destaque",
              subtitulo: data.subtitulo || "Uma seleção do nosso catálogo dos principais fabricantes do mundo — prontos para resolver desafios reais de infraestrutura, segurança e cloud.",
              headlineDestaque: data.headlineDestaque || "",
            }
            setSectionInfo(infoObj)
            currentInfo = infoObj
            try {
              localStorage.setItem("infodive_home_products_cache_v1", JSON.stringify({
                products: currentProducts,
                sectionInfo: currentInfo,
              }))
            } catch {}
          }
        })
        .catch(() => { /* mantém fallback */ })
    }
  }, [initialProducts, initialSectionInfo])

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.categoria)))]
  const filtered = active === "Todos" ? products : products.filter((p) => p.categoria === active)

  const MOBILE_VISIBLE = 4
  const MAX_VISIBLE = 6
  const visible = filtered.slice(0, MAX_VISIBLE)

  return (
    <section id="produtos" className="relative bg-ink-50 py-20 md:py-28">
      <div className="container-default">
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow text-sm">{sectionInfo.eyebrow}</p>
          <h2 className="text-ink-950 max-w-4xl text-balance text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15]">
            {sectionInfo.headlineDestaque && sectionInfo.headline.includes(sectionInfo.headlineDestaque) ? (
              <>
                {sectionInfo.headline.split(sectionInfo.headlineDestaque)[0]}
                <span className="text-[var(--brand-light)]">{sectionInfo.headlineDestaque}</span>
                {sectionInfo.headline.split(sectionInfo.headlineDestaque)[1]}
              </>
            ) : (
              sectionInfo.headline
            )}
          </h2>
          <p className="max-w-2xl text-balance text-base text-ink-500 leading-relaxed">
            {sectionInfo.subtitulo}
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((categoria) => {
            const isActive = active === categoria
            return (
              <GlowBorder
                key={categoria}
                type="button"
                onClick={() => setActive(categoria)}
                aria-pressed={isActive}
                glowColor="#0E66FF"
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-none",
                  isActive
                    ? "border-brand bg-brand text-white shadow-[0_4px_14px_rgba(14,102,255,0.25)]"
                    : "border-ink-200 bg-white text-ink-900 hover:text-ink-950"
                )}
              >
                {categoria}
              </GlowBorder>
            )
          })}
        </Reveal>

        <Reveal delay={0.12} className="mt-10">
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((produto, index) => (
                <motion.div
                  key={produto.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                  className={cn(index >= MOBILE_VISIBLE && "hidden sm:block")}
                >
                  <Link
                    href={`/produtos/${produto.slug}`}
                    onMouseMove={handleGlowMove}
                    className="group relative flex h-full flex-col rounded-xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:border-ink-300 hover:shadow-[0_12px_24px_rgba(20,20,19,0.06)]"
                  >
                    <GlowBorderOverlay glowColor="#0E66FF" glowSize={240} />
                    <div className="relative flex items-center justify-between gap-3">
                      <Image
                        src={produto.logoUrl}
                        alt={produto.fabricanteNome}
                        width={120}
                        height={32}
                        className="h-6 w-auto object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                      />
                      <span className="rounded-full bg-brand/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
                        {produto.categoria}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-ink-950 transition-colors duration-300 group-hover:text-brand">
                      {produto.nome}
                    </h3>
                    <p className="mt-2 flex-grow text-sm leading-relaxed text-ink-500">
                      {produto.descricao}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand">
                      Ver produto
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </Reveal>

        <Reveal delay={0.06} className="mt-12 flex justify-center">
          <Link href="/produtos" className="focus:outline-none w-full sm:w-auto flex justify-center" tabIndex={-1}>
            <Button
              variant="primary"
              className="w-full sm:w-auto text-sm font-bold py-3.5 sm:px-6 sm:py-3 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(14,102,255,0.25)]"
            >
              Ver todos os produtos
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

export default Products
