import { api } from '@/lib/api'
import { parseHomeClients, parseHomeClientsSection } from './clients-data'
import { ClientsStage } from './clients-stage'

const REQUEST_TIMEOUT_MS = 2_000

export async function Clients() {
  try {
    const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    const [sectionPayload, payload] = await Promise.all([
      api.secaoHome('clientes', signal, true),
      api.homeClientes(signal),
    ])
    const section = parseHomeClientsSection(sectionPayload)
    const clients = parseHomeClients(payload)

    if (!clients || !section) {
      return null
    }

    return (
      <ClientsStage
        clients={clients}
        eyebrow={section.eyebrow}
        headline={section.headline}
        subtitle={section.subtitulo}
      />
    )
  } catch {
    return null
  }
}

export default Clients
