import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ClientsStage } from '../clients-stage'

jest.mock('gsap', () => {
  const timeline = {
    to: jest.fn(),
    fromTo: jest.fn(),
  }
  const contextRevert = jest.fn()
  const gsapMock = {
    registerPlugin: jest.fn(),
    set: jest.fn(),
    context: jest.fn((callback: () => void) => {
      callback()
      return { revert: contextRevert }
    }),
    timeline: jest.fn((config: { scrollTrigger: { onUpdate: (self: { progress: number }) => void } }) => {
      gsapMock.scrollTriggerConfig = config.scrollTrigger
      return timeline
    }),
    scrollTriggerConfig: null as null | {
      onUpdate: (self: { progress: number }) => void
    },
    contextRevert,
    timelineInstance: timeline,
  }

  return { gsap: gsapMock }
})

jest.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { refresh: jest.fn() },
}))

type GsapMock = typeof gsap & {
  contextRevert: jest.Mock
  scrollTriggerConfig: null | {
    onUpdate: (self: { progress: number }) => void
  }
}

const mockedGsap = gsap as GsapMock
const mockedRefresh = ScrollTrigger.refresh as jest.Mock
let animationFrames: FrameRequestCallback[] = []

const clients = Array.from({ length: 6 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  nome: `Cliente ${index + 1}`,
  segmento: 'Tecnologia',
  descricaoCurta: `Descrição segura do cliente ${index + 1}.`,
  logoUrl: `https://example.supabase.co/client-${index + 1}.webp`,
  ordem: index + 1,
}))

function mockMediaQueries({ desktop = false, reducedMotion = false } = {}) {
  window.matchMedia = jest.fn((query: string) => ({
    matches: query === '(min-width: 1024px)' ? desktop : reducedMotion,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}

function renderStage(currentClients = clients) {
  return render(
    <ClientsStage
      clients={currentClients}
      eyebrow="Clientes"
      headline="Tecnologia que sustenta parcerias duradouras"
      subtitle="Organizações de diferentes setores."
    />,
  )
}

describe('ClientsStage', () => {
  beforeEach(() => {
    mockMediaQueries()
    mockedGsap.scrollTriggerConfig = null
    mockedGsap.contextRevert.mockClear()
    mockedRefresh.mockClear()
    ;(gsap.context as jest.Mock).mockClear()
    ;(gsap.timeline as jest.Mock).mockClear()
    ;(gsap.set as jest.Mock).mockClear()
    animationFrames = []
    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      animationFrames.push(callback)
      return animationFrames.length
    })
    window.cancelAnimationFrame = jest.fn()
  })

  it('expõe a lista e liga cada controle ao painel estável no mobile', async () => {
    const user = userEvent.setup()
    renderStage()

    expect(screen.getByRole('list', { name: 'Clientes da Infodive' })).toBeInTheDocument()
    expect(screen.getByText('Toque em uma marca para conhecer')).toBeInTheDocument()

    const firstClient = screen.getByRole('button', { name: 'Conhecer Cliente 1' })
    const detailRegion = screen.getByRole('region', {
      name: 'Detalhes do cliente selecionado',
    })
    await waitFor(() => expect(firstClient).toHaveAttribute('tabindex', '0'))

    expect(firstClient).toHaveAttribute('aria-controls', detailRegion.id)
    expect(firstClient).toHaveAttribute('aria-expanded', 'false')
    expect(firstClient).not.toHaveAttribute('aria-describedby')

    await user.click(firstClient)

    expect(firstClient).toHaveAttribute('aria-expanded', 'true')
    expect(firstClient).not.toHaveAttribute('aria-describedby')
    expect(detailRegion).toHaveTextContent('Cliente 1')
    expect(detailRegion).toHaveTextContent('Descrição segura do cliente 1.')

    await user.click(firstClient)
    expect(firstClient).toHaveAttribute('aria-expanded', 'false')
    expect(detailRegion).toHaveTextContent('Toque em uma marca para conhecer')
  })

  it('oculta toda a seção quando uma falha deixa menos de seis logos válidas', () => {
    const { container } = renderStage()

    const firstLogo = container.querySelector('img[src*="client-1.webp"]')
    expect(firstLogo).not.toBeNull()
    fireEvent.error(firstLogo as HTMLImageElement)

    expect(screen.queryByRole('list', { name: 'Clientes da Infodive' })).not.toBeInTheDocument()
  })

  it('tenta novamente uma logo corrigida com o mesmo id', () => {
    const { container, rerender } = renderStage()
    const firstLogo = container.querySelector('img[src*="client-1.webp"]')
    fireEvent.error(firstLogo as HTMLImageElement)
    expect(screen.queryByRole('list', { name: 'Clientes da Infodive' })).not.toBeInTheDocument()

    const correctedClients = clients.map((client, index) =>
      index === 0
        ? { ...client, logoUrl: 'https://example.supabase.co/client-1-corrected.webp' }
        : client,
    )
    rerender(
      <ClientsStage
        clients={correctedClients}
        eyebrow="Clientes"
        headline="Tecnologia que sustenta parcerias duradouras"
        subtitle="Organizações de diferentes setores."
      />,
    )

    expect(screen.getByRole('list', { name: 'Clientes da Infodive' })).toBeInTheDocument()
    expect(container.querySelector('img[src*="client-1-corrected.webp"]')).not.toBeNull()
  })

  it('mantém a composição estática e a interação imediata com movimento reduzido', async () => {
    mockMediaQueries({ desktop: true, reducedMotion: true })
    renderStage()

    const firstClient = screen.getByRole('button', { name: 'Conhecer Cliente 1' })
    await waitFor(() => expect(firstClient).toHaveAttribute('tabindex', '0'))

    expect(gsap.context).not.toHaveBeenCalled()
    expect(mockedRefresh).not.toHaveBeenCalled()
  })

  it('habilita no limiar de 70%, reverte abaixo dele e limpa o contexto', async () => {
    mockMediaQueries({ desktop: true })
    const { unmount } = renderStage()
    const firstClient = screen.getByRole('button', { name: 'Conhecer Cliente 1' })

    await waitFor(() => expect(mockedGsap.scrollTriggerConfig).not.toBeNull())
    expect(firstClient).toHaveAttribute('tabindex', '-1')

    act(() => animationFrames.shift()?.(0))
    expect(mockedRefresh).toHaveBeenCalledTimes(1)

    act(() => mockedGsap.scrollTriggerConfig?.onUpdate({ progress: 0.7 }))
    expect(firstClient).toHaveAttribute('tabindex', '0')

    fireEvent.focus(firstClient)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Cliente 1')

    act(() => mockedGsap.scrollTriggerConfig?.onUpdate({ progress: 0.69 }))
    expect(firstClient).toHaveAttribute('tabindex', '-1')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    unmount()
    expect(mockedGsap.contextRevert).toHaveBeenCalledTimes(1)
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1)
  })

  it('recria a timeline quando a ordem muda sem alterar a quantidade', async () => {
    mockMediaQueries({ desktop: true })
    const { rerender } = renderStage()
    await waitFor(() => expect(gsap.context).toHaveBeenCalledTimes(1))

    const reordered = [
      { ...clients[1], ordem: 1 },
      { ...clients[0], ordem: 2 },
      ...clients.slice(2),
    ]
    rerender(
      <ClientsStage
        clients={reordered}
        eyebrow="Clientes"
        headline="Tecnologia que sustenta parcerias duradouras"
        subtitle="Organizações de diferentes setores."
      />,
    )

    await waitFor(() => expect(gsap.context).toHaveBeenCalledTimes(2))
    expect(mockedGsap.contextRevert).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole('button')[0]).toHaveAccessibleName('Conhecer Cliente 2')
  })

  it('recria a timeline quando uma URL muda sem alterar a quantidade', async () => {
    mockMediaQueries({ desktop: true })
    const { rerender } = renderStage()
    await waitFor(() => expect(gsap.context).toHaveBeenCalledTimes(1))

    const clientsWithNewUrl = clients.map((client, index) =>
      index === 0
        ? { ...client, logoUrl: 'https://example.supabase.co/client-1-v2.webp' }
        : client,
    )
    rerender(
      <ClientsStage
        clients={clientsWithNewUrl}
        eyebrow="Clientes"
        headline="Tecnologia que sustenta parcerias duradouras"
        subtitle="Organizações de diferentes setores."
      />,
    )

    await waitFor(() => expect(gsap.context).toHaveBeenCalledTimes(2))
    expect(mockedGsap.contextRevert).toHaveBeenCalledTimes(1)
  })
})
