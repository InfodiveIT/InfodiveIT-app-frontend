"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/animations/reveal";
import dynamic from "next/dynamic";
import { Mail, Phone, MapPin, Clock, MessageSquare, Check, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

const GsapMenu = dynamic(() => import("@/components/GsapMenu").then((mod) => mod.GsapMenu), {
  ssr: false,
});

export type ContactInfoState = {
  eyebrow: string
  headline: string
  headlineDestaque: string
  subtitulo: string
  email: string
  telefone: string
  endereco: string
  horarioComercial: string
  horarioNoc: string
  cardTitulo: string
  cardDescricao: string
  cardBullets: string[]
  cardCtaTexto: string
  cardStatus: string
}

const DEFAULT_CONTACT_INFO: ContactInfoState = {
  eyebrow: "Contato",
  headline: "Pronto para evoluir a TI da sua empresa?",
  headlineDestaque: "TI da sua empresa",
  subtitulo: "Conecte-se com nossos consultores seniores. Estamos prontos para projetar e implementar soluções de infraestrutura e nuvem sob medida para o seu negócio.",
  email: "contato@infodive.com.br",
  telefone: "+55 (51) 3330-0444",
  endereco: "Av. Cristovão Colombo, 3000 - Sala 704 | Floresta, Porto Alegre - RS",
  horarioComercial: "Seg a Sex, 9h às 18h",
  horarioNoc: "Suporte Crítico NOC: 24/7",
  cardTitulo: "Precisa de ajuda imediata?",
  cardDescricao: "Fale com nossos engenheiros e receba uma análise rápida dos requisitos de TI, segurança e nuvem do seu negócio.",
  cardBullets: [
    "Resposta em até 1 hora",
    "Diagnóstico inicial sem custo",
    "Especialistas certificados",
  ],
  cardCtaTexto: "Falar com Especialista",
  cardStatus: "Especialistas online no momento",
};

export type ContactProps = {
  initialInfo?: ContactInfoState
}

export function Contact({ initialInfo }: ContactProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [info, setInfo] = useState<ContactInfoState>(initialInfo ?? DEFAULT_CONTACT_INFO);

  useEffect(() => {
    if (initialInfo) return;

    api.contatoInfo()
      .then((data) => {
        if (data) {
          let bullets: string[] = [];
          if (Array.isArray(data.cardBullets)) {
            bullets = data.cardBullets;
          } else if (typeof data.cardBullets === 'string') {
            try {
              bullets = JSON.parse(data.cardBullets);
            } catch {
              bullets = [];
            }
          }

          setInfo({
            eyebrow: data.eyebrow || "Contato",
            headline: data.headline || "Pronto para evoluir a TI da sua empresa?",
            headlineDestaque: data.headlineDestaque || "TI da sua empresa",
            subtitulo: data.subtitulo || "Conecte-se com nossos consultores seniores. Estamos prontos para projetar e implementar soluções de infraestrutura e nuvem sob medida para o seu negócio.",
            email: data.email || "contato@infodive.com.br",
            telefone: data.telefone || "+55 (51) 3330-0444",
            endereco: data.endereco || "Av. Cristovão Colombo, 3000 - Sala 704 | Floresta, Porto Alegre - RS",
            horarioComercial: data.horarioComercial || "Seg a Sex, 9h às 18h",
            horarioNoc: data.horarioNoc || "Suporte Crítico NOC: 24/7",
            cardTitulo: data.cardTitulo || "Precisa de ajuda imediata?",
            cardDescricao: data.cardDescricao || "Fale com nossos engenheiros e receba uma análise rápida dos requisitos de TI, segurança e nuvem do seu negócio.",
            cardBullets: bullets.length > 0 ? bullets : (data.cardBullets || [
              "Resposta em até 1 hora",
              "Diagnóstico inicial sem custo",
              "Especialistas certificados",
            ]),
            cardCtaTexto: data.cardCtaTexto || "Falar com Especialista",
            cardStatus: data.cardStatus || "Especialistas online no momento",
          });
        }
      })
      .catch(() => { /* fallback */ });
  }, [initialInfo]);

  return (
    <section id="contact" className="scroll-mt-28 md:scroll-mt-36 relative z-10 bg-white py-20 md:py-28 border-t border-ink-200/60">
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
        {/* Gradient banner — todos os componentes da seção vivem aqui dentro */}
        <div
          className="relative overflow-hidden rounded-[2rem] px-6 py-12 sm:px-10 md:px-14 md:py-16 text-white shadow-2xl shadow-[#3B1F59]/30"
          style={{ background: "linear-gradient(135deg, #6F0101 0%, #3B1F59 50%, #063FB4 100%)" }}
        >
          {/* ── Efeitos decorativos (clean) ── */}
          {/* Brilho suave no canto superior esquerdo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.16),transparent_55%)]"
          />
          {/* Orb de luz azul — profundidade no canto inferior direito */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#0E66FF]/30 blur-[130px]"
          />
          {/* Arcos finos no canto superior direito */}
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/15" />
          <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden className="pointer-events-none absolute -right-44 -top-44 h-[28rem] w-[28rem] rounded-full border border-white/[0.06]" />
          {/* Padrão de pontos sutil no canto inferior esquerdo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_bottom_left,black,transparent_45%)]"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Contact Details (Left Column) */}
          <Reveal className="lg:col-span-7 flex flex-col gap-6">
            <p className="eyebrow text-sm text-white/70">{info.eyebrow}</p>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] text-balance">
              {info.headlineDestaque && info.headline.includes(info.headlineDestaque) ? (
                <>
                  {info.headline.split(info.headlineDestaque)[0]}
                  <span className="text-[#9DB8FF]">{info.headlineDestaque}</span>
                  {info.headline.split(info.headlineDestaque)[1]}
                </>
              ) : info.headline.includes("TI da sua empresa") ? (
                <>
                  {info.headline.split("TI da sua empresa")[0]}
                  <span className="text-[#9DB8FF]">TI da sua empresa</span>
                  {info.headline.split("TI da sua empresa")[1]}
                </>
              ) : (
                info.headline
              )}
            </h2>
            <p className="text-ink-300 text-base md:text-lg max-w-2xl font-light leading-relaxed text-pretty">
              {info.subtitulo}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/15 hover:border-white/30 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-white/15 text-white mt-0.5">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">E-mail</h4>
                  <a href={`mailto:${info.email}`} className="text-xs text-ink-300 hover:text-brand transition-colors mt-0.5 block">
                    {info.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/15 hover:border-white/30 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-white/15 text-white mt-0.5">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Telefone</h4>
                  <a href={`tel:${info.telefone.replace(/\D/g, "")}`} className="text-xs text-ink-300 hover:text-brand transition-colors mt-0.5 block">
                    {info.telefone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/15 hover:border-white/30 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-white/15 text-white mt-0.5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Localização</h4>
                  <span className="text-xs text-ink-300 mt-0.5 block leading-relaxed">
                    {info.endereco}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.07] border border-white/15 hover:border-white/30 transition-all duration-300">
                <div className="p-2.5 rounded-lg bg-white/15 text-white mt-0.5">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Disponibilidade</h4>
                  <span className="text-xs text-ink-300 mt-0.5 block leading-relaxed">
                    Comercial: {info.horarioComercial}<br />{info.horarioNoc}
                  </span>
                </div>
              </div>

            </div>
          </Reveal>

          {/* CTA Box (Right Column) */}
          <Reveal as="div" delay={0.12} className="lg:col-span-5 relative flex flex-col p-8 md:p-10 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-xl overflow-hidden shadow-xl shadow-black/20">
            {/* Top accent border */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#0E66FF] to-transparent" />
            {/* Soft inner glow */}
            <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#0E66FF]/25 blur-3xl" />

            <div className="relative">
              {/* Icon badge */}
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E66FF]/20 border border-white/15 text-white mb-5">
                <MessageSquare className="h-6 w-6" strokeWidth={2} />
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2.5">
                {info.cardTitulo}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed mb-6">
                {info.cardDescricao}
              </p>

              {/* Quick reassurances */}
              <ul className="flex flex-col gap-3 mb-8">
                {info.cardBullets.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#46BEA3]/20 text-[#46BEA3]">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA pinned to the bottom */}
            <div className="relative mt-auto">
              <Button
                variant="primary"
                onClick={() => setIsMenuOpen(true)}
                className="w-full text-sm font-bold py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(14,102,255,0.25)]"
              >
                {info.cardCtaTexto}
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Button>

              <div className="flex items-center gap-2 justify-center w-full mt-5 text-xs text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-[#46BEA3] animate-pulse"></span>
                {info.cardStatus}
              </div>
            </div>
          </Reveal>

          </div>
        </div>
      </div>

      {/* Renders the GSAP Overlay Contact Form Drawer */}
      <GsapMenu
        isOpen={isMenuOpen}
        onToggle={setIsMenuOpen}
      />
    </section>
  );
}
