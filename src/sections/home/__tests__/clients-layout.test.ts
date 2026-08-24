import { getClientSlots } from '../clients-layout'

describe('getClientSlots', () => {
  it.each([6, 7, 8, 9, 10, 11, 12])('retorna um slot para cada um dos %i clientes', (count) => {
    expect(getClientSlots(count)).toHaveLength(count)
  })

  it.each([7, 9, 11])('usa o slot inferior central para a quantidade ímpar %i', (count) => {
    expect(getClientSlots(count).at(-1)).toMatchObject({ x: 50, y: 88 })
  })

  it('mantém os três slots superiores abaixo do cabeçalho', () => {
    const slots = getClientSlots(12)

    expect([slots[6], slots[9], slots[11]]).toEqual([
      { x: 38, y: 32, scale: 0.82, rotation: 1 },
      { x: 92, y: 32, scale: 0.78, rotation: 2 },
      { x: 62, y: 32, scale: 0.76, rotation: 1.5 },
    ])
  })

  it.each([0, 5, 13, 6.5])('rejeita a quantidade inválida %s', (count) => {
    expect(() => getClientSlots(count)).toThrow(RangeError)
  })
})
