'use client'

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import { useEffect, useId, useMemo, useState } from 'react'
import type { ClienteHomeDTO } from '@/lib/api'
import { cn } from '@/lib/utils'

type ClientsStageProps = {
  clients: ClienteHomeDTO[]
  eyebrow: string
  headline: string
  subtitle: string
}

type MarqueeLogoItemProps = {
  client: ClienteHomeDTO
  desktop: boolean
  placement?: 'top' | 'bottom'
  mobileDetailsId: string
  onSelectMobile: () => void
  isMobileSelected: boolean
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

function MarqueeLogoItem({
  client,
  desktop,
  placement = 'bottom',
  mobileDetailsId,
  onSelectMobile,
  isMobileSelected,
  onImageError,
}: MarqueeLogoItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: desktop && isOpen,
    onOpenChange: setIsOpen,
    placement,
    strategy: 'fixed',
    middleware: [offset(12), flip({ padding: 16 }), shift({ padding: 16 })],
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, update, { animationFrame: true }),
  })

  const hover = useHover(context, { enabled: desktop, mouseOnly: true, move: false })
  const focus = useFocus(context, { enabled: desktop })
  const dismiss = useDismiss(context, { enabled: desktop, escapeKey: true, outsidePress: true })
  const role = useRole(context, { enabled: desktop, role: 'tooltip' })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  const buttonProps = desktop
    ? getReferenceProps()
    : { onClick: onSelectMobile }

  const isHighlighted = desktop ? isOpen : isMobileSelected

  const normalizedName = client.nome.toLowerCase()
  const isSaquePague =
    normalizedName.includes('saque') || normalizedName.includes('pague')

  return (
    <div className="relative flex items-center justify-center shrink-0" data-client-card>
      <button
        ref={refs.setReference}
        type="button"
        tabIndex={0}
        aria-label={`Conhecer ${client.nome}`}
        aria-expanded={!desktop ? isMobileSelected : undefined}
        aria-controls={!desktop ? mobileDetailsId : undefined}
        {...buttonProps}
        className={cn(
          'group relative flex h-14 sm:h-16 md:h-20 w-32 sm:w-44 md:w-56 items-center justify-center outline-none cursor-pointer px-3 sm:px-5 transition-transform duration-300',
          'hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:rounded-lg',
          isHighlighted && 'scale-110',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Logos integradas sem bordas */}
        <img
          src={client.logoUrl}
          alt={client.nome}
          width={400}
          height={160}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={onImageError}
          className={cn(
            'h-full max-h-8 sm:max-h-10 md:max-h-12 w-full object-contain transition-all duration-300',
            isSaquePague
              ? 'brightness-0 invert opacity-70 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100 group-hover:scale-105'
              : 'opacity-85 group-hover:opacity-100 group-hover:scale-105',
            'group-focus-visible:opacity-100',
            isHighlighted &&
              (isSaquePague
                ? 'brightness-100 invert-0 opacity-100 scale-105'
                : 'opacity-100 scale-105'),
          )}
        />
      </button>

      {desktop && isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[100] w-[min(320px,calc(100vw-32px))] rounded-xl border border-white/15 bg-ink-950/95 p-4 text-left shadow-[0_16px_45px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
              <p className="text-sm font-semibold text-white tracking-tight">{client.nome}</p>
              <span className="rounded bg-brand-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-accent border border-brand-accent/25">
                {client.segmento}
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-ink-300">
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
  const mobileDetailsId = useId()
  const [failedLogos, setFailedLogos] = useState<Set<string>>(() => new Set())
  const [mobileSelectedId, setMobileSelectedId] = useState<string | null>(null)
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

  const toggleMobileClient = (clientId: string) => {
    setMobileSelectedId((current) => (current === clientId ? null : clientId))
  }

  // Divide as logos em duas esteiras equilibradas
  const half = Math.ceil(visibleClients.length / 2)
  const row1 = visibleClients.slice(0, half)
  const row2 = visibleClients.slice(half)

  // Duplicamos as esteiras para criar o loop contínuo infinito perfeito
  const repeatedRow1 = [...row1, ...row1, ...row1, ...row1]
  const repeatedRow2 = [...row2, ...row2, ...row2, ...row2]

  const selectedMobileClient =
    visibleClients.find((c) => c.id === mobileSelectedId) ?? null

  return (
    <section
      id="clientes"
      aria-labelledby="clientes-heading"
      className="relative isolate overflow-hidden bg-ink-950 py-24 sm:py-32 text-white"
    >
      {/* Background radial glow sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/10 blur-[150px]"
      />

      {/* Header da Seção */}
      <header className="relative z-30 mx-auto max-w-3xl px-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent sm:text-xs">
          {eyebrow}
        </p>
        <h2
          id="clientes-heading"
          className="mt-3 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl lg:text-[clamp(2rem,3.2vw,3rem)]"
        >
          {headline}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-xs font-light leading-relaxed text-ink-300 sm:text-sm">
          {subtitle}
        </p>
      </header>

      {/* Dual Infinite Marquee Container com Máscara de Gradiente nas Bordas */}
      <div className="relative mx-auto mt-16 sm:mt-20 flex flex-col gap-6 sm:gap-8 w-full [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
        {/* Linha 1 — Marquee deslizando para a esquerda */}
        <div className="group flex overflow-hidden select-none py-1">
          <div
            className="flex shrink-0 items-center justify-around gap-6 sm:gap-8 animate-marquee group-hover:[animation-play-state:paused]"
            style={{ '--marquee-duration': '32s' } as React.CSSProperties}
          >
            {repeatedRow1.map((client, index) => (
              <MarqueeLogoItem
                key={`r1-${client.id}-${index}`}
                client={client}
                desktop={desktop}
                placement="bottom"
                mobileDetailsId={mobileDetailsId}
                onSelectMobile={() => toggleMobileClient(client.id)}
                isMobileSelected={mobileSelectedId === client.id}
                onImageError={() => markImageFailed(client)}
              />
            ))}
          </div>
        </div>

        {/* Linha 2 — Marquee deslizando para a direita (reverse) */}
        <div className="group flex overflow-hidden select-none py-1">
          <div
            className="flex shrink-0 items-center justify-around gap-6 sm:gap-8 animate-marquee-reverse group-hover:[animation-play-state:paused]"
            style={{ '--marquee-duration': '36s' } as React.CSSProperties}
          >
            {repeatedRow2.map((client, index) => (
              <MarqueeLogoItem
                key={`r2-${client.id}-${index}`}
                client={client}
                desktop={desktop}
                placement="top"
                mobileDetailsId={mobileDetailsId}
                onSelectMobile={() => toggleMobileClient(client.id)}
                isMobileSelected={mobileSelectedId === client.id}
                onImageError={() => markImageFailed(client)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Painel de detalhes institucional para Mobile */}
      {!desktop && (
        <div className="px-4 mt-8">
          <div
            id={mobileDetailsId}
            role="region"
            aria-label="Detalhes do cliente selecionado"
            aria-live="polite"
            className="relative z-30 mx-auto min-h-[90px] w-full max-w-md rounded-xl border border-white/10 bg-ink-900/90 p-4 text-center backdrop-blur-xl"
          >
            {selectedMobileClient ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-sm font-semibold text-white">{selectedMobileClient.nome}</p>
                  <span className="rounded bg-brand-accent/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-accent border border-brand-accent/25">
                    {selectedMobileClient.segmento}
                  </span>
                </div>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-300">
                  {selectedMobileClient.descricaoCurta}
                </p>
              </>
            ) : (
              <p className="flex min-h-[50px] items-center justify-center text-xs text-ink-300">
                Toque em qualquer marca para ver a descrição
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
