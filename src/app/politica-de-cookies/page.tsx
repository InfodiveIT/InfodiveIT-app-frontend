import type { Metadata } from "next";
import { Footer } from "@/layout/footer";
import { Reveal } from "@/components/animations/reveal";
import { api } from "@/lib/api";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

export const metadata: Metadata = {
  title: "Política de Cookies | Infodive IT",
  description: "Política de cookies, preferências de navegação e LGPD da Infodive IT.",
  alternates: {
    canonical: "https://infodive.com.br/politica-de-cookies",
  },
  openGraph: {
    title: "Política de Cookies | Infodive IT",
    description: "Política de cookies, preferências de navegação e LGPD da Infodive IT.",
    url: "https://infodive.com.br/politica-de-cookies",
    type: "website",
  },
};

export default async function PoliticaDeCookiesPage() {
  let politicaData = null;
  try {
    politicaData = await api.politica("politica-de-cookies");
  } catch {
    politicaData = null;
  }

  const titulo = politicaData?.titulo || "Política de Cookies";
  const subtitulo = politicaData?.subtitulo || "Privacidade & Preferências de Navegação";
  const ultimaAtualizacao = politicaData?.ultimaAtualizacao || "28 de Julho de 2026";

  return (
    <>
      <main id="main-content" className="relative z-20 min-h-screen bg-white text-ink-900 pt-28 md:pt-36 pb-20">
        <div className="container-default">
          <div className="mx-auto max-w-3xl">
            {/* Eyebrow */}
            <Reveal>
              <nav className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                {subtitulo}
              </nav>
            </Reveal>

            {/* Title */}
            <Reveal delay={0.06}>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl md:text-5xl">
                {titulo}
              </h1>
              {/* Linha azul de detalhe */}
              <div className="mt-5 h-1.5 w-16 rounded-full bg-brand" />
            </Reveal>

            {/* Dynamic / Fallback Content */}
            <Reveal delay={0.12} className="mt-12">
              {politicaData?.conteudo ? (
                <MarkdownRenderer content={politicaData.conteudo} />
              ) : (
                <div className="max-w-none text-[16px] md:text-[17px] leading-relaxed text-ink-900">
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    A <strong>Infodive IT</strong> utiliza cookies e tecnologias semelhantes para aprimorar a sua experiência de navegação, analisar o desempenho de nossas páginas, personalizar conteúdos e garantir a segurança das sessões e dados trafegados no nosso portal.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    1. O que são Cookies?
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Cookies são pequenos arquivos de texto baixados e salvos no seu computador, smartphone ou dispositivo móvel ao acessar determinado website. Eles ajudam a reconhecer o dispositivo em acessos futuros, lembrando de suas preferências e configurações de navegação.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    2. Como usamos os Cookies?
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Utilizamos cookies por diversos motivos detalhados abaixo. Infelizmente, na maioria dos casos, não existem opções padrão do setor para desativar os cookies sem desativar completamente a funcionalidade e os recursos que eles adicionam a este site.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    3. Tipos de Cookies que utilizamos
                  </h2>
                  <ul className="mt-6 space-y-4">
                    <li className="flex gap-3 text-ink-900">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
                      <span className="leading-relaxed">
                        <strong>Cookies Essenciais (Estritamente Necessários):</strong> Fundamentais para a navegação segura no portal, controle de rotas protegidas e estabilidade de conexão.
                      </span>
                    </li>
                    <li className="flex gap-3 text-ink-900">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
                      <span className="leading-relaxed">
                        <strong>Cookies de Performance e Análise:</strong> Coletam métricas anônimas de tráfego, tempo de permanência e erros em páginas para otimizar nossa infraestrutura.
                      </span>
                    </li>
                    <li className="flex gap-3 text-ink-900">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
                      <span className="leading-relaxed">
                        <strong>Cookies de Funcionalidade:</strong> Permitem que o site lembre escolhas feitas pelo usuário (como idioma ou dados pré-preenchidos de formulários).
                      </span>
                    </li>
                  </ul>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    4. Gerenciamento e Desativação de Cookies
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Você pode impedir a configuração de cookies ajustando as configurações do seu navegador (consulte a Ajuda do seu navegador para saber como fazer isso). Esteja ciente de que a desativação de cookies afetará a funcionalidade deste e de muitos outros sites que você visita.
                  </p>

                  <h2 className="mt-12 text-2xl font-semibold tracking-tight text-ink-950">
                    5. Legislação e Dúvidas (LGPD)
                  </h2>
                  <p className="mt-6 text-pretty leading-relaxed text-ink-900">
                    Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você possui o direito de solicitar informações sobre o tratamento de seus dados a qualquer momento pelo nosso canal de atendimento de privacidade.
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
