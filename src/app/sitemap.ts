import { MetadataRoute } from 'next'
import { api } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://infodive.com.br'

  // 1. Static pages
  const staticRoutes = [
    '',
    '/sobre',
    '/servicos',
    '/solucoes',
    '/produtos',
    '/blog',
    '/termos-de-uso',
    '/politica-de-privacidade',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  let solutionRoutes: MetadataRoute.Sitemap = []
  let productRoutes: MetadataRoute.Sitemap = []
  let articleRoutes: MetadataRoute.Sitemap = []

  try {
    const [solucoes, produtosPage, conteudosPage] = await Promise.all([
      api.solucoes().catch(() => []),
      api.produtos({ size: 100 }).catch(() => null),
      api.conteudos({ size: 100 }).catch(() => null),
    ])

    if (solucoes && solucoes.length > 0) {
      solutionRoutes = solucoes.map((s) => ({
        url: `${baseUrl}/solucoes/${s.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }

    if (produtosPage && produtosPage.content && produtosPage.content.length > 0) {
      productRoutes = produtosPage.content.map((p) => ({
        url: `${baseUrl}/produtos/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }

    if (conteudosPage && conteudosPage.content && conteudosPage.content.length > 0) {
      articleRoutes = conteudosPage.content
        .map((a) => ({
          url: `${baseUrl}/blog/${a.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
    }
  } catch {}

  return [...staticRoutes, ...solutionRoutes, ...productRoutes, ...articleRoutes]
}
