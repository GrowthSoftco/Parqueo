'use client'

import Pusher from 'pusher-js'

// Pusher del lado del CLIENTE (navegador). Singleton. Devuelve null si no hay
// variables configuradas (la app funciona igual, sin tiempo real).
let client: Pusher | null = null
let intentado = false

export function getPusher(): Pusher | null {
  if (intentado) return client
  intentado = true
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  if (!key || !cluster) return null
  client = new Pusher(key, { cluster })
  return client
}

export const CH_PUBLIC = 'parqueo-public'
export const CH_BROADCAST = 'parqueo-broadcast'
export const chTenant = (id: string) => `tenant-${id}`
