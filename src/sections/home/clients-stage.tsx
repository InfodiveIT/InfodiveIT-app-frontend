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
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import type { ClienteHomeDTO } from '@/lib/api'
import infodiveWordmark from '@/assets/logo/Logo Infodive 3.png'
import { cn } from '@/lib/utils'
import { getClientSlots, type ClientSlot } from './clients-layout'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

type ClientsStageProps = {
  clients: ClienteHomeDTO[]
  eyebrow: string
  headline: string
  subtitle: string
}

type LogoCardProps = {
  client: ClienteHomeDTO
  slot: ClientSlot
  desktop: boolean
  interactionReady: boolean
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
  const [state, setState] = useState({ matches: false, resolved: false })

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setState({ matches: media.matches, resolved: true })

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])

  return state
}

function LogoCard({
  client,
  slot,
  desktop,
  interactionReady,
  open,
  anotherOpen,
  mobileDetailsId,
  onOpenChange,
  onImageError,
}: LogoCardProps) {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: 'top',
    strategy: 'fixed',
    middleware: [offset(12), flip({ padding: 16 }), shift({ padding: 16 })],
    whileElementsMounted: open
      ? (reference, floating, update) =>
          autoUpdate(reference, floating, update, { animationFrame: true })
      : undefined,
  })
  const hover = useHover(context, {
    enabled: desktop && interactionReady,
    mouseOnly: true,
    move: false,
  })
  const focus = useFocus(context, { enabled: desktop && interactionReady })
  const click = useClick(context, {
    enabled: desktop && interactionReady,
    event: 'click',
    toggle: true,
    ignoreMouse: true,
  })
  const dismiss = useDismiss(context, {
    enabled: desktop && interactionReady,
    escapeKey: true,
    outsidePress: true,
  })
  const role = useRole(context, { enabled: desktop, role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
  ])

  const slotStyle = {
    '--client-left': `${slot.x}%`,
    '--client-top': `${slot.y}%`,
    '--client-rotation': `${slot.rotation}deg`,
    '--client-scale': String(slot.scale),
  } as CSSProperties

  return (
    <li
      data-client-card
      className="home-client-card relative z-10 min-h-[64px] min-w-0 sm:min-h-[72px] lg:absolute lg:h-[clamp(50px,4.5vw,66px)] lg:w-[clamp(100px,8.5vw,136px)]"
      style={slotStyle}
    >
      <button
        ref={refs.setReference}
        type="button"
        tabIndex={interactionReady ? 0 : -1}
        aria-label={`Conhecer ${client.nome}`}
        aria-expanded={!desktop ? open : undefined}
        aria-controls={!desktop ? mobileDetailsId : undefined}
        {...getReferenceProps({
          onClick: desktop
            ? undefined
            : () => interactionReady && onOpenChange(!open),
        })}
        className={cn(
          'group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 shadow-[0_10px_25px_-12px_rgba(0,0,0,0.7)] outline-none backdrop-blur-md transition-[border-color,background-color,box-shadow,filter,opacity,transform] duration-200',
          'hover:border-brand-accent/50 hover:bg-white/[0.08] hover:shadow-[0_12px_30px_-10px_rgba(14,102,255,0.3)] focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent',
          !interactionReady && 'pointer-events-none',
          open &&
            'z-30 -translate-y-0.5 border-brand-accent/70 bg-white/[0.1] shadow-[0_14px_40px_-15px_rgba(14,102,255,0.5)]',
          anotherOpen && 'opacity-30 saturate-50',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Logos validadas ficam no navegador e não passam pelo otimizador remoto do Next.js. */}
        <img
          src={client.logoUrl}
          alt=""
          width={480}
          height={180}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={onImageError}
          className={cn(
            'h-full max-h-[30px] w-full object-contain brightness-0 invert opacity-75 transition-[filter,opacity,transform] duration-200 sm:max-h-[34px] lg:max-h-[34px]',
            open
              ? 'scale-[1.04] opacity-100'
              : 'group-hover:opacity-100 group-hover:scale-[1.04] group-focus-visible:opacity-100',
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
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
              {client.segmento}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-300">
              {client.descricaoCurta}
            </p>
          </div>
        </FloatingPortal>
      )}
    </li>
  )
}

export function ClientsStage({ clients, eyebrow, headline, subtitle }: ClientsStageProps) {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)
  const mobileDetailsId = useId()
  const [failedLogos, setFailedLogos] = useState<Set<string>>(() => new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [interactionReady, setInteractionReady] = useState(false)
  const desktopQuery = useMediaQuery('(min-width: 1024px)')
  const reducedMotionQuery = useMediaQuery('(prefers-reduced-motion: reduce)')
  const desktop = desktopQuery.matches
  const reducedMotion = reducedMotionQuery.matches
  const mediaQueriesResolved = desktopQuery.resolved && reducedMotionQuery.resolved
  const currentLogoKeys = useMemo(
    () => new Set(clients.map(getLogoKey)),
    [clients],
  )
  const visibleClients = useMemo(
    () => clients.filter((client) => !failedLogos.has(getLogoKey(client))),
    [clients, failedLogos],
  )
  const slots = useMemo(
    () =>
      visibleClients.length >= 6 && visibleClients.length <= 12
        ? getClientSlots(visibleClients.length)
        : [],
    [visibleClients.length],
  )
  const animationKey = useMemo(
    () =>
      JSON.stringify(
        visibleClients.map((client) => [client.id, client.logoUrl, client.ordem]),
      ),
    [visibleClients],
  )
  const selectedClient = visibleClients.find((client) => client.id === activeId) ?? null

  useEffect(() => {
    setFailedLogos((current) => {
      const retained = [...current].filter((key) => currentLogoKeys.has(key))

      return retained.length === current.size ? current : new Set(retained)
    })
  }, [currentLogoKeys])

  useEffect(() => {
    if (!mediaQueriesResolved) {
      setInteractionReady(false)
      return
    }

    if (!desktop || reducedMotion) {
      setInteractionReady(true)
      return
    }

    setInteractionReady(false)
    setActiveId(null)
  }, [desktop, mediaQueriesResolved, reducedMotion])

  useEffect(() => {
    if (activeId && !visibleClients.some((client) => client.id === activeId)) {
      setActiveId(null)
    }
  }, [activeId, visibleClients])

  useIsomorphicLayoutEffect(() => {
    if (
      !desktop ||
      !mediaQueriesResolved ||
      reducedMotion ||
      !rootRef.current ||
      !stageRef.current ||
      slots.length < 6
    ) {
      return
    }

    const cards = Array.from(
      stageRef.current.querySelectorAll<HTMLElement>('[data-client-card]'),
    )
    let ready = false
    const context = gsap.context(() => {
      gsap.set(cards, {
        left: '50%',
        top: '53%',
        xPercent: -50,
        yPercent: -50,
        scale: 0.72,
        rotation: 0,
        opacity: 0.16,
      })

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 0.75)}`,
          pin: stageRef.current,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextReady = self.progress >= 0.7
            if (nextReady !== ready) {
              ready = nextReady
              setInteractionReady(nextReady)
              if (!nextReady) setActiveId(null)
            }
          },
        },
      })

      cards.forEach((card, index) => {
        const slot = slots[index]
        timeline.to(
          card,
          {
            left: `${slot.x}%`,
            top: `${slot.y}%`,
            scale: slot.scale,
            rotation: slot.rotation,
            opacity: 1,
            duration: 0.5,
            ease: 'power1.out',
          },
          0.04,
        )
      })

      timeline.to(cards, { duration: 0.05, ease: 'power1.out' }, 0.6)
      timeline.to({}, { duration: 0.25 }, 0.7)

      if (wordmarkRef.current) {
        timeline.fromTo(
          wordmarkRef.current,
          { scale: 0.94, opacity: 0.8 },
          { scale: 1, opacity: 1, duration: 0.55, ease: 'none' },
          0.04,
        )
      }
    }, rootRef)
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      context.revert()
      setActiveId(null)
    }
  }, [animationKey, desktop, mediaQueriesResolved, reducedMotion, slots])

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

  return (
    <section
      id="clientes"
      ref={rootRef}
      aria-labelledby="clientes-heading"
      className="relative isolate overflow-clip bg-ink-950 text-white"
    >
      <div
        ref={stageRef}
        className="relative min-h-[100svh] overflow-clip px-5 py-20 sm:px-8 lg:h-[100svh] lg:min-h-[600px] lg:px-0 lg:py-0"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),radial-gradient(circle_at_50%_48%,rgba(14,102,255,0.14),transparent_40%)] [background-size:48px_48px,48px_48px,100%_100%]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent"
        />

        <header className="relative z-40 mx-auto max-w-3xl text-center lg:absolute lg:left-1/2 lg:top-[6%] lg:w-full lg:-translate-x-1/2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent sm:text-xs">
            {eyebrow}
          </p>
          <h2
            id="clientes-heading"
            className="mt-2.5 text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl lg:text-[clamp(1.85rem,2.8vw,2.75rem)]"
          >
            {headline}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-xs font-light leading-relaxed text-ink-300 sm:text-sm">
            {subtitle}
          </p>
        </header>

        <div
          ref={wordmarkRef}
          className="relative z-30 mx-auto mb-8 mt-10 flex w-[min(50vw,190px)] items-center justify-center rounded-xl border border-white/10 bg-black/40 px-4 py-3 shadow-[0_20px_50px_-20px_rgba(14,102,255,0.4)] backdrop-blur-xl lg:absolute lg:left-1/2 lg:top-[53%] lg:m-0 lg:w-[clamp(160px,14vw,210px)] lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          <Image
            src={infodiveWordmark}
            alt="Infodive IT"
            priority={false}
            sizes="(min-width: 1024px) 210px, 190px"
            className="h-auto w-full object-contain"
          />
        </div>

        <ul
          aria-label="Clientes da Infodive"
          className="relative z-20 mx-auto grid max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-3 lg:absolute lg:inset-0 lg:block lg:max-w-none"
        >
          {visibleClients.map((client, index) => (
            <LogoCard
              key={client.id}
              client={client}
              slot={slots[index]}
              desktop={desktop}
              interactionReady={interactionReady}
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

        {!desktop && (
          <div
            id={mobileDetailsId}
            role="region"
            aria-label="Detalhes do cliente selecionado"
            aria-live="polite"
            className="relative z-30 mx-auto mt-6 min-h-[110px] max-w-xl rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-md lg:hidden"
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
              <p className="flex min-h-[70px] items-center justify-center text-xs text-ink-300">
                Toque em uma marca para conhecer
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
