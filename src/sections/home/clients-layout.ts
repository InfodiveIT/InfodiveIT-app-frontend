export type ClientSlot = {
  x: number
  y: number
  scale: number
  rotation: number
}

const PRIMARY_SLOTS: ClientSlot[] = [
  { x: 33, y: 38, scale: 0.95, rotation: -1 },
  { x: 67, y: 38, scale: 0.95, rotation: 1 },
  { x: 33, y: 68, scale: 0.95, rotation: 1 },
  { x: 67, y: 68, scale: 0.95, rotation: -1 },
  { x: 18, y: 53, scale: 0.9, rotation: -0.5 },
  { x: 82, y: 53, scale: 0.9, rotation: 0.5 },
]

const EXTRA_PAIRS: ClientSlot[][] = [
  [
    { x: 44, y: 26, scale: 0.9, rotation: 0.5 },
    { x: 56, y: 80, scale: 0.9, rotation: -0.5 },
  ],
  [
    { x: 56, y: 26, scale: 0.9, rotation: -0.5 },
    { x: 44, y: 80, scale: 0.9, rotation: 0.5 },
  ],
  [
    { x: 20, y: 36, scale: 0.88, rotation: -1 },
    { x: 80, y: 36, scale: 0.88, rotation: 1 },
  ],
]

const ODD_SLOT: ClientSlot = { x: 50, y: 80, scale: 0.9, rotation: 0 }

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
