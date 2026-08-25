import { NextResponse } from 'next/server'
import { api } from '@/lib/api'

export const dynamic = 'force-static'
export const revalidate = 600 // 10 minutes cache

export async function GET() {
  try {
    const [resCat, resFab, resProd, resCont, resNovidade] = await Promise.allSettled([
      api.categorias(),
      api.fabricantes({ destaque: true }),
      api.produtos({ destaque: true, size: 6 }),
      api.conteudos({ size: 2 }),
      api.produtoNovidade(),
    ])

    const categorias =
      resCat.status === 'fulfilled' && resCat.value
        ? resCat.value.filter((c) => c.ativo).sort((a, b) => a.ordem - b.ordem)
        : []

    const fabricantes =
      resFab.status === 'fulfilled' && resFab.value
        ? resFab.value.filter((f) => f.ativo).sort((a, b) => a.ordem - b.ordem)
        : []

    const produtosDestaque =
      resProd.status === 'fulfilled' && resProd.value?.content
        ? resProd.value.content
        : []

    const ultimosConteudos =
      resCont.status === 'fulfilled' && resCont.value?.content
        ? resCont.value.content.slice(0, 2)
        : []

    const produtoNovidade =
      resNovidade.status === 'fulfilled' ? resNovidade.value : null

    return NextResponse.json(
      {
        categorias,
        fabricantes,
        produtosDestaque,
        ultimosConteudos,
        ultimoConteudo: ultimosConteudos[0] || null,
        produtoNovidade,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        categorias: [],
        fabricantes: [],
        produtosDestaque: [],
        ultimosConteudos: [],
        ultimoConteudo: null,
        produtoNovidade: null,
      },
      { status: 500 }
    )
  }
}
