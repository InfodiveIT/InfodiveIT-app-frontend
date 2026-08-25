'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  Brain,
  Cloud,
  HardDrive,
  Laptop,
  Layers,
  Lock,
  Server,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { api, type ConteudoDTO, type ProdutoResumoDTO } from '@/lib/api'

/**
 * Mapa local de ícones por slug de categoria — configuração de UI, não dado do banco.
 * O backend não armazena os ícones Lucide usados na navbar.
 */
const CATEGORY_UI_CONFIG: Record<string, { icon: LucideIcon; description: string }> = {
  infraestrutura: { icon: Server, description: 'Servidores, redes e datacenter' },
  armazenamento: { icon: HardDrive, description: 'Storage corporativo escalável' },
  'protecao-de-dados': { icon: ShieldCheck, description: 'Backup, replicação e recuperação' },
  'backup-e-recuperacao': { icon: ShieldCheck, description: 'Backup, replicação e recuperação' },
  seguranca: { icon: Lock, description: 'Firewall, EDR e zero trust' },
  observability: { icon: Activity, description: 'Monitoração e telemetria' },
  virtualizacao: { icon: Layers, description: 'Hipervisores e workloads' },
  cloud: { icon: Cloud, description: 'Public, private e hybrid cloud' },
  'inteligencia-artificial': { icon: Brain, description: 'Plataformas e infraestrutura para IA' },
  ia: { icon: Brain, description: 'Plataformas e infraestrutura para IA' },
  endpoints: { icon: Laptop, description: 'Estações, mobilidade e gestão' },
  servicos: { icon: Activity, description: 'Suporte e monitoração' },
}

function getUiConfigForSlug(slug: string) {
  return CATEGORY_UI_CONFIG[slug] ?? { icon: Server, description: '' }
}

export type NavCategoriaItem = {
  nome: string
  slug: string
  descricao: string
  href: string
  icon: LucideIcon
}

export type NavFabricanteItem = {
  nome: string
  descricao: string
  href: string
}

const LOCAL_STORAGE_KEY = 'infodive_navbar_cache_v3'

interface CacheData {
  categorias: { nome: string; slug: string; descricao: string; href: string }[]
  fabricantes: NavFabricanteItem[]
  ultimoConteudo: ConteudoDTO | null
  ultimosConteudos: ConteudoDTO[]
  produtosDestaque: ProdutoResumoDTO[]
  produtoNovidade: ProdutoResumoDTO | null
  timestamp: number
}

/**
 * Busca os dados dinâmicos da navbar com suporte a Caching em LocalStorage (PC do usuário).
 * Permite carregamento instantâneo (0ms) e usa Skeleton Loader quando zerado.
 */
export function useNavbarData() {
  const [categorias, setCategorias] = useState<NavCategoriaItem[]>([])
  const [fabricantes, setFabricantes] = useState<NavFabricanteItem[]>([])
  const [ultimoConteudo, setUltimoConteudo] = useState<ConteudoDTO | null>(null)
  const [ultimosConteudos, setUltimosConteudos] = useState<ConteudoDTO[]>([])
  const [produtosDestaque, setProdutosDestaque] = useState<ProdutoResumoDTO[]>([])
  const [produtoNovidade, setProdutoNovidade] = useState<ProdutoResumoDTO | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // 1. Tentar restaurar do LocalStorage imediatamente (0ms no PC do usuário)
    try {
      const cachedRaw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (cachedRaw) {
        const cached: CacheData = JSON.parse(cachedRaw)
        if (cached.categorias && cached.categorias.length > 0) {
          setCategorias(
            cached.categorias.map((c) => ({
              ...c,
              icon: getUiConfigForSlug(c.slug).icon,
            })),
          )
        }
        if (cached.fabricantes) setFabricantes(cached.fabricantes)
        if (cached.ultimoConteudo) setUltimoConteudo(cached.ultimoConteudo)
        if (cached.ultimosConteudos && cached.ultimosConteudos.length > 0) {
          setUltimosConteudos(cached.ultimosConteudos)
        }
        if (cached.produtosDestaque) setProdutosDestaque(cached.produtosDestaque)
        if (cached.produtoNovidade) setProdutoNovidade(cached.produtoNovidade)
        setIsLoading(false)
      }
    } catch {
      /* ignore storage errors */
    }

    // 2. Buscar dados agregados via endpoint local same-origin (sem preflight CORS)
    let isMounted = true

    fetch('/api/navbar-data')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch navbar data')
        return res.json()
      })
      .then((data) => {
        if (!isMounted || !data) return

        let newCategorias: NavCategoriaItem[] = []
        let newFabricantes: NavFabricanteItem[] = []
        let newProdutosDestaque: ProdutoResumoDTO[] = []
        let newUltimoConteudo: ConteudoDTO | null = null
        let newUltimosConteudos: ConteudoDTO[] = []
        let newProdutoNovidade: ProdutoResumoDTO | null = null

        if (Array.isArray(data.categorias) && data.categorias.length > 0) {
          newCategorias = data.categorias.map((c: any) => {
            const ui = getUiConfigForSlug(c.slug)
            return {
              nome: c.nome,
              slug: c.slug,
              descricao: ui.description,
              href: `/solucoes?${c.slug}`,
              icon: ui.icon,
            }
          })
          setCategorias(newCategorias)
        }

        if (Array.isArray(data.fabricantes) && data.fabricantes.length > 0) {
          newFabricantes = data.fabricantes.map((f: any) => ({
            nome: f.nome,
            descricao: f.descricaoCurta ?? f.descricao ?? '',
            href: `/produtos?fabricante=${encodeURIComponent(f.slug)}`,
          }))
          setFabricantes(newFabricantes)
        }

        if (Array.isArray(data.produtosDestaque) && data.produtosDestaque.length > 0) {
          newProdutosDestaque = data.produtosDestaque
          setProdutosDestaque(newProdutosDestaque)
        }

        if (Array.isArray(data.ultimosConteudos) && data.ultimosConteudos.length > 0) {
          newUltimosConteudos = data.ultimosConteudos.slice(0, 2)
          newUltimoConteudo = newUltimosConteudos[0] || null
          setUltimosConteudos(newUltimosConteudos)
          setUltimoConteudo(newUltimoConteudo)
        }

        if (data.produtoNovidade) {
          newProdutoNovidade = data.produtoNovidade
          setProdutoNovidade(newProdutoNovidade)
        }

        setIsLoading(false)

        // Salvar snapshot no localStorage para navegações futuras
        try {
          const cacheToSave: CacheData = {
            categorias: newCategorias.map((c) => ({
              nome: c.nome,
              slug: c.slug,
              descricao: c.descricao,
              href: c.href,
            })),
            fabricantes: newFabricantes,
            ultimoConteudo: newUltimoConteudo,
            ultimosConteudos: newUltimosConteudos,
            produtosDestaque: newProdutosDestaque,
            produtoNovidade: newProdutoNovidade,
            timestamp: Date.now(),
          }
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheToSave))
        } catch {
          /* ignore storage write errors */
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { categorias, fabricantes, ultimoConteudo, ultimosConteudos, produtosDestaque, produtoNovidade, isLoading }
}
