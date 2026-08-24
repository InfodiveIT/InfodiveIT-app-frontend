# Infodive Web

Site institucional e catálogo comercial da Infodive, integrador de tecnologia B2B desde 2003.

## Visão Geral

Este repositório contém o frontend do site da Infodive: páginas institucionais
(home, sobre, serviços), catálogo de soluções e produtos, e o blog de conteúdos
técnicos. O objetivo de negócio é apresentar o portfólio da empresa e gerar leads
comerciais qualificados.

O frontend é uma aplicação Next.js 14 (App Router) que consome a API REST de um
backend Spring Boot separado, localizado em `../backend/`. Enquanto a integração
não está ativa, listas de produtos, soluções e artigos vêm de dados estáticos em
`src/lib/`, espelhando os contratos (DTOs) do backend.

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|---|---|---|
| Next.js | 14 (App Router) | Framework React, rotas, SSR/ISR |
| TypeScript | 5 | Tipagem estática em todo o código |
| Tailwind CSS | 3 | Estilização utilitária e design tokens |
| IBM Plex Sans | via next/font | Fonte única do projeto |
| GSAP + ScrollTrigger | 3 | Animações atreladas ao scroll (desktop) |
| Lenis | 1 | Smooth scroll e scroll por âncora |
| Framer Motion | 12 | Micro-interações e revelações |
| React Three Fiber + Three.js | 8 / 0.169 | Shader WebGL do hero |
| Lucide React | 1 | Ícones |
| Zod | 3 | Validação client-side de formulários |
| Jest + Testing Library | 30 / 16 | Testes unitários e de integração |

## Estrutura do Projeto

```
src/
├── app/                 # Rotas (App Router): layouts, páginas, rotas dinâmicas [slug]
├── components/
│   ├── ui/              # Componentes genéricos e reusáveis (Button, Badge, Tabs...)
│   ├── animations/      # Wrappers de animação (Reveal, TextEffect...)
│   └── *.tsx            # Componentes de projeto reusados em várias páginas
├── layout/              # Navbar, footer (presentes em todas as páginas)
├── sections/
│   ├── home/            # Seções da home (hero, problems, products...)
│   ├── sobre/           # Seções da página Sobre
│   ├── servicos/        # Seções da página Serviços
│   └── blog/            # Seções do blog (hero, artigos, social...)
├── lib/                 # api.ts (cliente HTTP), utils.ts (cn), *-data.ts (dados)
├── types/               # Declarações de tipos globais (ex.: window.lenis)
└── styles/globals.css   # Design tokens (CSS vars) + classes utilitárias
```

Convenções de organização em detalhe na seção "Arquitetura de Componentes".

## Design System

Direção visual: Enterprise com presença (referências Vercel, Linear, IBM, Stripe).
Fundo branco/cinzas neutros, bordas finas, grid respirado, sem gradientes
excessivos nem glow decorativo.

### Paleta de cores (tokens)

| Token | Hex | Uso |
|---|---|---|
| `brand` | `#0E66FF` | Cor da marca, CTAs, links |
| `brand-deep` | `#001DFF` | Hover de CTAs primários |
| `brand-tint` | `#E4EAFF` | Fundo de selos/badges brand |
| `teal` | `#46BEA3` | Acento secundário |
| `indigo` | `#5754FF` | Acento secundário |
| `ink-950` | `#141413` | Headings e fundo de seções dark |
| `ink-900` | `#1A1919` | Texto de corpo |
| `ink-500` | `#7B7B7B` | Texto secundário |
| `ink-300` | `#BFBFBF` | Placeholders |
| `ink-200` | `#D8D8D8` | Bordas (1px solid) |
| `ink-50` | `#FAFAFA` | Fundo de seções alternadas |

Gradiente da marca (apenas em locais planejados, ex.: caixas de conversão):
`linear-gradient(135deg, #6F0101 0%, #3B1F59 50%, #063FB4 100%)`.

### Tipografia

Fonte única: IBM Plex Sans (via `next/font`). Pesos usados: 400 (normal),
500 (medium), 600 (semibold). Headings em `ink-950`, texto secundário em `ink-500`.

### Classes utilitárias (globals.css)

| Classe | O que faz |
|---|---|
| `.container-default` | Largura máxima 1280px + padding lateral (`px-6 md:px-10`) |
| `.section` | Padding vertical padrão (`py-20 md:py-28`) |
| `.section-dark` / `.section-tint` | Variações de seção (fundo dark / fundo ink-50) |
| `.btn-primary` / `.btn-secondary` / `.btn-ghost` / `.btn-dark` | Estilos de botão do design system |
| `.card` / `.card-hover` | Card com borda `1px solid #D8D8D8` |
| `.eyebrow` | Label em caixa-alta acima de headings |

Bordas padrão: `rounded` (8px) e `rounded-lg` (12px).

## Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Backend Spring Boot rodando em `http://localhost:8080` (opcional enquanto os
  dados estáticos estão em uso)

## Instalação e Execução Local

1. Clonar o repositório e entrar na pasta do frontend.
2. Instalar as dependências:
   ```bash
   npm install
   ```
3. Configurar as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   # edite .env.local se a porta do backend for diferente
   ```
4. Subir o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Acessar `http://localhost:3000`.

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base da API do backend (ex.: `http://localhost:8080/api`) | Sim |
| `API_URL_INTERNAL` | URL server-only dos Server Components (ex.: `http://backend:8080/api/v1` no Docker Compose) | Em containers |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (ex.: `http://localhost:3000`) | Não |

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com hot reload (porta 3000) |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build de produção |
| `npm run lint` | Executa o ESLint |
| `npm run test` | Roda os testes (Jest) |
| `npm run test:watch` | Roda os testes em modo watch |
| `npm run test:coverage` | Roda os testes com relatório de cobertura |

## Arquitetura de Componentes

Quatro categorias, cada uma com uma responsabilidade clara:

- `components/ui/` — genéricos e reusáveis (Button, Badge, Card, Tabs,
  SelectField, Breadcrumb...). Aceitam `className` e usam `cn()`.
- `layout/` — estrutura presente em todas as páginas (navbar, footer).
- `sections/<página>/` — seções completas de uma página específica
  (ex.: `home/hero.tsx`, `sobre/timeline.tsx`).
- `components/<nome>.tsx` — componentes de projeto reusados em várias páginas
  (ex.: `product-card.tsx`, `conversion-cta.tsx`).

Regra prática: se um componente é genérico, vai em `ui/`; se é uma seção inteira de
uma página, vai em `sections/<página>/`; se é reusado entre páginas mas é específico
do domínio, fica na raiz de `components/`.

A documentação detalhada de cada componente de `ui/` (props, exemplos, notas) está
em [COMPONENTS.md](./COMPONENTS.md).

## Convenções de Código

- Arquivos de componente em kebab-case (`product-card.tsx`); componentes exportados
  em PascalCase (`ProductCard`); hooks começam com `use`.
- TypeScript obrigatório, sem `any` (exceto justificado).
- Server Components por padrão; `'use client'` apenas quando há hooks de estado,
  eventos de browser ou bibliotecas client-side (GSAP, Framer Motion, Lenis).
- Imports absolutos via alias `@/*` (mapeado para `src/*`); relativos só para
  vizinhos diretos.
- Imagens via `next/image`; fonte via `next/font`.
- Classes mescladas com `cn()` (de `src/lib/utils.ts`).
- Formulários de lead: `consentimentoLgpd` obrigatório, validação client-side com Zod.

## Testes

Os testes usam Jest com `next/jest` e React Testing Library. Cobrem componentes de
UI, componentes compartilhados, utilitários e dados de `src/lib`, além de um teste
de integração do filtro do blog.

- Rodar: `npm run test`
- Cobertura: `npm run test:coverage`
- Meta de cobertura: 75% de linhas, 75% de funções, 70% de branches.
- Os arquivos de teste ficam em `__tests__/` ao lado do código testado
  (ex.: `src/components/ui/__tests__/button.test.tsx`).

Componentes de animação pesada (carrosséis embla/GSAP) são excluídos da métrica de
cobertura por não serem unitariamente testáveis de forma significativa.

## Conexão com o Backend

O cliente HTTP está em [src/lib/api.ts](src/lib/api.ts). No navegador ele usa
`NEXT_PUBLIC_API_URL`; em Server Components, prefere `API_URL_INTERNAL` e cai
para a URL pública quando essa variável não existe. Conteúdos que precisam
refletir revogação imediata podem usar `cache: "no-store"`. Os DTOs em `api.ts`
espelham os contratos do backend Spring Boot.

Endpoints esperados: `GET /categorias`, `GET /produtos` (filtros), `GET /produtos/{slug}`,
`GET /fabricantes`, `GET /servicos`, `GET /conteudos`, `GET /banners`, `POST /leads`.

## Deploy

O deploy é feito na Vercel, conectando este diretório como root do projeto. Defina
`NEXT_PUBLIC_API_URL` apontando para o domínio do backend em produção nas variáveis
de ambiente da Vercel.
