import type { Metadata } from "next"
import { ProductsListing } from "./products-listing"
import { Footer } from "@/layout/footer"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Catálogo de Produtos de TI Corporativa",
  description:
    "Explore o catálogo Infodive com os principais fabricantes do mundo — infraestrutura, armazenamento, proteção de dados, segurança, cloud e virtualização.",
  alternates: {
    canonical: "https://infodive.com.br/produtos",
  },
  keywords: [
    "Catálogo de TI",
    "IBM",
    "Veeam",
    "Dell",
    "Acronis",
    "Red Hat",
    "Microsoft",
    "Infraestrutura",
    "Cibersegurança",
    "Cloud",
    "Infodive",
  ],
  openGraph: {
    title: "Catálogo de Produtos de TI Corporativa | Infodive IT",
    description: "Explore o catálogo Infodive com os principais fabricantes do mundo — infraestrutura, armazenamento, proteção de dados, segurança, cloud e virtualização.",
    url: "https://infodive.com.br/produtos",
    type: "website",
  },
}

import { api } from "@/lib/api"
import { dtoToProduct } from "@/lib/converters"

export const revalidate = 300 // 5 minutes ISR cache

export default async function ProductsPage() {
  const [ctaRes, produtosRes, fabricantesRes, categoriasRes] =
    await Promise.allSettled([
      api.cta("produtos"),
      api.produtos({ size: 100 }),
      api.fabricantes(),
      api.categorias(),
    ])

  const initialCta =
    ctaRes.status === "fulfilled" && ctaRes.value
      ? {
          titulo: ctaRes.value.titulo,
          subtitulo: ctaRes.value.subtitulo,
          ctaTexto: ctaRes.value.ctaTexto,
          tipoAcao: ctaRes.value.tipoAcao,
        }
      : undefined

  const initialProducts =
    produtosRes.status === "fulfilled" && produtosRes.value?.content
      ? produtosRes.value.content.map(dtoToProduct)
      : undefined

  const initialFabricantes =
    fabricantesRes.status === "fulfilled" && fabricantesRes.value?.length > 0
      ? fabricantesRes.value.map((f) => f.nome)
      : undefined

  const totalProdutos =
    produtosRes.status === "fulfilled"
      ? produtosRes.value?.totalElements ?? produtosRes.value?.content?.length ?? 0
      : initialProducts?.length ?? 0

  const totalFabricantes =
    fabricantesRes.status === "fulfilled"
      ? fabricantesRes.value?.length ?? 0
      : initialFabricantes?.length ?? 0

  const totalCategorias =
    categoriasRes.status === "fulfilled" && categoriasRes.value
      ? categoriasRes.value.filter((c) => c.ativo).length
      : 0

  const initialStats = {
    produtos: totalProdutos,
    fabricantes: totalFabricantes,
    categorias: totalCategorias,
  }

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
          <ProductsListing
            initialProducts={initialProducts}
            initialFabricantes={initialFabricantes}
            initialStats={initialStats}
            initialCta={initialCta}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
