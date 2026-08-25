import { type Solution } from "@/lib/solutions-data"
import {
  type SolucaoDTO,
  type ProdutoResumoDTO,
  type HomeTrustStatsDTO,
  type ConteudoDTO,
  normalizeImageUrl,
} from "@/lib/api"
import { VENDOR_LOGOS } from "@/lib/vendor-logos"
import type { Product } from "@/lib/products-data"
import ibmLogo from "@/assets/IBM Logo.svg"
import veeamLogo from "@/assets/Veeam Logo.svg"
import dellLogo from "@/assets/Dell Logo.svg"
import acronisLogo from "@/assets/Acronis Logo.svg"
import redhatPretoLogo from "@/assets/Red Hat Preto Logo.svg"
import microsoftLogo from "@/assets/Microsoft Logo.svg"
import peopleImg from "@/assets/blog/people.png"
import cloudImg from "@/assets/blog/cloud.png"
import presentationImg from "@/assets/blog/presentation.png"
import { type StaticImageData } from "next/image"

export function categoriaToSolution(cat: SolucaoDTO): Solution {
  return {
    slug: cat.slug,
    title: cat.nome || '',
    subtitle: cat.subtituloCurto || '',
    description: cat.descricaoCurta || '',
    overview: cat.descricaoCompleta || '',
    imageUrl: normalizeImageUrl(cat.imagemUrl),
    fabricantesTitulo: cat.fabricantesTitulo || '',
    fabricantesDescricao: cat.fabricantesDescricao || '',
    iconName: (cat.icone as any) || 'infraestrutura',
    metrics: [],
    features: cat.features
      ? cat.features.map(f => ({ title: f.titulo, description: f.descricao, tag: f.tag || '' }))
      : [],
    vendors: cat.fabricantes
      ? cat.fabricantes.map(f => f.nome)
      : [],
    vendorObjects: cat.fabricantes
      ? cat.fabricantes.map(f => ({ nome: f.nome, logoUrl: f.logoUrl }))
      : [],
    caseStudy: { client: '', segmento: '', metric: '', resultado: '' },
    categoriaId: cat.categoriaId,
    categoriaNome: cat.categoriaNome,
    recursosChave: (cat.recursosChave && cat.recursosChave.length > 0)
      ? cat.recursosChave
      : ([cat.recursoChave1, cat.recursoChave2, cat.recursoChave3].filter(Boolean) as string[]),
  }
}

const STATIC_LOGO_MAP: Record<string, StaticImageData> = {
  ibm: ibmLogo,
  veeam: veeamLogo,
  dell: dellLogo,
  acronis: acronisLogo,
  "red-hat": redhatPretoLogo,
  microsoft: microsoftLogo,
}

export type FeaturedProduct = {
  nome: string
  slug: string
  fabricanteNome: string
  logoUrl: string | StaticImageData
  categoria: string
  descricao: string
}

export function toFeaturedProduct(dto: ProdutoResumoDTO): FeaturedProduct {
  const logoUrl =
    dto.fabricanteLogoUrl ||
    STATIC_LOGO_MAP[dto.fabricanteSlug] ||
    ibmLogo

  return {
    nome: dto.nome,
    slug: dto.slug,
    fabricanteNome: dto.fabricanteNome || dto.fabricanteSlug,
    logoUrl,
    categoria: dto.categoriaTitle || dto.categoriaSlug,
    descricao: dto.descricaoCurta || "",
  }
}

export function dtoToProduct(dto: ProdutoResumoDTO): Product {
  return {
    slug: dto.slug,
    nome: dto.nome,
    fabricante: dto.fabricanteNome || dto.fabricanteSlug || '',
    fabricanteSlug: dto.fabricanteSlug || '',
    logo: normalizeImageUrl(dto.fabricanteLogoUrl) || VENDOR_LOGOS[dto.fabricanteNome || ''] || '',
    logoClass: 'h-5',
    categoria: dto.categoriaTitle || dto.categoriaSlug || '',
    categoriaSlug: dto.categoriaSlug || '',
    subcategoria: dto.subcategoria || '',
    descricaoCurta: dto.descricaoCurta || '',
    descricaoCompleta: '',
    destaque: dto.destaque,
    diferenciais: [],
    casosDeUso: [],
    servicos: [],
  }
}

export type Stat = {
  eyebrow: string
  prefix?: string
  prefixClass?: string
  suffix?: string
  suffixClass?: string
  value: number
  startValue: number
  title: string
  desc: string
}

export function trustDtoToStat(dto: HomeTrustStatsDTO): Stat {
  return {
    eyebrow: dto.eyebrow ?? "",
    prefix: dto.prefixo,
    prefixClass: dto.prefixo === "Desde"
      ? "text-2xl sm:text-3xl font-bold mr-2 text-ink-300"
      : "text-brand mr-1 font-bold",
    suffix: dto.sufixo,
    suffixClass: "text-brand ml-1 font-bold",
    value: dto.valor,
    startValue: dto.valorInicial,
    title: dto.titulo,
    desc: dto.descricao ?? "",
  }
}

export type ContentItem = {
  id: string
  titulo: string
  slug: string
  tipo: ConteudoDTO['tipo']
  descricao?: string
  publicadoEm?: string
  tempoLeitura: string
  categoria: string
  imagem: any
}

const defaultBlogImages = [peopleImg, cloudImg, presentationImg]
const defaultBlogCategories = ["IA", "NUVEM", "IA"]

export function dtoToBlogItem(item: ConteudoDTO, idx: number): ContentItem {
  return {
    id: item.id,
    titulo: item.titulo,
    slug: item.slug,
    tipo: item.tipo,
    descricao: item.descricao || "",
    publicadoEm: item.publicadoEm
      ? new Date(item.publicadoEm).toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "01 jun 2026",
    tempoLeitura: item.tempoLeitura || `${Math.max(3, Math.round((item.conteudo?.split(" ").length || 200) / 200))} min read`,
    categoria: defaultBlogCategories[idx % 3],
    imagem: (item as any).imagemCapaUrl || (item as any).imagemUrl || defaultBlogImages[idx % 3],
  }
}
