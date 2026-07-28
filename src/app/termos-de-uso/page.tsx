import type { Metadata } from "next";
import { Footer } from "@/layout/footer";
import { Reveal } from "@/components/animations/reveal";
import { api } from "@/lib/api";

export const metadata: Metadata = {
  title: "Termos de Uso | Infodive IT",
  description: "Termos e condições de uso do portal e dos serviços da Infodive IT.",
  alternates: {
    canonical: "https://infodive.com.br/termos-de-uso",
  },
  openGraph: {
    title: "Termos de Uso | Infodive IT",
    description: "Termos e condições de uso do portal e dos serviços da Infodive IT.",
    url: "https://infodive.com.br/termos-de-uso",
    type: "website",
  },
};

export default async function TermosDeUsoPage() {
  let politicaData = null;
  try {
    politicaData = await api.politica("termos-de-uso");
  } catch {
    politicaData = null;
  }

  const titulo = politicaData?.titulo || "Termos de Uso";
  const subtitulo = politicaData?.subtitulo || "Termos e Condições";
  const ultimaAtualizacao = politicaData?.ultimaAtualizacao || "16 de Junho de 2026";

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

            <Reveal delay={0.12} className="mt-12">
              {politicaData?.conteudo ? (
                <div className="max-w-none text-[16px] md:text-[17px] leading-relaxed text-ink-900 whitespace-pre-line">
                  {politicaData.conteudo}
                </div>
              ) : (
                <div className="max-w-none text-[16px] md:text-[17px] leading-relaxed text-ink-900">
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Bem-vindo ao portal da <strong>Infodive IT</strong>. Ao acessar e utilizar este website, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, por favor, não utilize nosso site.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    1. Aceitação dos Termos
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Os presentes Termos de Uso regulam o acesso e a utilização dos serviços e informações disponibilizados no site da Infodive IT. O uso continuado deste site confirma sua aceitação tácita e integral destes termos.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    2. Propriedade Intelectual
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Todo o conteúdo deste site é propriedade da Infodive IT ou de seus fornecedores de conteúdo e parceiros de tecnologia, sendo protegido pelas leis de direitos autorais.
                  </p>
                </div>
              )}

              <div className="mt-14 border-t border-ink-200/70 pt-6 text-sm text-ink-500">
                Última atualização: {ultimaAtualizacao}.
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
