'use client'

import React, { useState } from "react";
import { InteractiveGridPattern } from "@/components/animations/interactive-grid-pattern";
import { ArrowRight, MessageSquare } from "lucide-react";
import { TextEffect } from "@/components/animations/text-effect";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { Reveal } from "@/components/animations/reveal";

// Import partner logo SVGs from assets
import awsLogo from "@/assets/AWS Logo.png";
import acronisLogo from "@/assets/Acronis Logo.svg";
import appleLogo from "@/assets/Apple Logo.svg";
import dellLogo from "@/assets/Dell Logo.svg";
import ibmLogo from "@/assets/IBM Logo.svg";
import lenovoLogo from "@/assets/Lenovo Logo.svg";
import microsoftLogo from "@/assets/Microsoft Logo.svg";
import redhatLogo from "@/assets/Red Hat Logo.png";
import suseLogo from "@/assets/Suse Logo.svg";
import veeamLogo from "@/assets/Veeam Logo.svg";
import virtuozzoLogo from "@/assets/Virtuozzo Logo.svg";
import { MagicCard } from "@/components/ui/magic-card";
import dynamic from "next/dynamic";

const DashboardCarousel = dynamic(() => import("@/components/dashboard-carousel").then((mod) => mod.DashboardCarousel), {
  ssr: false,
});
import tela1 from "@/assets/telas-carrossel-hero/tela-1.webp";
import tela2 from "@/assets/telas-carrossel-hero/tela-2.webp";
import tela3 from "@/assets/telas-carrossel-hero/tela-3.webp";

import { api } from "@/lib/api";
import { useEffect } from "react";

import { VENDOR_LOGOS } from "@/lib/vendor-logos";

const SHOWCASE_SLIDES = [
  { src: tela1, alt: "Dashboard de monitoramento Infodive" },
  { src: tela2, alt: "Painel de indicadores Infodive" },
  { src: tela3, alt: "Tela de automação Infodive" },
];

const PARTNERS = [
  { name: "IBM", description: "Líder global em IA e nuvem híbrida segura.", logo: ibmLogo, className: "h-5 sm:h-7" },
  { name: "AWS", description: "Nuvem de escala global com serviços avançados.", logo: awsLogo, className: "h-8 sm:h-10" },
  { name: "Lenovo", description: "Infraestrutura robusta de servidores e alta performance.", logo: lenovoLogo, className: "h-6 sm:h-8", keepWhiteOnHover: true },
  { name: "Dell Technologies", description: "Computação e armazenamento de ponta corporativo.", logo: dellLogo, className: "h-7 sm:h-9" },
  { name: "Veeam", description: "Proteção moderna de dados e backup inteligente.", logo: veeamLogo, className: "h-7 sm:h-9" },
  { name: "Acronis", description: "Integração inovadora de cibersegurança e backup.", logo: acronisLogo, className: "h-7 sm:h-9", keepWhiteOnHover: true },
  { name: "Red Hat", description: "Soluções open source corporativas e Kubernetes.", logo: redhatLogo, className: "h-8 sm:h-10" },
  { name: "Microsoft", description: "A nuvem do Azure para escala e inovação global.", logo: microsoftLogo, className: "h-7 sm:h-9" },
  { name: "SUSE", description: "Soluções corporativas de Linux e Kubernetes open.", logo: suseLogo, className: "h-8 sm:h-10", keepWhiteOnHover: true },
  { name: "Virtuozzo", description: "Virtualização eficiente e hiperconvergência em nuvem.", logo: virtuozzoLogo, className: "h-6 sm:h-8", keepWhiteOnHover: true },
  { name: "Apple", description: "Ecossistema tecnológico premium integrado.", logo: appleLogo, className: "h-7 sm:h-9", keepWhiteOnHover: true },
];

const MOBILE_LOGO_CLASSES: Record<string, string> = {
  IBM: "h-6 sm:h-7",
  AWS: "h-8 sm:h-10",
  Lenovo: "h-6 sm:h-8",
  "Dell Technologies": "h-7 sm:h-9",
  Dell: "h-7 sm:h-9",
  Veeam: "h-7 sm:h-9",
  Acronis: "h-7 sm:h-9",
  "Red Hat": "h-8 sm:h-10",
  Microsoft: "h-7 sm:h-9",
  SUSE: "h-8 sm:h-10",
  Virtuozzo: "h-6 sm:h-8",
  Apple: "h-7 sm:h-9",
  HPE: "h-7 sm:h-9",
};

const renderHeadline = (text: string, highlight?: string) => {
  if (!highlight || !text.includes(highlight)) {
    if (text.includes('*')) {
      const parts = text.split('*');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span
              key={index}
              className="font-black animate-shine bg-[linear-gradient(110deg,#0E66FF,#0E66FF_38%,#7aa9ff_47%,#eaf1ff_50%,#7aa9ff_53%,#0E66FF_62%,#0E66FF)] bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(14,102,255,0.25)]"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      });
    }
    return <span>{text}</span>;
  }

  const parts = text.split(highlight);
  return (
    <>
      <span>{parts[0]}</span>
      <span className="font-black animate-shine bg-[linear-gradient(110deg,#0E66FF,#0E66FF_38%,#7aa9ff_47%,#eaf1ff_50%,#7aa9ff_53%,#0E66FF_62%,#0E66FF)] bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(14,102,255,0.25)]">
        {highlight}
      </span>
      <span>{parts.slice(1).join(highlight)}</span>
    </>
  );
};

export type HeroProps = {
  initialHeroData?: any
  initialSlides?: any[]
  initialPartners?: any[]
}

export function Hero({ initialHeroData, initialSlides, initialPartners }: HeroProps = {}) {
  const { scrollTo } = useSmoothScroll();
  const [activePartnerIndex, setActivePartnerIndex] = useState<number | null>(null);
  const [slides, setSlides] = useState<any[] | null>(initialSlides ?? SHOWCASE_SLIDES);
  const [partners, setPartners] = useState<any[]>(initialPartners && initialPartners.length > 0 ? initialPartners : PARTNERS);
  const [heroData, setHeroData] = useState<any>(initialHeroData ?? null);

  useEffect(() => {
    // Se os dados já foram fornecidos via SSR, não dispara requisições no navegador
    if (initialHeroData && initialSlides && initialPartners) return;

    if (!heroData) {
      api.paginaHero('home')
        .then((data) => {
          if (data) setHeroData(data);
        })
        .catch(() => {});
    }

    if (!initialSlides) {
      api.heroCarousel()
        .then((data) => {
          if (data && data.length > 0) {
            const sorted = [...data].sort((a, b) => a.ordem - b.ordem);
            setSlides(sorted.map((item) => ({
              src: item.imagemUrl,
              alt: "Dashboard Infodive " + item.ordem
            })));
          } else {
            setSlides(SHOWCASE_SLIDES);
          }
        })
        .catch(() => {
          setSlides(SHOWCASE_SLIDES);
        });
    }

    if (!initialPartners) {
      api.fabricantes()
        .then((data) => {
          if (data && data.length > 0) {
            const sorted = [...data].sort((a, b) => a.ordem - b.ordem);
            setPartners(sorted.map((p) => {
              const staticPartner = PARTNERS.find((sp) => sp.name.toLowerCase() === p.nome.toLowerCase() || sp.name.toLowerCase() === p.slug.toLowerCase());
              return {
                name: p.nome,
                description: p.descricaoCurta || p.descricao || "",
                logo: p.logoUrl || staticPartner?.logo || "",
                className: staticPartner?.className || "h-4 sm:h-5",
                keepWhiteOnHover: staticPartner ? (staticPartner.keepWhiteOnHover ?? false) : true
              };
            }));
          }
        })
        .catch(() => {});
    }
  }, [initialHeroData, initialSlides, initialPartners]);

  const marqueePartners = [...partners, ...partners];

  const handlePartnerClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePartnerIndex((prev) => (prev === index ? null : index));
  };

  React.useEffect(() => {
    if (activePartnerIndex === null) return;

    const handleGlobalClick = () => {
      setActivePartnerIndex(null);
    };

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [activePartnerIndex]);


  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (scrollTo("contact")) e.preventDefault();
  };

  const handleSolutionsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === "/" && scrollTo("solutions")) {
      e.preventDefault();
    }
  };
  return (
    <section className="hero relative overflow-hidden bg-ink-950 flex flex-col min-h-0 sm:min-h-screen">
      {/* Background Interactive Grid filling the entire section */}
      <InteractiveGridPattern
        width={48}
        height={48}
        squares={[50, 25]}
        className="absolute inset-0 h-full w-full stroke-white/[0.06] [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_75%)] opacity-30"
        squaresClassName="hover:fill-brand/10 transition-all duration-150"
      />

      <div className="container-default relative z-10 text-center pt-28 sm:pt-24 pb-4 flex flex-col items-center justify-center w-full max-w-full mt-0 sm:mt-6">
        {/* Eyebrow */}
        <TextEffect
          key={heroData?.eyebrow || 'default-eyebrow'}
          per="word"
          preset="blur"
          delay={0.1}
          className="text-xs font-semibold uppercase tracking-[0.25em] text-white mb-4"
          duration={0.9}
        >
          {heroData?.eyebrow || "INFODIVE IT"}
        </TextEffect>
 
        {/* Title — "missão crítica" é um span único, então o brilho varre a frase
            inteira de uma vez (não palavra por palavra). */}
        <motion.h1
          key={`${heroData?.headline || 'default-headline'}-${heroData?.headlineDestaque || 'no-destaque'}`}
          initial={{ opacity: 0, filter: "blur(6px)", y: 8 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
          className="text-balance text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 max-w-4xl leading-[1.15] px-2"
        >
          {renderHeadline(
            heroData?.headline || "Tecnologia de *missão crítica* para empresas que não param",
            heroData?.headlineDestaque
          )}
        </motion.h1>
 
        {/* Description */}
        <TextEffect
          key={heroData?.subtitulo || 'default-sub'}
          per="word"
          as="p"
          preset="blur"
          delay={0.5}
          duration={0.9}
          className="text-balance text-sm sm:text-base md:text-base text-ink-300 mb-6 max-w-2xl leading-relaxed px-4"
        >
          {heroData?.subtitulo || "Infraestrutura, segurança, cloud e inteligência artificial, integrados, gerenciados e sustentados pela Infodive."}
        </TextEffect>
 
        {/* Buttons */}
        <Reveal delay={0.6}>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto justify-center px-4">
            <Link href="/#solucoes" 
                  onClick={handleSolutionsClick} 
                  className="focus:outline-none w-full sm:w-auto" 
                  tabIndex={-1}
            >
              <Button
                variant="primary"
                className="w-full sm:w-auto text-sm font-bold py-3.5 sm:px-6 sm:py-3 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(14,102,255,0.25)] whitespace-nowrap"
              >
                Explorar soluções
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Button>
            </Link>
            <Link 
              href="/#contact" 
              onClick={handleContactClick}
              className="focus:outline-none w-full sm:w-auto" 
              tabIndex={-1}
            >
              <Button
                variant="secondary"
                className="border border-white/10 w-full sm:w-auto text-sm font-bold py-3.5 sm:px-6 sm:py-3 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <MessageSquare className="h-4 w-4 text-ink-300" strokeWidth={2} />
                Fale conosco
              </Button>
            </Link>
          </div>
        </Reveal>
 
        {/* Social Proof */}
        <Reveal key={heroData?.tagline || 'default-tagline'} delay={0.7}>
          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-500 px-4">
            {heroData?.tagline || "Desde 2003 integrando tecnologia e negócios."}
          </p>
        </Reveal>
      </div>
      {/* End of vertically-centered hero text */}

      {/* Animated Infinite Marquee Carousel (logos) */}
      <Reveal delay={0.8} className="relative z-10 w-full max-w-full md:max-w-6xl mx-auto mt-2 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)] sm:[mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)] select-none">
        <div 
          className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused] cursor-pointer"
          style={{
            animationPlayState: activePartnerIndex !== null ? 'paused' : 'running'
          }}
        >
          {marqueePartners.map((partner, index) => {
            const isActive = activePartnerIndex === index;
            const logoSrc = partner.logo || (VENDOR_LOGOS as any)[partner.name] || (VENDOR_LOGOS as any)[partner.name.replace(' Technologies', '')] || partner.logo;
            const logoClass = partner.className || MOBILE_LOGO_CLASSES[partner.name] || "h-6 sm:h-8";
            return (
              <React.Fragment key={index}>
                {/* Mobile: Simple, flat card without heavy follow glows */}
                <div
                  className="block md:hidden w-[200px] sm:w-[240px] shrink-0 p-1"
                  onClick={(e) => handlePartnerClick(index, e)}
                >
                  <div
                    className={cn(
                      "h-full rounded-lg transition-all duration-300 min-h-[120px] sm:min-h-[136px] flex flex-col items-center justify-between text-center p-2.5 pt-4 sm:p-4 border-[0.5px]",
                      isActive
                        ? "border-white/40 bg-ink-900/80 shadow-[0_4px_12px_rgba(255,255,255,0.05)]"
                        : "border-white/5 bg-ink-900/40"
                    )}
                  >
                    {/* Logo Container */}
                    <div className="h-8 sm:h-10 flex items-center justify-center mb-2">
                      <Image
                        src={logoSrc}
                        alt={`${partner.name} logo`}
                        width={120}
                        height={32}
                        className={cn(
                          "w-auto object-contain transition-all duration-300",
                          isActive
                            ? (partner.keepWhiteOnHover ? "brightness-0 invert opacity-100" : "brightness-100 invert-0 opacity-100")
                            : "brightness-0 invert opacity-50",
                          logoClass
                        )}
                        unoptimized
                      />
                    </div>
                    {/* Info */}
                    <div className="flex flex-col justify-center flex-grow">
                      <h4 className={cn(
                        "text-xs font-bold tracking-wider uppercase mb-1.5 transition-colors duration-300",
                        isActive ? "text-brand" : "text-white"
                      )}>
                        {partner.name}
                      </h4>
                      <p className={cn(
                        "text-[10px] sm:text-[11px] leading-normal max-w-[160px] sm:max-w-[180px] mx-auto transition-colors duration-300",
                        isActive ? "text-ink-300" : "text-ink-500"
                      )}>
                        {partner.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop: Premium MagicCard with dynamic glow borders */}
                <div
                  className="hidden md:block w-[200px] sm:w-[240px] shrink-0 p-1"
                  onClick={(e) => handlePartnerClick(index, e)}
                >
                  <MagicCard
                    className="h-full rounded-lg"
                    gradientColor="rgba(255, 255, 255, 0.05)"
                    gradientFrom="rgba(255, 255, 255, 0.35)"
                    gradientTo="rgba(255, 255, 255, 0.05)"
                    gradientSize={150}
                    gradientOpacity={0.8}
                    style={{
                      "--color-background": "rgba(20, 20, 19, 0.3)",
                      "--card-face-background": isActive ? "rgba(20, 20, 19, 0.75)" : "rgba(20, 20, 19, 0.55)",
                      "--color-border": isActive ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.05)",
                    } as React.CSSProperties}
                  >
                    <CardContent className="p-2.5 pt-4 sm:p-4 flex flex-col items-center justify-between text-center h-full min-h-[120px] sm:min-h-[136px]">
                      {/* Logo Container */}
                      <div className="h-8 sm:h-10 flex items-center justify-center mb-2">
                        <Image
                          src={logoSrc}
                          alt={`${partner.name} logo`}
                          width={120}
                          height={32}
                          className={cn(
                            "w-auto object-contain transition-all duration-300",
                            isActive
                              ? (partner.keepWhiteOnHover ? "brightness-0 invert opacity-100" : "brightness-100 invert-0 opacity-100")
                              : "brightness-0 invert opacity-50 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0",
                            logoClass
                          )}
                          unoptimized
                        />
                      </div>
                      {/* Info */}
                      <div className="flex flex-col justify-center flex-grow">
                        <h4 className={cn(
                          "text-xs font-bold tracking-wider uppercase mb-1.5 transition-colors duration-300",
                          isActive ? "text-brand" : "text-white group-hover:text-brand"
                        )}>
                          {partner.name}
                        </h4>
                        <p className={cn(
                          "text-[10px] sm:text-[11px] leading-normal max-w-[160px] sm:max-w-[180px] mx-auto transition-colors duration-300",
                          isActive ? "text-ink-300" : "text-ink-500 group-hover:text-ink-300"
                        )}>
                          {partner.description}
                        </p>
                      </div>
                    </CardContent>
                  </MagicCard>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </Reveal>

      {/* Dashboard showcase — slide central sobrepõe os laterais.
          Cortado a ~75%: a margem negativa encolhe a caixa do wrapper e o fundo
          da foto some no overflow-hidden (corte seco, sem invadir a seção branca). */}
      <Reveal delay={0.9} className="relative z-0 w-full mt-8 sm:mt-12 overflow-hidden">
        <div className="-mb-16 sm:-mb-20 md:-mb-28 lg:-mb-40 min-h-[220px] sm:min-h-[300px]">
          {slides && <DashboardCarousel slides={slides} className="w-full" />}
        </div>
      </Reveal>
    </section>
  )
}
