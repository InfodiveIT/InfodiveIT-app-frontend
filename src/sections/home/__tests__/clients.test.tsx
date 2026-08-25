import { api } from '@/lib/api'
import { Clients } from '../clients'

jest.mock('@/lib/api', () => ({
  api: {
    secaoHome: jest.fn(),
    homeClientes: jest.fn(),
  },
}))

jest.mock('../clients-stage', () => ({
  ClientsStage: () => null,
}))

const mockedApi = api as unknown as jest.Mocked<
  Pick<typeof api, 'secaoHome' | 'homeClientes'>
>

const clients = Array.from({ length: 6 }, (_, index) => ({
  id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  nome: `Cliente ${index + 1}`,
  segmento: 'Tecnologia',
  descricaoCurta: `Descrição segura do cliente ${index + 1}.`,
  logoUrl: `https://example.supabase.co/client-${index + 1}.webp`,
  ordem: index + 1,
}))

describe('Clients Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedApi.secaoHome.mockResolvedValue({
      secao: 'clientes',
      eyebrow: 'Clientes',
      headline: 'Tecnologia que sustenta parcerias duradouras',
      subtitulo: 'Organizações de diferentes setores.',
    })
    mockedApi.homeClientes.mockResolvedValue(clients)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('compartilha entre as chamadas o sinal com timeout de dois segundos', async () => {
    const timeoutSpy = jest.spyOn(AbortSignal, 'timeout')

    await expect(Clients()).resolves.not.toBeNull()

    expect(timeoutSpy).toHaveBeenCalledWith(2_000)
    const sectionSignal = mockedApi.secaoHome.mock.calls[0][1]
    expect(mockedApi.homeClientes.mock.calls[0][0]).toBe(sectionSignal)
  })

  it('oculta a seção quando uma chamada pública falha', async () => {
    mockedApi.homeClientes.mockRejectedValueOnce(new Error('API indisponível'))

    await expect(Clients()).resolves.toBeNull()
    expect(mockedApi.secaoHome).toHaveBeenCalledWith(
      'clientes',
      expect.any(AbortSignal),
      false,
    )
    expect(mockedApi.homeClientes).toHaveBeenCalledWith(expect.any(AbortSignal))
  })

  it('oculta a seção quando o payload tem menos de seis clientes', async () => {
    mockedApi.homeClientes.mockResolvedValueOnce(clients.slice(0, 5))

    await expect(Clients()).resolves.toBeNull()
  })

  it('oculta a seção quando a configuração editorial está malformada', async () => {
    mockedApi.secaoHome.mockResolvedValueOnce({
      secao: 'clientes',
      eyebrow: 'Clientes',
      headline: {} as unknown as string,
      subtitulo: 'Organizações de diferentes setores.',
    })

    await expect(Clients()).resolves.toBeNull()
  })
})
