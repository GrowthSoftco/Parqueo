'use client'

import Pusher from 'pusher-js'

// Pusher del lado del CLIENTE. Recibe key/cluster (los provee el servidor),
// así no dependemos de que las NEXT_PUBLIC_ se inyecten en el build.
let client: Pusher | null = null
let lastKey: string | null = null

export function getPusher(key?: string, cluster?: string): Pusher | null {
  if (!key || !cluster) return null
  if (client && lastKey === key) return client
  client = new Pusher(key, { cluster })
  lastKey = key
  return client
}

export const CH_PUBLIC = 'parqueo-public'
export const CH_BROADCAST = 'parqueo-broadcast'
export const chTenant = (id: string) => `tenant-${id}`
