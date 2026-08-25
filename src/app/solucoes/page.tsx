import type { Metadata } from "next";
import { SolutionsListing } from "./solutions-listing";
import { Footer } from "@/layout/footer";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Nossas Soluções de TI de Missão Crítica",
  description:
    "Explore nossas soluções corporativas sob medida: infraestrutura híbrida, storages flash, cibersegurança ativa, backup imutável, observabilidade, cloud e inteligência artificial.",
  alternates: {
    canonical: "https://infodive.com.br/solucoes",
  },
  keywords: [
    "Infraestrutura de TI",
    "Armazenamento de Dados",
    "Backup Imutável",
    "Cibersegurança Corporativa",
    "Nuvem Híbrida",
    "Observabilidade",
    "Inteligência Artificial",
    "Infodive",
  ],
  openGraph: {
    title: "Nossas Soluções de TI de Missão Crítica | Infodive IT",
    description: "Explore nossas soluções corporativas sob medida: infraestrutura híbrida, storages flash, cibersegurança ativa, backup imutável, observabilidade, cloud e inteligência artificial.",
    url: "https://infodive.com.br/solucoes",
    type: "website",
  },
};

import { api } from "@/lib/api";
import { categoriaToSolution } from "@/lib/converters";

export const revalidate = 600; // 10 minutes ISR cache

export default async function SolutionsPage() {
  const [ctaRes, catsRes, solucoesRes] = await Promise.allSettled([
    api.cta("solucoes"),
    api.categorias(),
    api.solucoes(),
  ]);

  const initialCta =
    ctaRes.status === "fulfilled" && ctaRes.value
      ? {
          titulo: ctaRes.value.titulo,
          subtitulo: ctaRes.value.subtitulo,
          ctaTexto: ctaRes.value.ctaTexto,
          tipoAcao: ctaRes.value.tipoAcao,
        }
      : undefined;

  let initialCategoryList = undefined;
  let initialCategories = undefined;
  if (catsRes.status === "fulfilled" && catsRes.value?.length > 0) {
    const activeCats = catsRes.value
      .filter((c) => c.ativo)
      .sort((a, b) => a.ordem - b.ordem);
    initialCategoryList = activeCats;
    initialCategories = ["Todas", ...activeCats.map((c) => c.nome)];
  }

  const initialSolutions =
    solucoesRes.status === "fulfilled" && solucoesRes.value?.length > 0
      ? [...solucoesRes.value]
          .sort((a, b) => a.ordem - b.ordem)
          .map((cat) => categoriaToSolution(cat))
      : undefined;

  return (
    <>
      <main id="main-content">
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#0E66FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <SolutionsListing
            initialSolutions={initialSolutions}
            initialCategories={initialCategories}
            initialCategoryList={initialCategoryList}
            initialCta={initialCta}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
