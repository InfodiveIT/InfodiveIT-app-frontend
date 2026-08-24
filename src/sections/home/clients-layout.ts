export type ClientSlot = {
  x: number
  y: number
  scale: number
  rotation: number
}

const PRIMARY_SLOTS: ClientSlot[] = [
  { x: 21, y: 36, scale: 1, rotation: -2 },
  { x: 79, y: 36, scale: 1, rotation: 2 },
  { x: 23, y: 69, scale: 0.95, rotation: 1.5 },
  { x: 77, y: 69, scale: 0.95, rotation: -1.5 },
  { x: 7, y: 52, scale: 0.86, rotation: -1 },
  { x: 93, y: 52, scale: 0.86, rotation: 1 },
]

const EXTRA_PAIRS: ClientSlot[][] = [
  [
    { x: 38, y: 32, scale: 0.82, rotation: 1 },
    { x: 62, y: 77, scale: 0.82, rotation: -1 },
  ],
  [
    { x: 14, y: 84, scale: 0.78, rotation: -2 },
    { x: 92, y: 32, scale: 0.78, rotation: 2 },
  ],
  [
    { x: 38, y: 78, scale: 0.76, rotation: -1.5 },
    { x: 62, y: 32, scale: 0.76, rotation: 1.5 },
  ],
]

const ODD_SLOT: ClientSlot = { x: 50, y: 88, scale: 0.8, rotation: 0 }

export function getClientSlots(count: number): ClientSlot[] {
  if (!Number.isInteger(count) || count < 6 || count > 12) {
    throw new RangeError('A composição de clientes aceita entre 6 e 12 itens')
  }

  const slots = [...PRIMARY_SLOTS]
  let remaining = count - PRIMARY_SLOTS.length
  let pairIndex = 0

  while (remaining >= 2) {
    slots.push(...EXTRA_PAIRS[pairIndex])
    remaining -= 2
    pairIndex += 1
  }

  if (remaining === 1) {
    slots.push(ODD_SLOT)
  }

  return slots
}
