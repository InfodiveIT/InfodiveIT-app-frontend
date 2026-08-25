/**
 * Cliente HTTP para a API REST do Backend (Spring Boot).
 *
 * Use `fetchAPI<T>(path)` para chamadas customizadas, ou os helpers em `api.*`
 * para as rotas do projeto. Por padrão, as consultas utilizam ISR com revalidação
 * de 60 segundos, permitindo respostas rápidas e cache integrado do Next.js.
 */

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

function getApiUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_URL_INTERNAL || PUBLIC_API_URL
  }

  return PUBLIC_API_URL
}

/**
 * Normaliza qualquer formato de URL de imagem recebido do backend/admin.
 * Trata strings puras, JSON de objetos {src:...} ou objetos brutos.
 */
export function normalizeImageUrl(rawUrl: any): string {
  if (!rawUrl) return ''
  if (typeof rawUrl === 'string') {
    if (rawUrl === '[object Object]') return ''
    if (rawUrl.startsWith('{') && rawUrl.includes('"src"')) {
      try {
        const parsed = JSON.parse(rawUrl)
        return parsed.src || ''
      } catch {}
    }
    return rawUrl
  }
  if (typeof rawUrl === 'object' && rawUrl !== null && (rawUrl as any).src) {
    return (rawUrl as any).src
  }
  return ''
}

/**
 * Estrutura de paginação padrão retornada pelo Spring Data Page.
 */
export type SpringPageResponse<T> = {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// ─── DTOs de conteúdo dinâmico ────────────────────────────────────────────────

export type CategoriaDTO = {
  id: string
  nome: string
  slug: string
  ordem: number
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export type SolucaoDTO = {
  id: string
  nome: string
  slug: string
  icone?: string
  subtituloCurto?: string
  descricaoCurta?: string
  recursoChave1?: string
  recursoChave2?: string
  recursoChave3?: string
  recursosChave?: string[]
  descricaoCompleta?: string
  features?: { titulo: string; descricao: string; tag?: string }[]
  imagemUrl?: string
  fabricantesTitulo?: string
  fabricantesDescricao?: string
  fabricantes?: { id: string; nome: string; slug: string; logoUrl?: string }[]
  ordem: number
  ativo: boolean
  categoriaId?: string
  categoriaNome?: string
  createdAt: string
  updatedAt: string
}

export type FabricanteDTO = {
  id: string
  nome: string
  slug: string
  descricao?: string
  descricaoCurta?: string
  logoUrl?: string
  siteOficial?: string
  destaque: boolean
  ordem: number
  ativo: boolean
  categoriaIds: string[]
  createdAt: string
  updatedAt: string
}

export type ServicoDTO = {
  id: string
  nome: string
  slug: string
  descricao?: string
  icone?: string
  ordem: number
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export type ProdutoResumoDTO = {
  id: string
  nome: string
  slug: string
  subcategoria?: string
  descricaoCurta?: string
  imagemUrl?: string
  destaque: boolean
  novidade?: boolean
  categoriaId?: string
  categoriaSlug: string
  categoriaTitle?: string
  solucaoId?: string
  solucaoSlug?: string
  solucaoTitle?: string
  fabricanteId?: string
  fabricanteSlug: string
  fabricanteNome?: string
  fabricanteLogoUrl?: string
}

export type ProdutoDTO = {
  id: string
  nome: string
  slug: string
  subcategoria?: string
  descricaoCurta?: string
  descricaoCompleta?: string
  casosDeUso?: { titulo: string; descricao: string }[]
  diferenciais?: { titulo: string; descricao: string }[]
  servicosEyebrow?: string
  servicosTitulo?: string
  servicosDescricao?: string
  imagemUrl?: string
  linkOficial?: string
  destaque: boolean
  novidade?: boolean
  ativo: boolean
  categoriaId: string
  categoriaSlug: string
  categoriaNome?: string
  solucaoId?: string
  solucaoSlug?: string
  solucaoNome?: string
  fabricanteId: string
  fabricanteSlug: string
  fabricanteNome?: string
  fabricanteLogoUrl?: string
  servicos?: { id: string; nome: string; slug: string; icone?: string }[]
  createdAt: string
  updatedAt: string
}

export type ConteudoDTO = {
  id: string
  titulo: string
  slug: string
  tipo: 'ARTIGO' | 'WHITEPAPER' | 'CASE' | 'DATASHEET' | 'VIDEO'
  origem?: string
  descricao?: string
  imagemUrl?: string
  autor?: string
  tempoLeitura?: string
  conteudo?: string
  urlExterna?: string
  publicadoEm?: string
  ativo: boolean
  destaque: boolean
  categoriaId?: string
  fabricanteId?: string
  produtoId?: string
  createdAt: string
  updatedAt: string
}

export type CaseDTO = {
  id: string
  segmento: string
  cliente: string
  titulo: string
  desafio: string
  resultado: string
  metrica: string
  autor: string
  cargo: string
  depoimento: string
  imagemUrl?: string
  ordem: number
}

export type ClienteHomeDTO = {
  id: string
  nome: string
  segmento: string
  descricaoCurta: string
  logoUrl: string
  ordem: number
}

// ─── DTOs de configuração de página ──────────────────────────────────────────

export type PaginaHeroDTO = {
  pagina: string
  eyebrow?: string
  headline?: string
  headlineDestaque?: string
  subtitulo?: string
  tagline?: string
}

export type CtaDTO = {
  pagina: string
  titulo?: string
  subtitulo?: string
  ctaTexto?: string
  tipoAcao?: string
}

export type ConfigFooterDTO = {
  descricaoEmpresa?: string
  badgeNoc?: string
  badgeCloud?: string
  nomeLegal?: string
  urlLinkedin?: string
  urlInstagram?: string
  urlFacebook?: string
}

export type ConfigBlogDTO = {
  artigosEyebrow?: string
  artigosHeadline?: string
  socialEyebrow?: string
  socialHeadline?: string
  socialDescricao?: string
  urlInstagram?: string
  urlLinkedin?: string
}

export type SocialPostDTO = {
  id: string
  rede: 'INSTAGRAM' | 'LINKEDIN'
  externalId: string
  textoLegenda?: string
  imagemUrl?: string
  permalinkUrl?: string
  likesCount?: number
  commentsCount?: number
  publicadoEm?: string
  ativo: boolean
}

export type ContatoInfoDTO = {
  eyebrow?: string
  headline?: string
  headlineDestaque?: string
  subtitulo?: string
  email?: string
  telefone?: string
  endereco?: string
  horarioComercial?: string
  horarioNoc?: string
  cardTitulo?: string
  cardDescricao?: string
  cardBullets?: string[]
  cardCtaTexto?: string
  cardStatus?: string
}

export type FaqDTO = {
  id: string
  pergunta: string
  resposta: string
  ordem: number
}

export type PoliticaDTO = {
  id: string
  slug: string
  titulo: string
  subtitulo?: string
  conteudo: string
  ultimaAtualizacao?: string
  ativo: boolean
  createdAt?: string
  updatedAt?: string
}

export type SecaoHomeDTO = {
  secao: string
  eyebrow?: string
  headline?: string
  headlineDestaque?: string
  subtitulo?: string
  boxTitulo?: string
  boxDescricao?: string
}

// ─── DTOs de seções da Home ───────────────────────────────────────────────────

export type HeroCarouselDTO = {
  id: string
  imagemUrl: string
  ordem: number
}

export type HomeSolucoesBentoDTO = {
  id: string
  nome: string
  descricao?: string
  icone?: string
  imagemIaUrl?: string
  textoCarrossel?: string
  ordem: number
  solucaoId?: string
  solucaoSlug?: string
  solucaoTitulo?: string
}

export type HomeSegurancaMarqueeDTO = {
  id: string
  icone?: string
  titulo: string
  corpo: string
  ordem: number
}

export type HomeProblemasDTO = {
  id: string
  titulo: string
  descricao: string
  solucaoIndicada?: string
  href?: string
  ordem: number
}

export type HomeTrustStatsDTO = {
  id: string
  eyebrow?: string
  prefixo?: string
  valor: number
  valorInicial: number
  sufixo?: string
  titulo: string
  descricao?: string
  ordem: number
}

// ─── DTOs de seções de Serviços ───────────────────────────────────────────────

export type EtapaItem = {
  titulo: string
  descricao: string
  icone?: string
  ordem: number
}

export type MetricaItem = {
  prefixo?: string
  valor: number
  sufixo?: string
  label: string
}

export type PilarItem = {
  icone?: string
  titulo: string
  descricao: string
}

export type ServicosEtapasDTO = {
  eyebrow?: string
  headline?: string
  subtitulo?: string
  etapas: EtapaItem[]
}

export type ServicosMetodologiaDTO = {
  eyebrow?: string
  headline?: string
  paragrafo?: string
  metricas: MetricaItem[]
  pilares: PilarItem[]
}

// ─── DTOs de seções Sobre ─────────────────────────────────────────────────────

export type StatItem = {
  prefixo?: string
  valor: number
  valorInicial: number
  sufixo?: string
  label: string
  coluna?: string
}

export type MarcoItem = {
  ano: string
  titulo: string
  descricao: string
  destaque: boolean
  ordem: number
}

export type ValorItem = {
  icone?: string
  titulo: string
  descricao: string
}

export type FotoItem = {
  imagemUrl: string
  alt?: string
  ordem: number
}

export type SobreNumerosDTO = {
  textoDescritivo?: string
  stats: StatItem[]
}

export type SobreTimelineDTO = {
  eyebrow?: string
  headline?: string
  marcos: MarcoItem[]
}

export type SobreValoresDTO = {
  eyebrow?: string
  headline?: string
  paragrafo?: string
  valores: ValorItem[]
}

export type SobreCulturaDTO = {
  eyebrow?: string
  headline?: string
  paragrafo?: string
  fotos: FotoItem[]
}

// ─── Infraestrutura HTTP ──────────────────────────────────────────────────────

type FetchOptions = Omit<RequestInit, 'next'> & {
  /** Tempo de revalidação em segundos. Default 600s (10 min). */
  revalidate?: number | false
  /** Tags para revalidação on-demand via revalidateTag(). */
  tags?: string[]
  /** Força leitura sem cache em conteúdo que precisa refletir revogação imediata. */
  noStore?: boolean
}

export async function fetchAPI<T>(
  path: string,
  { revalidate = 600, tags, noStore = false, ...init }: FetchOptions = {},
): Promise<T> {
  const apiUrl = getApiUrl()

  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured.')
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = `${apiUrl}${cleanPath}`

  // Apenas envia Content-Type quando houver corpo (POST/PUT/PATCH) ou se explicitamente configurado,
  // evitando preflight CORS (OPTIONS) desnecessário em requisições GET/HEAD simples.
  const headers = new Headers(init.headers)
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, {
    ...init,
    headers,
    ...(noStore
      ? { cache: 'no-store' as const }
      : { next: { revalidate, tags } }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API ${res.status} ${res.statusText} on ${path}: ${body}`)
  }

  return res.json() as Promise<T>
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return ''
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  ) as [string, string | number | boolean][]
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString()
}

// ─── Métodos da API ───────────────────────────────────────────────────────────

export const api = {
  // Conteúdo dinâmico (com tags ISR para revalidação on-demand)
  categorias: () =>
    fetchAPI<CategoriaDTO[]>('/categorias', { tags: ['categorias'], revalidate: 600 }),

  categoria: (slug: string) =>
    fetchAPI<CategoriaDTO>(`/categorias/${encodeURIComponent(slug)}`, { tags: ['categorias'], revalidate: 600 }),

  solucoes: () =>
    fetchAPI<SolucaoDTO[]>('/solucoes', { tags: ['solucoes'], revalidate: 600 }),

  solucao: (slug: string) =>
    fetchAPI<SolucaoDTO>(`/solucoes/${encodeURIComponent(slug)}`, { tags: ['solucoes'], revalidate: 600 }),

  produtos: (params?: { categoria?: string; fabricante?: string; destaque?: boolean; novidade?: boolean; page?: number; size?: number }) =>
    fetchAPI<SpringPageResponse<ProdutoResumoDTO>>(`/produtos${buildQuery(params)}`, { tags: ['produtos'], revalidate: 300 }),

  produtoNovidade: () =>
    fetchAPI<ProdutoResumoDTO | null>('/produtos/novidade', { tags: ['produtos'], revalidate: 300 }).catch(() => null),

  produto: (slug: string) =>
    fetchAPI<ProdutoDTO>(`/produtos/${encodeURIComponent(slug)}`, { tags: ['produtos'], revalidate: 300 }),

  fabricantes: (params?: { destaque?: boolean }) =>
    fetchAPI<FabricanteDTO[]>(`/fabricantes${buildQuery(params)}`, { tags: ['fabricantes'], revalidate: 600 }),

  fabricante: (slug: string) =>
    fetchAPI<FabricanteDTO>(`/fabricantes/${encodeURIComponent(slug)}`, { tags: ['fabricantes'], revalidate: 600 }),

  servicos: () =>
    fetchAPI<ServicoDTO[]>('/servicos', { tags: ['servicos'], revalidate: 600 }),

  servico: (slug: string) =>
    fetchAPI<ServicoDTO>(`/servicos/${encodeURIComponent(slug)}`, { tags: ['servicos'], revalidate: 600 }),

  conteudos: (params?: { tipo?: ConteudoDTO['tipo']; origem?: ConteudoDTO['origem']; destaque?: boolean; page?: number; size?: number }) =>
    fetchAPI<SpringPageResponse<ConteudoDTO>>(`/conteudos${buildQuery(params)}`, { tags: ['conteudos'], revalidate: 300 }),

  conteudo: (slug: string) =>
    fetchAPI<ConteudoDTO>(`/conteudos/${encodeURIComponent(slug)}`, { tags: ['conteudos'], revalidate: 300 }),

  cases: () =>
    fetchAPI<CaseDTO[]>('/cases', { tags: ['cases'], revalidate: 600 }),

  homeClientes: (signal?: AbortSignal) =>
    fetchAPI<ClienteHomeDTO[]>('/home-clientes', {
      tags: ['home-clientes'],
      revalidate: 600,
      signal,
    }),

  faq: () =>
    fetchAPI<FaqDTO[]>('/faq', { tags: ['faq'], revalidate: 900 }),

  // Configuração de página
  paginaHero: (pagina: string) =>
    fetchAPI<PaginaHeroDTO>(`/paginas-hero/${encodeURIComponent(pagina)}`, { tags: ['pagina-hero'], revalidate: 600 }),

  cta: (pagina: string) =>
    fetchAPI<CtaDTO>(`/ctas/${encodeURIComponent(pagina)}`, { tags: ['ctas'], revalidate: 600 }),

  configFooter: () =>
    fetchAPI<ConfigFooterDTO>('/config-footer', { tags: ['config-footer'], revalidate: 900 }),

  configBlog: () =>
    fetchAPI<ConfigBlogDTO>('/config-blog', { tags: ['config-blog'], revalidate: 600 }),

  socialPosts: (rede?: 'INSTAGRAM' | 'LINKEDIN') =>
    fetchAPI<SocialPostDTO[]>(`/social-posts${buildQuery({ rede })}`, { tags: ['social-posts'], revalidate: 600 }),

  contatoInfo: () =>
    fetchAPI<ContatoInfoDTO>('/contato-info', { tags: ['contato-info'], revalidate: 900 }),

  politicas: () =>
    fetchAPI<PoliticaDTO[]>('/politicas', { tags: ['politicas'], revalidate: 3600 }),

  politica: (slug: string) =>
    fetchAPI<PoliticaDTO>(`/politicas/${encodeURIComponent(slug)}`, { tags: ['politica'], revalidate: 3600 }),

  secaoHome: (secao: string, signal?: AbortSignal, noStore = false) =>
    fetchAPI<SecaoHomeDTO>(`/secoes-home/${encodeURIComponent(secao)}`, {
      tags: ['secoes-home'],
      revalidate: 600,
      signal,
      noStore,
    }),

  // Seções da Home
  heroCarousel: () =>
    fetchAPI<HeroCarouselDTO[]>('/hero-carousel', { tags: ['home-hero'], revalidate: 600 }),

  homeSolucoesBento: () =>
    fetchAPI<HomeSolucoesBentoDTO[]>('/home-solucoes-bento', { tags: ['home-bento'], revalidate: 600 }),

  homeSegurancaMarquee: () =>
    fetchAPI<HomeSegurancaMarqueeDTO[]>('/home-seguranca-marquee', { tags: ['home-marquee'], revalidate: 600 }),

  homeProblemas: () =>
    fetchAPI<HomeProblemasDTO[]>('/home-problemas', { tags: ['home-problemas'], revalidate: 600 }),

  homeTrustStats: () =>
    fetchAPI<HomeTrustStatsDTO[]>('/home-trust-stats', { tags: ['home-trust'], revalidate: 600 }),

  // Seções de Serviços
  servicosEtapas: () =>
    fetchAPI<ServicosEtapasDTO>('/servicos-etapas', { tags: ['servicos-etapas'], revalidate: 600 }),

  servicosMetodologia: () =>
    fetchAPI<ServicosMetodologiaDTO>('/servicos-metodologia', { tags: ['servicos-metodologia'], revalidate: 600 }),

  // Seções Sobre
  sobreNumeros: () =>
    fetchAPI<SobreNumerosDTO>('/sobre-numeros', { tags: ['sobre-numeros'], revalidate: 600 }),

  sobreTimeline: () =>
    fetchAPI<SobreTimelineDTO>('/sobre-timeline', { tags: ['sobre-timeline'], revalidate: 600 }),

  sobreValores: () =>
    fetchAPI<SobreValoresDTO>('/sobre-valores', { tags: ['sobre-valores'], revalidate: 600 }),

  sobreCultura: () =>
    fetchAPI<SobreCulturaDTO>('/sobre-cultura', { tags: ['sobre-cultura'], revalidate: 600 }),

  // Leads (sem cache — sempre fresco)
  enviarLead: (data: {
    nomeCompleto: string
    email: string
    telefone?: string
    empresa: string
    cargo?: string
    mensagem?: string
    consentimentoLgpd: boolean
    produtoInteresseId?: string
  }) =>
    fetchAPI<{ id: string; message: string }>('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
      noStore: true,
    }),
}
