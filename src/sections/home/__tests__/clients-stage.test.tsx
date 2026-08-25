import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientsStage } from '../clients-stage'

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

describe('ClientsStage — Dual Infinite Marquee', () => {
  beforeEach(() => {
    mockMediaQueries(false)
  })

  it('exibe as esteiras de logos e permite abrir detalhes no mobile', async () => {
    const user = userEvent.setup()
    renderStage()

    expect(screen.getByText('Toque em qualquer marca para ver a descrição')).toBeInTheDocument()

    const firstClientButton = screen.getAllByRole('button', { name: 'Conhecer Cliente 1' })[0]
    const detailRegion = screen.getByRole('region', {
      name: 'Detalhes do cliente selecionado',
    })
    await waitFor(() => expect(firstClientButton).toHaveAttribute('tabindex', '0'))

    expect(firstClientButton).toHaveAttribute('aria-controls', detailRegion.id)
    expect(firstClientButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(firstClientButton)

    expect(firstClientButton).toHaveAttribute('aria-expanded', 'true')
    expect(detailRegion).toHaveTextContent('Cliente 1')
    expect(detailRegion).toHaveTextContent('Descrição segura do cliente 1.')

    await user.click(firstClientButton)
    expect(firstClientButton).toHaveAttribute('aria-expanded', 'false')
    expect(detailRegion).toHaveTextContent('Toque em qualquer marca para ver a descrição')
  })

  it('oculta toda a seção quando uma falha deixa menos de seis logos válidas', () => {
    const { container } = renderStage()

    const firstLogo = container.querySelector('img[src*="client-1.webp"]')
    expect(firstLogo).not.toBeNull()
    fireEvent.error(firstLogo as HTMLImageElement)

    expect(screen.queryByRole('heading', { name: 'Tecnologia que sustenta parcerias duradouras' })).not.toBeInTheDocument()
  })

  it('tenta novamente uma logo corrigida com o mesmo id', () => {
    const { container, rerender } = renderStage()
    const firstLogo = container.querySelector('img[src*="client-1.webp"]')
    fireEvent.error(firstLogo as HTMLImageElement)
    expect(screen.queryByRole('heading', { name: 'Tecnologia que sustenta parcerias duradouras' })).not.toBeInTheDocument()

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

    expect(screen.getByRole('heading', { name: 'Tecnologia que sustenta parcerias duradouras' })).toBeInTheDocument()
    expect(container.querySelector('img[src*="client-1-corrected.webp"]')).not.toBeNull()
  })

  it('renderiza os elementos de marquee com as logos duplicadas para loop contínuo', () => {
    mockMediaQueries(true)
    const { container } = renderStage()

    const marqueeCards = container.querySelectorAll('[data-client-card]')
    expect(marqueeCards.length).toBeGreaterThan(6)
  })
})
