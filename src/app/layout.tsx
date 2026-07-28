import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { Navbar } from '@/layout/navbar'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CookieBanner } from '@/components/cookie-banner'
import dynamic from 'next/dynamic'
import '@/styles/globals.css'

const SmoothScroll = dynamic(() => import('@/components/smooth-scroll').then(mod => mod.SmoothScroll), {
  ssr: false,
})

const ibmPlex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Infodive — Portal de Soluções de TI',
    template: '%s | Infodive IT',
  },
  description:
    'Soluções completas de TI para empresas que precisam de infraestrutura, segurança, proteção de dados, cloud e inteligência artificial.',
  metadataBase: new URL('https://infodive.com.br'),
  alternates: {
    canonical: 'https://infodive.com.br',
  },
  openGraph: {
    title: 'Infodive — Portal de Soluções de TI',
    description: 'Soluções completas de TI para empresas que precisam de infraestrutura, segurança, proteção de dados, cloud e inteligência artificial.',
    url: 'https://infodive.com.br',
    siteName: 'Infodive IT',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infodive — Portal de Soluções de TI',
    description: 'Soluções completas de TI para empresas que precisam de infraestrutura, segurança, proteção de dados, cloud e inteligência artificial.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={ibmPlex.variable} style={{ backgroundColor: "#050507" }}>
      <body style={{ backgroundColor: "transparent" }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[999] focus:p-4 focus:bg-[#0E66FF] focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0E66FF] rounded-b-lg font-semibold"
        >
          Pular para o conteúdo principal
        </a>
        <SmoothScroll />
        <ScrollToTop />
        <CookieBanner />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
