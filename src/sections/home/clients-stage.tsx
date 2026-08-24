'use client'

import Image from 'next/image'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import {
  createRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { ClienteHomeDTO } from '@/lib/api'
import infodiveWordmark from '@/assets/logo/Logo Infodive 3.png'
import { AnimatedBeam } from '@/components/animations/animated-beam'
import { cn } from '@/lib/utils'

type ClientsStageProps = {
  clients: ClienteHomeDTO[]
  eyebrow: string
  headline: string
  subtitle: string
}

type ClientNodeProps = {
  client: ClienteHomeDTO
  nodeRef: RefObject<HTMLDivElement>
  desktop: boolean
  open: boolean
  anotherOpen: boolean
  mobileDetailsId: string
  onOpenChange: (open: boolean) => void
  onImageError: () => void
}

function getLogoKey(client: ClienteHomeDTO) {
  return `${client.id}\u0000${client.logoUrl}`
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

function ClientNode({
  client,
  nodeRef,
  desktop,
  open,
  anotherOpen,
  mobileDetailsId,
  onOpenChange,
  onImageError,
}: ClientNodeProps) {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: 'top',
    strategy: 'fixed',
    middleware: [offset(10), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: open
      ? (reference, floating, update) =>
          autoUpdate(reference, floating, update, { animationFrame: true })
      : undefined,
  })

  const hover = useHover(context, { enabled: desktop, mouseOnly: true, move: false })
  const focus = useFocus(context, { enabled: desktop })
  const dismiss = useDismiss(context, { enabled: true, escapeKey: true, outsidePress: true })
  const role = useRole(context, { enabled: desktop, role: 'tooltip' })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  return (
    <div
      ref={nodeRef}
      className="relative z-20 flex items-center justify-center"
      data-client-card
    >
      <button
        ref={refs.setReference}
        type="button"
        tabIndex={0}
        aria-label={`Conhecer ${client.nome}`}
        aria-expanded={!desktop ? open : undefined}
        aria-controls={!desktop ? mobileDetailsId : undefined}
        {...getReferenceProps({
          onClick: () => onOpenChange(!open),
        })}
        className={cn(
          'group relative flex h-14 w-28 sm:h-16 sm:w-36 items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 outline-none backdrop-blur-xl',
          'border-white/[0.08] bg-ink-900/80 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.7)]',
          'hover:border-brand-accent/60 hover:bg-ink-800/90 hover:shadow-[0_0_25px_rgba(14,102,255,0.35)] hover:scale-105',
          'focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent',
          open &&
            'border-brand-accent bg-ink-800 shadow-[0_0_30px_rgba(14,102,255,0.5)] scale-105',
          anotherOpen && 'opacity-40 saturate-50',
        )}
      >
        {/* Glow sutil ao fundo do card */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-accent/0 via-brand-accent/5 to-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* eslint-disable-next-line @next/next/no-img-element -- Logos do Supabase */}
        <img
          src={client.logoUrl}
          alt=""
          width={400}
          height={160}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={onImageError}
          className={cn(
            'h-full max-h-7 sm:max-h-8 w-full px-3 object-contain brightness-0 invert opacity-75 transition-all duration-300',
            open
              ? 'opacity-100 scale-105'
              : 'group-hover:opacity-100 group-hover:scale-105 group-focus-visible:opacity-100',
          )}
        />
      </button>

      {desktop && open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[100] w-[min(260px,calc(100vw-32px))] rounded-xl border border-white/15 bg-ink-950/95 p-3.5 text-left shadow-2xl backdrop-blur-xl"
          >
            <p className="text-sm font-semibold text-white">{client.nome}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
              {client.segmento}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-300">
              {client.descricaoCurta}
            </p>
          </div>
        </FloatingPortal>
      )}
    </div>
  )
}

export function ClientsStage({
  clients,
  eyebrow,
  headline,
  subtitle,
}: ClientsStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)
  const mobileDetailsId = useId()
  const [failedLogos, setFailedLogos] = useState<Set<string>>(() => new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const desktop = useMediaQuery('(min-width: 1024px)')

  const currentLogoKeys = useMemo(
    () => new Set(clients.map(getLogoKey)),
    [clients],
  )
  const visibleClients = useMemo(
    () => clients.filter((client) => !failedLogos.has(getLogoKey(client))),
    [clients, failedLogos],
  )

  useEffect(() => {
    setFailedLogos((current) => {
      const retained = [...current].filter((key) => currentLogoKeys.has(key))
      return retained.length === current.size ? current : new Set(retained)
    })
  }, [currentLogoKeys])

  // Criamos referências individuais para cada nó
  const nodeRefs = useMemo(
    () => visibleClients.map(() => createRef<HTMLDivElement>()),
    [visibleClients.length], // eslint-disable-line react-hooks/exhaustive-deps
  )

  if (visibleClients.length < 6 || visibleClients.length > 12) {
    return null
  }

  const markImageFailed = (client: ClienteHomeDTO) => {
    const logoKey = getLogoKey(client)
    setFailedLogos((current) => {
      if (current.has(logoKey)) return current
      const next = new Set(current)
      next.add(logoKey)
      return next
    })
  }

  // Divisão balanceada dos clientes em 4 colunas (2 à esquerda, 2 à direita)
  const total = visibleClients.length
  const half = Math.ceil(total / 2)
  const leftSide = visibleClients.slice(0, half)
  const rightSide = visibleClients.slice(half)

  const leftCol1 = leftSide.filter((_, i) => i % 2 === 0)
  const leftCol2 = leftSide.filter((_, i) => i % 2 !== 0)
  const rightCol1 = rightSide.filter((_, i) => i % 2 === 0)
  const rightCol2 = rightSide.filter((_, i) => i % 2 !== 0)

  const selectedClient = visibleClients.find((c) => c.id === activeId) ?? null

  return (
    <section
      id="clientes"
      aria-labelledby="clientes-heading"
      className="relative isolate overflow-hidden bg-ink-950 py-20 sm:py-28 text-white"
    >
      {/* Background radial glow e grid sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:40px_40px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[130px]"
      />

      {/* Header */}
      <header className="relative z-30 mx-auto max-w-3xl px-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent sm:text-xs">
          {eyebrow}
        </p>
        <h2
          id="clientes-heading"
          className="mt-3 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl lg:text-[clamp(2rem,3vw,3rem)]"
        >
          {headline}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-xs font-light leading-relaxed text-ink-300 sm:text-sm">
          {subtitle}
        </p>
      </header>

      {/* Stage do Ecossistema Interconectado */}
      <div
        ref={containerRef}
        className="relative mx-auto mt-14 flex max-w-6xl items-center justify-center px-4 sm:px-8 min-h-[460px]"
      >
        {/* Layout Desktop com 5 colunas interligadas */}
        {desktop ? (
          <div className="flex w-full items-center justify-between gap-6">
            {/* Coluna Esquerda 1 (Externa) */}
            <div className="flex flex-col justify-around gap-8">
              {leftCol1.map((client) => {
                const originalIndex = visibleClients.findIndex((c) => c.id === client.id)
                return (
                  <ClientNode
                    key={client.id}
                    client={client}
                    nodeRef={nodeRefs[originalIndex]}
                    desktop={desktop}
                    open={activeId === client.id}
                    anotherOpen={activeId !== null && activeId !== client.id}
                    mobileDetailsId={mobileDetailsId}
                    onOpenChange={(open) =>
                      setActiveId((current) => (open ? client.id : current === client.id ? null : current))
                    }
                    onImageError={() => markImageFailed(client)}
                  />
                )
              })}
            </div>

            {/* Coluna Esquerda 2 (Interna) */}
            <div className="flex flex-col justify-around gap-12">
              {leftCol2.map((client) => {
                const originalIndex = visibleClients.findIndex((c) => c.id === client.id)
                return (
                  <ClientNode
                    key={client.id}
                    client={client}
                    nodeRef={nodeRefs[originalIndex]}
                    desktop={desktop}
                    open={activeId === client.id}
                    anotherOpen={activeId !== null && activeId !== client.id}
                    mobileDetailsId={mobileDetailsId}
                    onOpenChange={(open) =>
                      setActiveId((current) => (open ? client.id : current === client.id ? null : current))
                    }
                    onImageError={() => markImageFailed(client)}
                  />
                )
              })}
            </div>

            {/* Hub Central da Infodive */}
            <div
              ref={centerRef}
              className="relative z-30 flex h-24 w-44 items-center justify-center rounded-2xl border border-brand-accent/40 bg-ink-900/90 p-4 shadow-[0_0_50px_-10px_rgba(14,102,255,0.5)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_0_65px_-5px_rgba(14,102,255,0.7)]"
            >
              {/* Pulse rings concêntricos */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-1.5 rounded-2xl border border-brand-accent/20 animate-pulse"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 rounded-3xl border border-brand-accent/10 opacity-50"
              />

              <Image
                src={infodiveWordmark}
                alt="Infodive IT Hub"
                priority={false}
                className="h-auto w-full object-contain drop-shadow-[0_2px_8px_rgba(14,102,255,0.4)]"
              />
            </div>

            {/* Coluna Direita 2 (Interna) */}
            <div className="flex flex-col justify-around gap-12">
              {rightCol2.map((client) => {
                const originalIndex = visibleClients.findIndex((c) => c.id === client.id)
                return (
                  <ClientNode
                    key={client.id}
                    client={client}
                    nodeRef={nodeRefs[originalIndex]}
                    desktop={desktop}
                    open={activeId === client.id}
                    anotherOpen={activeId !== null && activeId !== client.id}
                    mobileDetailsId={mobileDetailsId}
                    onOpenChange={(open) =>
                      setActiveId((current) => (open ? client.id : current === client.id ? null : current))
                    }
                    onImageError={() => markImageFailed(client)}
                  />
                )
              })}
            </div>

            {/* Coluna Direita 1 (Externa) */}
            <div className="flex flex-col justify-around gap-8">
              {rightCol1.map((client) => {
                const originalIndex = visibleClients.findIndex((c) => c.id === client.id)
                return (
                  <ClientNode
                    key={client.id}
                    client={client}
                    nodeRef={nodeRefs[originalIndex]}
                    desktop={desktop}
                    open={activeId === client.id}
                    anotherOpen={activeId !== null && activeId !== client.id}
                    mobileDetailsId={mobileDetailsId}
                    onOpenChange={(open) =>
                      setActiveId((current) => (open ? client.id : current === client.id ? null : current))
                    }
                    onImageError={() => markImageFailed(client)}
                  />
                )
              })}
            </div>

            {/* Animated Beams conectando cada cliente ao Hub Central */}
            {visibleClients.map((client, index) => {
              const isLeft = index < half
              // Curvatura harmônica baseada na posição vertical
              const verticalOffset = (index % 3) - 1 // -1 (topo), 0 (meio), 1 (baixo)
              const curvature = verticalOffset * (isLeft ? -45 : 45)
              const duration = 3.5 + (index % 3) * 0.8
              const delay = (index % 4) * 0.5

              return (
                <AnimatedBeam
                  key={`beam-${client.id}`}
                  containerRef={containerRef}
                  fromRef={nodeRefs[index]}
                  toRef={centerRef}
                  curvature={curvature}
                  duration={duration}
                  delay={delay}
                  pathColor="rgba(255, 255, 255, 0.08)"
                  pathWidth={1.5}
                  gradientStartColor="#0E66FF"
                  gradientStopColor="#38BDF8"
                  reverse={!isLeft}
                />
              )
            })}
          </div>
        ) : (
          /* Layout Mobile / Tablet (< lg): Grid Interativo com Hub no Topo */
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="relative z-30 flex h-18 w-36 items-center justify-center rounded-xl border border-brand-accent/40 bg-ink-900/90 p-3 shadow-[0_0_35px_-8px_rgba(14,102,255,0.5)]">
              <Image
                src={infodiveWordmark}
                alt="Infodive IT Hub"
                priority={false}
                className="h-auto w-full object-contain"
              />
            </div>

            <ul
              aria-label="Clientes da Infodive"
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg"
            >
              {visibleClients.map((client, index) => (
                <ClientNode
                  key={client.id}
                  client={client}
                  nodeRef={nodeRefs[index]}
                  desktop={desktop}
                  open={activeId === client.id}
                  anotherOpen={activeId !== null && activeId !== client.id}
                  mobileDetailsId={mobileDetailsId}
                  onOpenChange={(open) =>
                    setActiveId((current) => (open ? client.id : current === client.id ? null : current))
                  }
                  onImageError={() => markImageFailed(client)}
                />
              ))}
            </ul>

            {/* Painel de detalhes do cliente selecionado no mobile */}
            <div
              id={mobileDetailsId}
              role="region"
              aria-label="Detalhes do cliente selecionado"
              aria-live="polite"
              className="relative z-30 mx-auto mt-2 min-h-[90px] w-full max-w-lg rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-md"
            >
              {selectedClient ? (
                <>
                  <p className="text-sm font-semibold text-white">{selectedClient.nome}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
                    {selectedClient.segmento}
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-ink-300">
                    {selectedClient.descricaoCurta}
                  </p>
                </>
              ) : (
                <p className="flex min-h-[50px] items-center justify-center text-xs text-ink-300">
                  Toque em uma marca para conhecer
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
