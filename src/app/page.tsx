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

export default function HomePage() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Infodive IT',
    alternateName: 'Infodive',
    url: 'https://infodive.com.br',
    logo: 'https://infodive.com.br/icon.png',
    description: 'Soluções completas de TI para empresas que precisam de infraestrutura, segurança, proteção de dados, cloud e inteligência artificial.',
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
        <Hero />
        <Solutions />
        <Products />
        <Problems />
        <Cases />
        {/* Oculto temporariamente para ajustes */}
        {/* <Suspense fallback={null}>
          <Clients />
        </Suspense> */}
        <TrustPoints />
        <Blog />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
