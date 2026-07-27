"use client"

import { createRef, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  Layers,
  Tag,
  Wrench,
  Headphones as HeadphonesIcon,
  ShieldCheck,
  RefreshCcw,
  Activity,
  Cloud,
  Cog
} from "lucide-react"
import type { Product } from "@/lib/products-data"
import { VENDOR_LOGOS, VENDOR_URLS } from "@/lib/vendor-logos"
import redhatPretoLogo from "@/assets/Red Hat Preto Logo.svg"
import { InteractiveGridPattern } from "@/components/animations/interactive-grid-pattern"
import { AnimatedBeam } from "@/components/animations/animated-beam"
import { Reveal } from "@/components/animations/reveal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BorderBeam } from "@/components/ui/border-beam"
import { GlowBorderOverlay, handleGlowMove } from "@/components/ui/glow-border"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TracingBeam } from "@/components/ui/tracing-beam"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import useEmblaCarousel from "embla-carousel-react"
import { ProductCard } from "@/components/product-card"
import { ConversionCTA } from "@/components/conversion-cta"
import dynamic from "next/dynamic"

const GsapMenu = dynamic(() => import("@/components/GsapMenu").then((mod) => mod.GsapMenu), {
  ssr: false,
})

const SERVICE_ICONS: Record<string, any> = {
  wrench: Wrench,
  headphones: HeadphonesIcon,
  "shield-check": ShieldCheck,
  "life-buoy": Wrench,
  "server-cog": Cog,
  activity: Activity,
  cog: Cog,
  "refresh-ccw": RefreshCcw,
  cloud: Cloud,
  
  implementacao: Wrench,
  sustentacao: HeadphonesIcon,
  conformidade: ShieldCheck,
  migracao: RefreshCcw,
  monitoramento: Activity,
  default: Cog,
}

/** Diagrama "integra com nossos serviços" (AnimatedBeam). */
function ServicesDiagram({ product }: { product: Product }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const lastProductSlug = useRef(product.slug)
  const servicosList = (product.servicos || []).slice(0, 6)
  const count = servicosList.length
  const serviceRefs = useRef(servicosList.map(() => createRef<HTMLDivElement>()))

  if (lastProductSlug.current !== product.slug) {
    lastProductSlug.current = product.slug
    serviceRefs.current = servicosList.map(() => createRef<HTMLDivElement>())
  }

  const fabLogo = product.logo || (product.fabricante === "Red Hat" ? redhatPretoLogo : VENDOR_LOGOS[product.fabricante])
  const dynamicHeightClass = count > 4 ? "min-h-[420px]" : "min-h-[340px]"
  const flexGapClass = count > 4 ? "gap-2 sm:gap-2.5" : "gap-3.5 sm:gap-4"
  const curvatureStep = count > 4 ? 28 : 45

  return (
    <div className="w-full">
      {/* 1. Layout Mobile (abaixo de sm) */}
      <div className="flex flex-col items-center gap-4 sm:hidden px-4 py-6 rounded-2xl border border-ink-200 bg-ink-50/50">
        {/* Nó central: o produto */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-ink-200 bg-white p-3 shadow-md">
          {fabLogo ? (
            <Image
              src={fabLogo}
              alt={product.fabricante}
              className="h-7 w-auto max-w-[50px] object-contain"
              unoptimized
            />
          ) : (
            <span className="text-[10px] font-bold text-ink-700">{product.fabricante}</span>
          )}
        </div>

        {/* Linha vertical tracejada decorativa */}
        <div className="h-6 w-0.5 border-l-2 border-dashed border-ink-200" />

        {/* Serviços empilhados */}
        <div className="w-full flex flex-col gap-2.5">
          {servicosList.map((service) => {
            const Icon = typeof service.icon === 'string'
              ? (SERVICE_ICONS[service.icon] || SERVICE_ICONS.default)
              : service.icon;
            return (
              <div
                key={service.nome}
                className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 shadow-sm w-full"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/5 text-brand shrink-0">
                  {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
                </span>
                <span className="text-xs font-semibold text-ink-800 sm:text-sm">
                  {service.nome}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Layout Desktop (sm e acima) */}
      <div
        ref={containerRef}
        className={`hidden sm:flex relative mx-auto ${dynamicHeightClass} w-full max-w-2xl items-center justify-between px-8 py-6`}
      >
        {/* Nó central: o produto */}
        <div
          ref={centerRef}
          className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-ink-200 bg-white p-3 shadow-[0_8px_30px_rgba(20,20,19,0.10)]"
        >
          {fabLogo ? (
            <Image
              src={fabLogo}
              alt={product.fabricante}
              className="h-11 w-auto max-w-[64px] object-contain"
              unoptimized
            />
          ) : (
            <span className="text-[10px] font-bold text-ink-700">{product.fabricante}</span>
          )}
        </div>

        {/* Nós laterais: serviços */}
        <div className={`relative z-10 flex flex-col ${flexGapClass}`}>
          {servicosList.map((service, i) => {
            const Icon = typeof service.icon === 'string'
              ? (SERVICE_ICONS[service.icon] || SERVICE_ICONS.default)
              : service.icon;
            return (
              <div
                key={service.nome}
                ref={serviceRefs.current[i]}
                className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-white px-3 py-2 shadow-sm"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/5 text-brand shrink-0">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="whitespace-nowrap text-xs font-semibold text-ink-800 sm:text-sm">
                  {service.nome}
                </span>
              </div>
            )
          })}
        </div>

        {/* Feixes animados ligando o produto a cada serviço */}
        {servicosList.map((service, i) => (
          <AnimatedBeam
            key={service.nome}
            containerRef={containerRef}
            fromRef={centerRef}
            toRef={serviceRefs.current[i]}
            curvature={(i - (count - 1) / 2) * curvatureStep}
            gradientStartColor="#0E66FF"
            gradientStopColor="#7aa9ff"
            pathColor="#D8D8D8"
            pathWidth={1.5}
            pathOpacity={0.35}
            duration={4}
            delay={i * 0.4}
          />
        ))}
      </div>
    </div>
  )
}

/** Carrossel (embla) de produtos relacionados — arraste para navegar. */
function RelatedCarousel({ products }: { products: Product[] }) {
  const [emblaRef] = useEmblaCarousel({ align: "start", loop: false, dragFree: true })
  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-6">
        {products.map((rel) => (
          <div
            key={rel.slug}
            className="min-w-0 shrink-0 grow-0 basis-[85%] sm:basis-1/2 lg:basis-1/3"
          >
            <ProductCard product={rel} />
          </div>
        ))}
      </div>
    </div>
  )
}

import { api, normalizeImageUrl } from "@/lib/api"

export function ProductDetailContent({
  product,
  relatedProducts,
}: {
  product: Product
  relatedProducts?: Product[]
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!product) return null

  const related = relatedProducts || []
  const rawLogo = normalizeImageUrl(product.logo) || VENDOR_LOGOS[product.fabricante]
  const fabLogo = rawLogo
  const lightLogo = rawLogo || (product.fabricante === "Red Hat" ? redhatPretoLogo : fabLogo)

  return (
    <div className="relative z-20 w-full min-h-screen bg-white text-ink-900">
      {/* 1. Hero escuro */}
      <div className="relative bg-[#050507] text-white pt-28 sm:pt-36 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none z-0">
          <InteractiveGridPattern
            width={48}
            height={48}
            squares={[50, 25]}
            className="absolute inset-0 h-full w-full stroke-white/[0.04] [mask-image:radial-gradient(ellipse_at_top,white_30%,transparent_80%)] opacity-40"
            squaresClassName="hover:fill-brand/10 transition-all duration-150"
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-brand/10 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <div className="container-default relative z-10">
          {/* Breadcrumb + voltar */}
          <div className="mb-10 px-4">
            <Reveal>
              <Breadcrumb className="mb-6 text-ink-500">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/produtos">Produtos</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={product.solucaoSlug ? `/solucoes/${product.solucaoSlug}` : `/produtos?categoria=${product.categoriaSlug}`}>
                      {product.solucaoTitle || product.categoria}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white">{product.nome}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Reveal>

            <Reveal delay={0.08}>
              <Link
                href="/produtos"
                className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Voltar para o catálogo
              </Link>
            </Reveal>
          </div>

          {/* Hero grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start px-4">
            {/* Esquerda */}
            <div className="lg:col-span-7">
              <Reveal delay={0.12}>
                <div className="mb-6 flex items-center">
                  <div className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] backdrop-blur-md px-4 mt-1">
                    {fabLogo ? (
                      <Image
                        src={fabLogo}
                        alt={product.fabricante}
                        className="h-8 w-auto object-contain"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {product.fabricante}
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
                  {product.nome}
                </h1>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="brand">{product.categoria}</Badge>
                  <Badge variant="outline" className="border-white/15 text-ink-300">
                    {product.subcategoria}
                  </Badge>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="text-base sm:text-lg text-ink-300 font-light leading-relaxed mb-8 max-w-xl">
                  {product.descricaoCurta}
                </p>
              </Reveal>

              <Reveal delay={0.24}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    onClick={() => setIsMenuOpen(true)}
                    className="text-sm px-6 py-3.5 font-bold text-white cursor-pointer shadow-[0_4px_20px_rgba(14,102,255,0.25)]"
                  >
                    Falar com um especialista
                    <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                  </Button>
                </div>
              </Reveal>
            </div>

            {/* Direita: imagem do produto */}
            <div className="lg:col-span-5 w-full flex items-center justify-center">
              <Reveal delay={0.28} className="w-full">
                <div className="relative mx-auto aspect-[3/2] w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] flex items-center justify-center shadow-2xl group">
                  <BorderBeam size={120} duration={8} colorFrom="#0E66FF" colorTo="#7aa9ff" />
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.nome}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : fabLogo ? (
                    <Image
                      src={fabLogo}
                      alt={product.fabricante}
                      className="h-10 w-auto max-w-[160px] object-contain opacity-30 brightness-0 invert"
                      unoptimized
                    />
                  ) : null}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seção clara */}
      <div className="bg-ink-50/50 py-16 sm:py-20 text-ink-900">
        <div className="container-default">
          <TracingBeam className="px-4">
            <div className="space-y-20">
              {/* Visão geral / Diferenciais / Casos de uso + ficha técnica */}
              <div className="w-full space-y-10">
                <Tabs defaultValue="overview">
                  <TabsList className="mb-8">
                    <TabsTrigger value="overview">Visão geral</TabsTrigger>
                    <TabsTrigger value="diferenciais">Diferenciais</TabsTrigger>
                    <TabsTrigger value="casos">Casos de uso</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <p className="text-base text-ink-600 font-light leading-relaxed">
                      {product.descricaoCompleta}
                    </p>
                  </TabsContent>

                  <TabsContent value="diferenciais">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {product.diferenciais.map((dif) => (
                        <div
                          key={dif.title}
                          onMouseMove={handleGlowMove}
                          className="group relative flex flex-col rounded-xl border border-ink-200 bg-white p-5 transition-all duration-300 hover:border-ink-300 hover:shadow-[0_12px_24px_rgba(20,20,19,0.06)]"
                        >
                          <GlowBorderOverlay glowColor="#0E66FF" glowSize={200} />
                          <div className="relative z-10">
                            <h4 className="text-sm font-bold text-ink-950 mb-1.5">
                              {dif.title}
                            </h4>
                            <p className="text-sm text-ink-500 font-light leading-relaxed">
                              {dif.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="casos">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {product.casosDeUso.map((uc) => (
                        <div
                          key={uc.title}
                          onMouseMove={handleGlowMove}
                          className="group relative flex flex-col rounded-xl border border-ink-200 bg-white p-5 transition-all duration-300 hover:border-ink-300 hover:shadow-[0_12px_24px_rgba(20,20,19,0.06)]"
                        >
                          <GlowBorderOverlay glowColor="#0E66FF" glowSize={200} />
                          <div className="relative z-10 flex gap-3">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-ink-950">{uc.title}</h4>
                              <p className="text-sm text-ink-500 font-light leading-relaxed mt-1.5">
                                {uc.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Ficha técnica em baixo, layout horizontal premium no desktop */}
                <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2.5 border-b border-ink-200/70 bg-ink-50/60 px-6 py-3.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-500">
                      Ficha técnica
                    </p>
                  </div>
                  <dl className="grid grid-cols-1 divide-y divide-ink-200/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {[
                      { label: "Fabricante", value: product.fabricante, icon: Building2 },
                      { label: "Categoria", value: product.categoria, icon: Layers },
                      { label: "Subcategoria", value: product.subcategoria, icon: Tag },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-4 px-6 py-5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/5 text-brand">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <dt className="text-xs text-ink-500">{label}</dt>
                          <dd className="truncate text-sm font-semibold text-ink-950 sm:text-base">
                            {value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Integra com nossos serviços */}
              <section>
                <Reveal className="mb-8 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-3">
                    {product.servicosEyebrow || "Mais que um produto"}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 tracking-tight">
                    {product.servicosTitulo || "Integra com nossos serviços"}
                  </h2>
                  <p className="mt-3 text-sm text-ink-500 font-light leading-relaxed max-w-xl mx-auto">
                    {product.servicosDescricao || `Não entregamos só a licença: projetamos, implantamos e sustentamos o ${product.nome} dentro do seu ambiente, de ponta a ponta.`}
                  </p>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="rounded-2xl border border-ink-200 bg-white">
                    <ServicesDiagram product={product} />
                  </div>
                </Reveal>
              </section>

              {/* Sobre o fabricante */}
              <section>
                <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 md:p-10 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                      <div className="flex h-14 w-28 shrink-0 items-center justify-center rounded-xl bg-ink-50 border border-ink-200/80 p-3">
                        {lightLogo ? (
                          <Image
                            src={lightLogo}
                            alt={product.fabricante}
                            className="max-h-7 w-auto object-contain"
                            unoptimized
                          />
                        ) : (
                          <span className="text-sm font-bold text-ink-700">
                            {product.fabricante}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-ink-950 mb-1">
                          {product.fabricante}
                        </h3>
                        <p className="text-sm text-ink-500 font-light leading-relaxed max-w-md">
                          Parceiro homologado Infodive. Visite o site oficial para
                          conhecer mais sobre as soluções {product.fabricante}.
                        </p>
                      </div>
                    </div>
                    <a
                      href={product.linkOficial || VENDOR_URLS[product.fabricante] || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep transition-colors"
                    >
                      Ver produto
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                    </a>
                  </div>
                </div>
              </section>

              {/* Produtos relacionados */}
              {related.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-ink-950 tracking-tight">
                      Produtos relacionados
                    </h2>
                    <Link
                      href="/produtos"
                      className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-deep transition-colors"
                    >
                      Ver tudo
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </Link>
                  </div>
                  <RelatedCarousel products={related} />
                </section>
              )}
            </div>
          </TracingBeam>

          {/* CTA final */}
          <div className="mt-20 max-w-6xl mx-auto px-4">
            <Reveal delay={0.1}>
              <ConversionCTA
                title="Comece a transformação da sua empresa"
                subtitle={`Agende uma conversa com nossos especialistas e veja como o ${product.nome} se encaixa na sua estratégia de TI, com projeto, implantação e SLA garantidos.`}
                ctaLabel="Falar com um especialista"
                onCtaClick={() => setIsMenuOpen(true)}
              />
            </Reveal>
          </div>
        </div>
      </div>

      <GsapMenu isOpen={isMenuOpen} onToggle={setIsMenuOpen} />
    </div>
  )
}
