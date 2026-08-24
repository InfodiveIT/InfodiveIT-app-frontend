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
      className="home-client-card relative z-10 min-h-[104px] min-w-0 lg:absolute lg:h-[clamp(76px,8vw,112px)] lg:w-[clamp(132px,13vw,210px)]"
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
          'group relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.055] px-4 py-5 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.95)] outline-none backdrop-blur-md transition-[border-color,background-color,box-shadow,filter,opacity,transform] duration-300',
          'hover:border-brand-accent/55 hover:bg-white/[0.94] focus-visible:border-brand-accent focus-visible:bg-white/[0.94] focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950',
          !interactionReady && 'pointer-events-none',
          open &&
            'z-30 -translate-y-1 border-brand-accent/70 bg-white/[0.94] shadow-[0_24px_70px_-25px_rgba(14,102,255,0.75)]',
          anotherOpen && 'opacity-35 saturate-50',
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
            'h-full max-h-[72px] w-full object-contain brightness-0 grayscale invert transition-[filter,opacity,transform] duration-300',
            open
              ? 'scale-[1.04] opacity-100 brightness-100 grayscale-0 invert-0'
              : 'opacity-80 group-hover:opacity-100 group-hover:brightness-100 group-hover:grayscale-0 group-hover:invert-0 group-focus-visible:opacity-100 group-focus-visible:brightness-100 group-focus-visible:grayscale-0 group-focus-visible:invert-0',
          )}
        />
      </button>

      {desktop && open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[100] w-[min(300px,calc(100vw-32px))] rounded-xl border border-white/15 bg-ink-900/95 p-4 text-left shadow-2xl backdrop-blur-xl"
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
        top: '54%',
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
          end: () => `+=${Math.round(window.innerHeight * 1.2)}`,
          pin: stageRef.current,
          scrub: 1,
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
            duration: 0.57,
            ease: 'none',
          },
          0.08,
        )
      })

      timeline.to(cards, { duration: 0.05, ease: 'power1.out' }, 0.65)
      timeline.to({}, { duration: 0.3 }, 0.7)

      if (wordmarkRef.current) {
        timeline.fromTo(
          wordmarkRef.current,
          { scale: 0.94, opacity: 0.78 },
          { scale: 1, opacity: 1, duration: 0.62, ease: 'none' },
          0.08,
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
        className="relative min-h-[100svh] overflow-clip px-5 py-20 sm:px-8 lg:h-[100svh] lg:min-h-[640px] lg:px-0 lg:py-0"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),radial-gradient(circle_at_50%_48%,rgba(14,102,255,0.18),transparent_42%)] [background-size:48px_48px,48px_48px,100%_100%]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent"
        />

        <header className="relative z-40 mx-auto max-w-3xl text-center lg:absolute lg:left-1/2 lg:top-[6%] lg:w-full lg:-translate-x-1/2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-accent sm:text-xs">
            {eyebrow}
          </p>
          <h2
            id="clientes-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-[clamp(2rem,3.1vw,3.25rem)]"
          >
            {headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm font-light leading-relaxed text-ink-300 sm:text-base">
            {subtitle}
          </p>
        </header>

        <div
          ref={wordmarkRef}
          className="relative z-30 mx-auto mb-10 mt-12 flex w-[min(68vw,290px)] items-center justify-center rounded-2xl border border-white/10 bg-black/25 px-6 py-5 shadow-[0_25px_90px_-35px_rgba(14,102,255,0.75)] backdrop-blur-xl lg:absolute lg:left-1/2 lg:top-[52%] lg:m-0 lg:w-[clamp(230px,21vw,330px)] lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          <Image
            src={infodiveWordmark}
            alt="Infodive IT"
            priority={false}
            sizes="(min-width: 1024px) 330px, 290px"
            className="h-auto w-full object-contain"
          />
        </div>

        <ul
          aria-label="Clientes da Infodive"
          className="relative z-20 mx-auto grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-3 lg:absolute lg:inset-0 lg:block lg:max-w-none"
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
            className="relative z-30 mx-auto mt-6 min-h-[132px] max-w-2xl rounded-xl border border-white/10 bg-white/[0.055] p-5 text-center backdrop-blur-md lg:hidden"
          >
            {selectedClient ? (
              <>
                <p className="text-base font-semibold text-white">{selectedClient.nome}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">
                  {selectedClient.segmento}
                </p>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-300">
                  {selectedClient.descricaoCurta}
                </p>
              </>
            ) : (
              <p className="flex min-h-[90px] items-center justify-center text-sm text-ink-300">
                Toque em uma marca para conhecer
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
