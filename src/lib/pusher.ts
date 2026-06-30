import Pusher from 'pusher'

// Pusher del lado del SERVIDOR. Si no hay variables configuradas, no hace nada
// (la app sigue funcionando, solo sin tiempo real).
const g = globalThis as unknown as { _pusher?: Pusher | null }

function getServerPusher(): Pusher | null {
  if (g._pusher !== undefined) return g._pusher
  const appId = process.env.PUSHER_APP_ID
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const secret = process.env.PUSHER_SECRET
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  g._pusher = appId && key && secret && cluster ? new Pusher({ appId, key, secret, cluster, useTLS: true }) : null
  return g._pusher
}

// Canales/eventos
export const CH_PUBLIC = 'parqueo-public'
export const CH_BROADCAST = 'parqueo-broadcast'
export const chTenant = (id: string) => `tenant-${id}`

export async function pushEvent(channel: string, event: string, data: unknown) {
  const p = getServerPusher()
  if (!p) return
  try {
    await p.trigger(channel, event, data)
  } catch {
    // silencioso: el tiempo real no debe tumbar una acción
  }
}
