import type { Metadata } from "next";
import { Footer } from "@/layout/footer";
import { Reveal } from "@/components/animations/reveal";
import { api } from "@/lib/api";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

export const metadata: Metadata = {
  title: "Política de Privacidade | Infodive IT",
  description: "Política de privacidade e proteção de dados pessoais da Infodive IT.",
  alternates: {
    canonical: "https://infodive.com.br/politica-de-privacidade",
  },
  openGraph: {
    title: "Política de Privacidade | Infodive IT",
    description: "Política de privacidade e proteção de dados pessoais da Infodive IT.",
    url: "https://infodive.com.br/politica-de-privacidade",
    type: "website",
  },
};

export default async function PoliticaPrivacidadePage() {
  let politicaData = null;
  try {
    politicaData = await api.politica("politica-de-privacidade");
  } catch {
    politicaData = null;
  }

  const titulo = politicaData?.titulo || "Política de Privacidade";
  const subtitulo = politicaData?.subtitulo || "Termos e Condições";
  const ultimaAtualizacao = politicaData?.ultimaAtualizacao || "";

  return (
    <>
      <main id="main-content" className="relative z-20 min-h-screen bg-white text-ink-900 pt-28 md:pt-36 pb-20">
        <div className="container-default">
          <div className="mx-auto max-w-3xl">
            {/* Cabeçalho simples com detalhe azul */}
            <Reveal>
              <nav className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                {subtitulo}
              </nav>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl md:text-5xl">
                {titulo}
              </h1>
              {/* Linha azul de detalhe */}
              <div className="mt-5 h-1.5 w-16 rounded-full bg-brand" />
            </Reveal>

            {/* Conteúdo Dinâmico sem Reveal travando opacity */}
            <div className="mt-12">
              <MarkdownRenderer content={politicaData?.conteudo} />

              {ultimaAtualizacao && (
                <div className="mt-14 border-t border-ink-200/70 pt-6 text-sm text-ink-500">
                  Última atualização: {ultimaAtualizacao}.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
