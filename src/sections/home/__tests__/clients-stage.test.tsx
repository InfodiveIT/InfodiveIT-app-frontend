import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientsStage } from '../clients-stage'

// Mock para AnimatedBeam
jest.mock('@/components/animations/animated-beam', () => ({
  AnimatedBeam: () => <div data-testid="animated-beam" />,
}))

const clients = Array.from({ length: 6 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  nome: `Cliente ${index + 1}`,
  segmento: 'Tecnologia',
  descricaoCurta: `Descrição segura do cliente ${index + 1}.`,
  logoUrl: `https://example.supabase.co/client-${index + 1}.webp`,
  ordem: index + 1,
}))

function mockMediaQueries(desktop = false) {
  window.matchMedia = jest.fn((query: string) => ({
    matches: query === '(min-width: 1024px)' ? desktop : false,
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
    mockMediaQueries(false)
  })

  it('expõe a lista e liga cada controle ao painel no mobile', async () => {
    const user = userEvent.setup()
    renderStage()

    expect(screen.getByRole('list', { name: 'Clientes da Infodive' })).toBeInTheDocument()
    expect(screen.getByText('Toque em uma marca para conhecer')).toBeInTheDocument()

    const firstClient = screen.getAllByRole('button', { name: 'Conhecer Cliente 1' })[0]
    const detailRegion = screen.getByRole('region', {
      name: 'Detalhes do cliente selecionado',
    })
    await waitFor(() => expect(firstClient).toHaveAttribute('tabindex', '0'))

    expect(firstClient).toHaveAttribute('aria-controls', detailRegion.id)
    expect(firstClient).toHaveAttribute('aria-expanded', 'false')

    await user.click(firstClient)

    expect(firstClient).toHaveAttribute('aria-expanded', 'true')
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

  it('renderiza os feixes de luz no modo desktop', async () => {
    mockMediaQueries(true)
    const { container } = renderStage()

    await waitFor(() => {
      expect(container.querySelectorAll('[data-testid="animated-beam"]').length).toBeGreaterThan(0)
    })
  })
})
