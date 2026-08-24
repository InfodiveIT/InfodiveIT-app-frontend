import { getClientSlots } from '../clients-layout'

describe('getClientSlots', () => {
  it.each([6, 7, 8, 9, 10, 11, 12])('retorna um slot para cada um dos %i clientes', (count) => {
    expect(getClientSlots(count)).toHaveLength(count)
  })

  it.each([7, 9, 11])('usa o slot inferior central para a quantidade ímpar %i', (count) => {
    expect(getClientSlots(count).at(-1)).toMatchObject({ x: 50, y: 80 })
  })

  it('mantém os slots superiores em posições harmônicas', () => {
    const slots = getClientSlots(12)

    expect([slots[6], slots[8], slots[10]]).toEqual([
      { x: 44, y: 26, scale: 0.9, rotation: 0.5 },
      { x: 56, y: 26, scale: 0.9, rotation: -0.5 },
      { x: 20, y: 36, scale: 0.88, rotation: -1 },
    ])
  })

  it.each([0, 5, 13, 6.5])('rejeita a quantidade inválida %s', (count) => {
    expect(() => getClientSlots(count)).toThrow(RangeError)
  })
})
