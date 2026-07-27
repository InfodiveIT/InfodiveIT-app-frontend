"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Server, ShieldCheck } from "lucide-react";
import { type Solution } from "@/lib/solutions-data";
import { resolveLucideIcon } from "@/lib/lucide-icon-resolver";
import { VENDOR_LOGOS } from "@/lib/vendor-logos";
import { InteractiveGridPattern } from "@/components/animations/interactive-grid-pattern";
import { Reveal } from "@/components/animations/reveal";
import { GlowBorderOverlay, handleGlowMove } from "@/components/ui/glow-border";
import { BorderBeam } from "@/components/ui/border-beam";
import dynamic from "next/dynamic";
import { ConversionCTA } from "@/components/conversion-cta";
import { normalizeImageUrl } from "@/lib/api";

const GsapMenu = dynamic(() => import("@/components/GsapMenu").then((mod) => mod.GsapMenu), {
  ssr: false,
});

interface SolutionDetailContentProps {
  solution: Solution;
}

export function SolutionDetailContent({
  solution,
}: SolutionDetailContentProps) {
  const Icon = resolveLucideIcon(solution.iconName, Server);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative z-20 w-full min-h-screen bg-white text-ink-900">
      {/* 1. Dark Hero Header Section */}
      <div className="relative bg-[#050507] text-white pt-28 sm:pt-36 pb-20 overflow-hidden border-b border-white/5">
        {/* Decorative Interactive Grid in Hero Background */}
        <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none z-0">
          <InteractiveGridPattern
            width={48}
            height={48}
            squares={[50, 25]}
            className="absolute inset-0 h-full w-full stroke-white/[0.04] [mask-image:radial-gradient(ellipse_at_top,white_30%,transparent_80%)] opacity-40"
            squaresClassName="hover:fill-brand/10 transition-all duration-150"
          />
          {/* Large blur glow matching brand colors */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-brand/10 rounded-full blur-[140px] pointer-events-none" />
        </div>

        <div className="container-default relative z-10">
          {/* Breadcrumb & Navigation */}
          <div className="mb-10 px-4">
            <Reveal>
              <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-500 mb-6">
                <Link
                  href="/solucoes"
                  className="hover:text-brand transition-colors"
                >
                  Soluções
                </Link>
                <span>/</span>
                <span className="text-white">{solution.title}</span>
              </nav>
            </Reveal>

            <Reveal delay={0.08}>
              <Link
                href="/solucoes"
                className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Voltar para soluções
              </Link>
            </Reveal>
          </div>

          {/* Hero Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start px-4">
            {/* Hero Left: Heading & Summary */}
            <div className="lg:col-span-7">
              <Reveal delay={0.12}>
                <div className="h-12 w-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6 shadow-[0_0_24px_rgba(14,102,255,0.15)]">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
              </Reveal>

              <Reveal delay={0.16}>
                <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
                  {solution.title}
                </h1>
              </Reveal>

              <Reveal delay={0.2}>
                <p className="text-lg text-brand-tint font-medium tracking-wide mb-6">
                  {solution.subtitle}
                </p>
              </Reveal>

              <Reveal delay={0.24}>
                <p className="text-base text-ink-300 font-light leading-relaxed">
                  {solution.overview}
                </p>
              </Reveal>
            </div>

            {/* Hero Right: Container para imagem da solução */}
            <div className="lg:col-span-5 w-full flex items-center justify-center">
              <Reveal delay={0.28} className="w-full">
                <div className="relative mx-auto aspect-[3/2] w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] flex items-center justify-center shadow-2xl group">
                  <BorderBeam
                    size={120}
                    duration={8}
                    colorFrom="#0E66FF"
                    colorTo="#7aa9ff"
                  />
                  {solution.imageUrl ? (
                    <Image
                      src={solution.imageUrl}
                      alt={solution.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : null}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Light Main Content Section */}
      <div className="bg-ink-50/50 py-16 sm:py-20 text-ink-900">
        <div className="container-default">
          {/* Technical Capabilities Section */}
          <div className="mb-20 px-4">
            <Reveal className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand mb-3">
                Recursos & Tecnologia
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-950 tracking-tight">
                Capacidades Técnicas
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {solution.features.map((feat, index) => (
                <Reveal key={index} delay={0.1 + index * 0.08}>
                  <div
                    onMouseMove={handleGlowMove}
                    className="group relative flex h-full flex-col rounded-xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:border-ink-300 hover:shadow-[0_12px_24px_rgba(20,20,19,0.06)]"
                  >
                    <GlowBorderOverlay glowColor="#0E66FF" glowSize={240} />
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]">
                      <div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/5 border border-brand/10 text-brand mb-4">
                          <ShieldCheck className="h-4.5 w-4.5" />
                        </div>
                        <h4 className="text-base font-bold text-ink-950 mb-2 leading-snug">
                          {feat.title}
                        </h4>
                        <p className="text-sm text-ink-500 font-light leading-relaxed">
                          {feat.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Parcerias e Fabricantes Homologados */}
          <div className="mb-20 px-4">
            <div className="border border-ink-200 bg-white rounded-2xl p-8 md:p-12 shadow-sm">
              <Reveal>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-5">
                    <h3 className="text-lg font-bold text-ink-950 mb-3">
                      {solution.fabricantesTitulo || "Parcerias e Fabricantes Homologados"}
                    </h3>
                    <p className="text-sm text-ink-500 font-light leading-relaxed">
                      {solution.fabricantesDescricao || "Trabalhamos com os líderes globais de hardware e software para desenhar projetos corporativos que garantem suporte direto de fábrica e conformidade."}
                    </p>
                  </div>

                  <div className="lg:col-span-7">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {solution.vendors.map((vendorName) => {
                        const vendorObj = solution.vendorObjects?.find(v => v.nome === vendorName);
                        const logoAsset = normalizeImageUrl(vendorObj?.logoUrl) || VENDOR_LOGOS[vendorName];
                        return (
                          <div
                            key={vendorName}
                            className="flex items-center justify-center h-16 rounded-xl bg-ink-50 border border-ink-200/80 p-4 hover:border-brand/20 transition-all duration-300 group"
                          >
                            {logoAsset ? (
                              <Image
                                src={logoAsset}
                                alt={vendorName}
                                width={120}
                                height={40}
                                className="max-h-7 object-contain opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                                unoptimized
                              />
                            ) : (
                              <span className="text-xs font-bold text-ink-500 group-hover:text-brand transition-colors">
                                {vendorName}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Global Conversion Box */}
          <div className="mt-20 max-w-6xl mx-auto px-4">
            <Reveal delay={0.1}>
              <ConversionCTA
                title="Comece a transformação da sua empresa"
                subtitle="Agende uma reunião estratégica de 15 minutos com nossos arquitetos de TI para mapear a melhor arquitetura e SLA para sua operação."
                ctaLabel="Falar com um especialista"
                onCtaClick={() => setIsMenuOpen(true)}
              />
            </Reveal>
          </div>
        </div>
      </div>
      <GsapMenu isOpen={isMenuOpen} onToggle={setIsMenuOpen} />
    </div>
  );
}
