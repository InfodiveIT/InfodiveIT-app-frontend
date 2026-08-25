import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Solution } from "@/lib/solutions-data";
import { categoriaToSolution } from "@/lib/converters";
import { SolutionDetailContent } from "./solution-detail-client";
import { Footer } from "@/layout/footer";
import { api } from "@/lib/api";

export const dynamicParams = true;
export const revalidate = 600; // 10 minutes ISR cache

interface PageProps {
  params: {
    slug: string;
  };
}

const getSolution = cache(async (slug: string): Promise<Solution | null> => {
  try {
    const cat = await api.solucao(slug);
    if (cat && cat.ativo) {
      return categoriaToSolution(cat);
    }
    return null;
  } catch {
    return null;
  }
});

// Pre-generate dynamic paths at build time for ultimate performance
export async function generateStaticParams() {
  try {
    const cats = await api.solucoes();
    if (cats && cats.length > 0) {
      return cats.map((cat) => ({ slug: cat.slug }));
    }
  } catch {}
  return [];
}

// Generate high-fidelity dynamic SEO metadata for each page
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const solution = await getSolution(params.slug);

  if (!solution) {
    return {
      title: "Solução Não Encontrada | Infodive",
    };
  }

  const seoTitle = `${solution.title} — Soluções de TI | Infodive IT`;
  const seoDesc = solution.description || solution.subtitle;

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: `https://infodive.com.br/solucoes/${params.slug}`,
    },
    keywords: [
      solution.title,
      solution.subtitle,
      'Soluções corporativas',
      'Integração de TI',
      'Infodive',
    ],
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: `https://infodive.com.br/solucoes/${params.slug}`,
      type: "website",
      siteName: "Infodive IT",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDesc,
    },
  };
}

export default async function SolutionDetailPage({ params }: PageProps) {
  const solution = await getSolution(params.slug);

  if (!solution) {
    notFound();
  }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: solution.title,
    provider: {
      '@type': 'Organization',
      name: 'Infodive IT',
      url: 'https://infodive.com.br',
      logo: 'https://infodive.com.br/icon.png',
    },
    description: solution.description || solution.subtitle,
    areaServed: 'BR',
    category: 'TI / Tecnologia de Missão Crítica',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <main id="main-content">
        <SolutionDetailContent solution={solution} />
      </main>
      <Footer />
    </>
  );
}
