import type { Metadata } from "next";
import { Footer } from "@/layout/footer";
import { SobreHero } from "@/sections/sobre/hero";
import { SobreManifesto } from "@/sections/sobre/manifest";
import { SobreNumeros } from "@/sections/sobre/ourNumbers";
import { SobreTimeline } from "@/sections/sobre/timeline";
import { SobreValores } from "@/sections/sobre/ourValues";
import { SobreCultura } from "@/sections/sobre/culture";
import { SobreCta } from "@/sections/sobre/cta";

export const metadata: Metadata = {
  title: "Quem Somos — Integradores de TI desde 2003",
  description:
    "Conheça a Infodive: mais de duas décadas integrando infraestrutura, segurança, cloud e inteligência artificial para empresas que não podem parar.",
  alternates: {
    canonical: "https://infodive.com.br/sobre",
  },
  keywords: [
    "Quem Somos",
    "Integradora de TI",
    "História Infodive",
    "Infraestrutura de TI",
    "Parceiro de Tecnologia",
    "Infodive",
  ],
  openGraph: {
    title: "Quem Somos — Integradores de TI desde 2003 | Infodive IT",
    description: "Conheça a Infodive: mais de duas décadas integrando infraestrutura, segurança, cloud e inteligência artificial para empresas que não podem parar.",
    url: "https://infodive.com.br/sobre",
    type: "website",
  },
};

export const revalidate = 600; // 10 minutes ISR cache

export default function SobrePage() {
  return (
    <>
      <main id="main-content" className="relative z-20 bg-white">
        <SobreHero />
        <SobreManifesto />
        <SobreNumeros />
        <SobreTimeline />
        <SobreValores />
        <SobreCultura />
        <SobreCta />
      </main>
      <Footer />
    </>
  );
}
