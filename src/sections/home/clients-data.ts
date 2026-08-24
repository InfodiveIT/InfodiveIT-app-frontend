import { z } from 'zod'
import type { ClienteHomeDTO } from '@/lib/api'

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith('https://'), 'A logo precisa usar HTTPS')

export const clienteHomeSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().trim().min(1).max(120),
  segmento: z.string().trim().min(1).max(80),
  descricaoCurta: z.string().trim().min(1).max(220),
  logoUrl: httpsUrl,
  ordem: z.number().int().min(1).max(12),
})

const clientesHomeSectionSchema = z.object({
  eyebrow: z.string().trim().min(1).max(255),
  headline: z.string().trim().min(1).max(255),
  subtitulo: z.string().trim().min(1).max(255),
})

const clientesHomeSchema = z.array(clienteHomeSchema).superRefine((clients, context) => {
  const ids = new Set<string>()
  const orders = new Set<number>()

  clients.forEach((client, index) => {
    if (ids.has(client.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cliente duplicado',
        path: [index, 'id'],
      })
    }

    if (orders.has(client.ordem)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ordem duplicada',
        path: [index, 'ordem'],
      })
    }

    ids.add(client.id)
    orders.add(client.ordem)
  })
})

export function parseHomeClients(payload: unknown): ClienteHomeDTO[] | null {
  const parsed = clientesHomeSchema.safeParse(payload)

  if (!parsed.success || parsed.data.length < 6 || parsed.data.length > 12) {
    return null
  }

  return [...parsed.data].sort(
    (first, second) => first.ordem - second.ordem || first.nome.localeCompare(second.nome, 'pt-BR'),
  )
}

export function parseHomeClientsSection(payload: unknown) {
  const parsed = clientesHomeSectionSchema.safeParse(payload)
  return parsed.success ? parsed.data : null
}
