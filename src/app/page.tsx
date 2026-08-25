import type { Metadata } from 'next'
import { Suspense } from 'react'
import Cases from '@/sections/home/cases'
import Clients from '@/sections/home/clients'
import { Hero } from '@/sections/home/hero'
import { Products } from '@/sections/home/products'
import { Solutions } from '@/sections/home/solutions'
import { Problems } from '@/sections/home/problems'
import { TrustPoints } from '@/sections/home/trust-points'
import { Blog } from '@/sections/home/blog'
import { FAQ } from '@/sections/home/faq'
import { Contact } from '@/sections/home/contact'
import { Footer } from '@/layout/footer'

export const metadata: Metadata = {
  title: 'Infodive — Tecnologia de Missão Crítica para Empresas que Não Param',
  description:
    'Soluções integradas de infraestrutura de TI, cibersegurança avançada, computação em nuvem, proteção de dados e inteligência artificial corporativa.',
  alternates: {
    canonical: 'https://infodive.com.br',
  },
  keywords: [
    'Infraestrutura de TI',
    'Cibersegurança',
    'Cloud computing',
    'Proteção de dados',
    'Inteligência artificial',
    'Sustentação de TI 24/7',
    'NOC',
    'Virtualização',
    'Infodive',
    'Infodive IT',
  ],
  openGraph: {
    title: 'Infodive — Tecnologia de Missão Crítica para Empresas que Não Param',
    description: 'Soluções integradas de infraestrutura de TI, cibersegurança avançada, computação em nuvem, proteção de dados e inteligência artificial corporativa.',
    url: 'https://infodive.com.br',
    type: 'website',
  },
}

import { api } from '@/lib/api'
import {
  toFeaturedProduct,
  trustDtoToStat,
  dtoToBlogItem,
} from '@/lib/converters'

export const revalidate = 600 // Revalidate home every 10 minutes

export default async function HomePage() {
  const [
    heroDataRes,
    heroCarouselRes,
    fabricantesRes,
    solutionsSectionRes,
    bentoRes,
    productsRes,
    productsSectionRes,
    trustStatsRes,
    conteudosRes,
    faqRes,
    contatoRes,
    footerConfigRes,
    footerSolucoesRes,
    footerProdutosRes,
  ] = await Promise.allSettled([
    api.paginaHero('home'),
    api.heroCarousel(),
    api.fabricantes(),
    api.secaoHome('solucoes'),
    api.homeSolucoesBento(),
    api.produtos({ destaque: true, size: 6 }),
    api.secaoHome('produtos'),
    api.homeTrustStats(),
    api.conteudos({ size: 3, destaque: true }),
    api.faq(),
    api.contatoInfo(),
    api.configFooter(),
    api.solucoes(),
    api.produtos({ size: 4 }),
  ])

  const initialHeroData =
    heroDataRes.status === 'fulfilled' ? heroDataRes.value : undefined

  const initialSlides =
    heroCarouselRes.status === 'fulfilled' && heroCarouselRes.value?.length > 0
      ? [...heroCarouselRes.value]
          .sort((a, b) => a.ordem - b.ordem)
          .map((item) => ({
            src: item.imagemUrl,
            alt: `Dashboard Infodive ${item.ordem}`,
          }))
      : undefined

  const initialPartners =
    fabricantesRes.status === 'fulfilled' && fabricantesRes.value?.length > 0
      ? [...fabricantesRes.value]
          .sort((a, b) => a.ordem - b.ordem)
          .map((p) => ({
            name: p.nome,
            description: p.descricaoCurta || p.descricao || '',
            logo: p.logoUrl || '',
            className: 'h-4 sm:h-5',
            keepWhiteOnHover: true,
          }))
      : undefined

  const initialSolutionsInfo =
    solutionsSectionRes.status === 'fulfilled' && solutionsSectionRes.value
      ? {
          eyebrow: solutionsSectionRes.value.eyebrow || 'Soluções',
          headline:
            solutionsSectionRes.value.headline ||
            'Um portfólio completo para a sua operação crítica',
          headlineDestaque:
            solutionsSectionRes.value.headlineDestaque || 'portfólio completo',
          subtitulo: solutionsSectionRes.value.subtitulo || '',
        }
      : undefined

  const initialBentoData =
    bentoRes.status === 'fulfilled' && bentoRes.value?.length > 0
      ? bentoRes.value
      : undefined

  const initialProducts =
    productsRes.status === 'fulfilled' && productsRes.value?.content
      ? productsRes.value.content.map(toFeaturedProduct)
      : undefined

  const initialProductsSectionInfo =
    productsSectionRes.status === 'fulfilled' && productsSectionRes.value
      ? {
          eyebrow: productsSectionRes.value.eyebrow || 'Produtos',
          headline:
            productsSectionRes.value.headline || 'Produtos em destaque',
          subtitulo:
            productsSectionRes.value.subtitulo ||
            'Uma seleção do nosso catálogo dos principais fabricantes do mundo — prontos para resolver desafios reais de infraestrutura, segurança e cloud.',
          headlineDestaque: productsSectionRes.value.headlineDestaque || '',
        }
      : undefined

  const initialStats =
    trustStatsRes.status === 'fulfilled' && trustStatsRes.value?.length > 0
      ? trustStatsRes.value.map(trustDtoToStat)
      : undefined

  const initialBlogItems =
    conteudosRes.status === 'fulfilled' && conteudosRes.value?.content
      ? conteudosRes.value.content.slice(0, 3).map(dtoToBlogItem)
      : undefined

  const initialFaqItems =
    faqRes.status === 'fulfilled' && faqRes.value?.length > 0
      ? faqRes.value.map((d) => ({
          question: d.pergunta,
          answer: d.resposta,
        }))
      : undefined

  let initialContactInfo = undefined
  if (contatoRes.status === 'fulfilled' && contatoRes.value) {
    const data = contatoRes.value
    let bullets: string[] = []
    if (Array.isArray(data.cardBullets)) {
      bullets = data.cardBullets
    } else if (typeof data.cardBullets === 'string') {
      try {
        bullets = JSON.parse(data.cardBullets)
      } catch {
        bullets = []
      }
    }
    initialContactInfo = {
      eyebrow: data.eyebrow || 'Contato',
      headline:
        data.headline || 'Pronto para evoluir a TI da sua empresa?',
      headlineDestaque: data.headlineDestaque || 'TI da sua empresa',
      subtitulo:
        data.subtitulo ||
        'Conecte-se com nossos consultores seniores. Estamos prontos para projetar e implementar soluções de infraestrutura e nuvem sob medida para o seu negócio.',
      email: data.email || 'contato@infodive.com.br',
      telefone: data.telefone || '+55 (51) 3330-0444',
      endereco:
        data.endereco ||
        'Av. Cristovão Colombo, 3000 - Sala 704 | Floresta, Porto Alegre - RS',
      horarioComercial: data.horarioComercial || 'Seg a Sex, 9h às 18h',
      horarioNoc: data.horarioNoc || 'Suporte Crítico NOC: 24/7',
      cardTitulo: data.cardTitulo || 'Precisa de ajuda imediata?',
      cardDescricao:
        data.cardDescricao ||
        'Fale com nossos engenheiros e receba uma análise rápida dos requisitos de TI, segurança e nuvem do seu negócio.',
      cardBullets:
        bullets.length > 0
          ? bullets
          : (data.cardBullets || [
              'Resposta em até 1 hora',
              'Diagnóstico inicial sem custo',
              'Especialistas certificados',
            ]),
      cardCtaTexto: data.cardCtaTexto || 'Falar com Especialista',
      cardStatus:
        data.cardStatus || 'Especialistas online no momento',
    }
  }

  const initialFooterConfig =
    footerConfigRes.status === 'fulfilled' ? footerConfigRes.value : undefined

  const initialFooterSolucoes =
    footerSolucoesRes.status === 'fulfilled' &&
    footerSolucoesRes.value?.length > 0
      ? footerSolucoesRes.value
          .filter((s) => s.ativo)
          .sort((a, b) => a.ordem - b.ordem)
          .slice(0, 4)
          .map((s) => ({
            nome: s.nome,
            href: `/solucoes/${s.slug}`,
          }))
      : undefined

  const initialFooterProdutos =
    footerProdutosRes.status === 'fulfilled' &&
    footerProdutosRes.value?.content
      ? footerProdutosRes.value.content.slice(0, 4).map((p) => ({
          nome: p.nome,
          href: `/produtos/${p.slug}`,
        }))
      : undefined

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Infodive IT',
    alternateName: 'Infodive',
    url: 'https://infodive.com.br',
    logo: 'https://infodive.com.br/icon.png',
    description:
      'Soluções completas de TI para empresas que precisam de infraestrutura, segurança, proteção de dados, cloud e inteligência artificial.',
    sameAs: [
      'https://www.linkedin.com/company/infodiveit/',
      'https://www.instagram.com/infodiveit/',
      'https://www.facebook.com/InfodiveIt',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-51-3330-0444',
      contactType: 'sales',
      areaServed: 'BR',
      availableLanguage: 'Portuguese',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <main id="main-content" className="relative z-20 bg-white">
        <Hero
          initialHeroData={initialHeroData}
          initialSlides={initialSlides}
          initialPartners={initialPartners}
        />
        <Solutions
          initialInfo={initialSolutionsInfo}
          initialBentoData={initialBentoData}
        />
        <Products
          initialProducts={initialProducts}
          initialSectionInfo={initialProductsSectionInfo}
        />
        <Problems />
        <Cases />
        <TrustPoints initialStats={initialStats} />
        <Blog initialItems={initialBlogItems} />
        <FAQ initialItems={initialFaqItems} />
        <Contact initialInfo={initialContactInfo} />
      </main>
      <Footer
        initialConfig={initialFooterConfig}
        initialSolucoes={initialFooterSolucoes}
        initialProdutos={initialFooterProdutos}
      />
    </>
  )
}
