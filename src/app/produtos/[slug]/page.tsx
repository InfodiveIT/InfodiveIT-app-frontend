import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { Product } from "@/lib/products-data"
import { ProductDetailContent } from "./product-detail-client"
import { Footer } from "@/layout/footer"
import { api, normalizeImageUrl } from "@/lib/api"
import { VENDOR_LOGOS } from "@/lib/vendor-logos"
import {
  Activity,
  Cloud,
  Cog,
  HeadphonesIcon,
  LifeBuoy,
  RefreshCcw,
  ServerCog,
  ShieldCheck,
  Wrench,
} from "lucide-react"

const SERVICE_ICONS: Record<string, any> = {
  implementacao: Wrench,
  sustentacao: HeadphonesIcon,
  conformidade: ShieldCheck,
  migracao: RefreshCcw,
  monitoramento: Activity,
  cloud: Cloud,
  default: Cog,
}

function getIconName(icon: any): string {
  if (typeof icon === 'string') return icon;
  if (icon === Wrench) return 'wrench';
  if (icon === HeadphonesIcon) return 'headphones';
  if (icon === ShieldCheck) return 'shield-check';
  if (icon === LifeBuoy) return 'life-buoy';
  if (icon === ServerCog) return 'server-cog';
  if (icon === Activity) return 'activity';
  if (icon === Cog) return 'cog';
  if (icon === RefreshCcw) return 'refresh-ccw';
  if (icon === Cloud) return 'cloud';
  return 'default';
}

const getProduct = cache(async (slug: string): Promise<Product | null> => {
  try {
    const dto = await api.produto(slug)
    if (!dto || !dto.ativo) return null

    const [categorias] = await Promise.all([
      api.categorias().catch(() => []),
    ])

    const catObj = categorias.find((c) => c.id === dto.categoriaId)

    let diferenciais: { title: string; description: string }[] = []
    if (dto.diferenciais && dto.diferenciais.length > 0) {
      diferenciais = dto.diferenciais.map(d => ({ title: d.titulo, description: d.descricao }))
    }

    let casosDeUso: { title: string; description: string }[] = []
    if (dto.casosDeUso && dto.casosDeUso.length > 0) {
      casosDeUso = dto.casosDeUso.map(c => ({ title: c.titulo, description: c.descricao }))
    }

    let servicos: { nome: string; icon: string }[] = []
    if (dto.servicos && dto.servicos.length > 0) {
      servicos = dto.servicos.map(s => ({
        nome: s.nome,
        icon: s.icone || s.slug || 'default',
      }))
    }

    return {
      slug: dto.slug,
      nome: dto.nome,
      fabricante: dto.fabricanteNome || dto.fabricanteSlug || '',
      fabricanteSlug: dto.fabricanteSlug || '',
      logo: normalizeImageUrl(dto.fabricanteLogoUrl) || VENDOR_LOGOS[dto.fabricanteNome || ''] || '',
      logoClass: 'h-5',
      categoria: dto.categoriaNome || catObj?.nome || dto.categoriaSlug || '',
      categoriaSlug: dto.categoriaSlug || catObj?.slug || '',
      solucaoSlug: dto.solucaoSlug || '',
      solucaoTitle: dto.solucaoNome || '',
      subcategoria: dto.subcategoria || '',
      descricaoCurta: dto.descricaoCurta || '',
      descricaoCompleta: dto.descricaoCompleta || '',
      imageUrl: normalizeImageUrl(dto.imagemUrl),
      linkOficial: dto.linkOficial || '',
      servicosEyebrow: dto.servicosEyebrow || '',
      servicosTitulo: dto.servicosTitulo || '',
      servicosDescricao: dto.servicosDescricao || '',
      destaque: dto.destaque ?? false,
      diferenciais,
      casosDeUso,
      servicos,
    }
  } catch {
    return null
  }
})

interface PageProps {
  params: {
    slug: string
  }
}

export const dynamicParams = true
export const revalidate = 300 // 5 minutes ISR cache

export async function generateStaticParams() {
  try {
    const page = await api.produtos({ size: 100 })
    if (page && page.content) {
      return page.content.map((p) => ({ slug: p.slug }))
    }
  } catch {}
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return { title: "Produto não encontrado | Infodive" }
  }

  const seoTitle = `${product.nome} — ${product.fabricante} | Infodive IT`
  const seoDesc = product.descricaoCurta

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: `https://infodive.com.br/produtos/${params.slug}`,
    },
    keywords: [
      product.nome,
      product.fabricante,
      product.categoria,
      product.subcategoria,
      'Produtos de TI',
      'Infodive',
    ],
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: `https://infodive.com.br/produtos/${params.slug}`,
      type: "website",
      siteName: "Infodive IT",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
    },
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  let relatedProducts: Product[] = []
  if (product.categoriaSlug) {
    try {
      const pageRel = await api.produtos({ categoria: product.categoriaSlug, size: 6 })
      if (pageRel && pageRel.content && pageRel.content.length > 0) {
        relatedProducts = pageRel.content
          .filter((p) => p.slug !== product.slug)
          .slice(0, 4)
          .map((p) => ({
            slug: p.slug,
            nome: p.nome,
            fabricante: p.fabricanteNome || p.fabricanteSlug,
            fabricanteSlug: p.fabricanteSlug,
            logo: p.fabricanteLogoUrl || VENDOR_LOGOS[p.fabricanteNome || ''] || '',
            logoClass: 'h-5',
            categoria: p.categoriaTitle || p.categoriaSlug,
            categoriaSlug: p.categoriaSlug,
            solucaoSlug: p.solucaoSlug,
            solucaoTitle: p.solucaoTitle,
            subcategoria: p.subcategoria || '',
            descricaoCurta: p.descricaoCurta || '',
            descricaoCompleta: '',
            destaque: p.destaque,
            diferenciais: [],
            casosDeUso: [],
            servicos: [],
          }))
      }
    } catch {}
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nome,
    description: product.descricaoCurta,
    brand: {
      '@type': 'Brand',
      name: product.fabricante,
    },
    category: product.categoria,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      offerCount: '1',
      seller: {
        '@type': 'Organization',
        name: 'Infodive IT',
        url: 'https://infodive.com.br',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <main id="main-content">
        <ProductDetailContent product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </>
  )
}
