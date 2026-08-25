import { parseHomeClients, parseHomeClientsSection } from '../clients-data'

function makeClient(index: number) {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    nome: `Cliente ${index}`,
    segmento: 'Tecnologia',
    descricaoCurta: `Descrição factual do cliente número ${index}.`,
    logoUrl: `https://example.supabase.co/storage/v1/object/public/clientes/${index}.webp`,
    ordem: index,
  }
}

describe('parseHomeClients', () => {
  it.each([6, 7, 8, 10, 12, 14, 20])('aceita e ordena %i clientes válidos', (count) => {
    const payload = Array.from({ length: count }, (_, index) => makeClient(count - index))
    const result = parseHomeClients(payload)

    expect(result).toHaveLength(count)
    expect(result?.map((client) => client.ordem)).toEqual(
      Array.from({ length: count }, (_, index) => index + 1),
    )
  })

  it('rejeita uma coleção com menos de 6 clientes', () => {
    const payload = Array.from({ length: 5 }, (_, index) => makeClient(index + 1))
    expect(parseHomeClients(payload)).toBeNull()
  })

  it('rejeita IDs duplicados', () => {
    const payload = Array.from({ length: 6 }, (_, index) => makeClient(index + 1))
    payload[5].id = payload[0].id

    expect(parseHomeClients(payload)).toBeNull()
  })

  it('rejeita ordens duplicadas', () => {
    const payload = Array.from({ length: 6 }, (_, index) => makeClient(index + 1))
    payload[5].ordem = payload[0].ordem

    expect(parseHomeClients(payload)).toBeNull()
  })

  it('rejeita logo sem HTTPS', () => {
    const payload = Array.from({ length: 6 }, (_, index) => makeClient(index + 1))
    payload[0].logoUrl = 'http://example.supabase.co/logo.webp'

    expect(parseHomeClients(payload)).toBeNull()
  })
})

describe('parseHomeClientsSection', () => {
  it('normaliza uma configuração editorial válida', () => {
    expect(
      parseHomeClientsSection({
        eyebrow: '  Clientes ',
        headline: ' Tecnologia que sustenta parcerias duradouras ',
        subtitulo: ' Organizações de diferentes setores. ',
        campoNaoUtilizado: 'ignorado',
      }),
    ).toEqual({
      eyebrow: 'Clientes',
      headline: 'Tecnologia que sustenta parcerias duradouras',
      subtitulo: 'Organizações de diferentes setores.',
    })
  })

  it.each([
    null,
    {},
    { eyebrow: 'Clientes', headline: {}, subtitulo: 'Descrição' },
    { eyebrow: 'Clientes', headline: 'Título', subtitulo: [] },
    { eyebrow: '', headline: 'Título', subtitulo: 'Descrição' },
  ])('rejeita configuração editorial malformada: %p', (payload) => {
    expect(parseHomeClientsSection(payload)).toBeNull()
  })
})
