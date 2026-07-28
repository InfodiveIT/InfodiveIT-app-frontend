import type { Metadata } from "next";
import { Footer } from "@/layout/footer";
import { Reveal } from "@/components/animations/reveal";
import { api } from "@/lib/api";

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
                    Na <strong>Infodive IT</strong>, privacidade e segurança são prioridades e nos comprometemos com a transparência do tratamento de dados pessoais dos nossos usuários e clientes. Por isso, a presente Política de Privacidade estabelece como é feita a coleta, uso e transferência de informações de clientes ou outras pessoas que acessam ou usam nosso site.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    1. Quais dados coletamos e com qual finalidade?
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Nosso site coleta e utiliza alguns dados pessoais seus de forma a viabilizar a prestação de serviços e aprimorar a experiência de uso.
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex gap-3 text-ink-900">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
                      <span className="leading-relaxed"><strong>Dados de contato:</strong> Nome, e-mail, telefone e empresa fornecidos voluntariamente através de formulários de contato para atendimento técnico ou comercial.</span>
                    </li>
                    <li className="flex gap-3 text-ink-900">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
                      <span className="leading-relaxed"><strong>Dados de navegação:</strong> Cookies e endereço IP coletados de forma automatizada para análise de performance e segurança do site.</span>
                    </li>
                  </ul>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    2. Consentimento e Bases Legais
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    É a partir do seu consentimento ou de outras bases legais previstas na Lei Geral de Proteção de Dados (LGPD) que tratamos os seus dados pessoais.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    3. Direitos dos Titulares de Dados
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    A Infodive IT assegura a seus usuários seus direitos de titular previstos no artigo 18 da Lei Geral de Proteção de Dados.
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
