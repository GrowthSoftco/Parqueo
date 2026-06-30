'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPusher, chTenant } from '@/lib/pusherClient'

// Escucha cambios de la cuenta (estado/plan) en tiempo real y refresca.
// Si el operador banea/suspende o cambia el plan, se refleja al instante.
export default function AccountWatcher({ tenantId }: { tenantId?: string }) {
  const router = useRouter()
  useEffect(() => {
    if (!tenantId) return
    const p = getPusher()
    if (!p) return
    const canal = chTenant(tenantId)
    const ch = p.subscribe(canal)
    ch.bind('changed', () => router.refresh())
    return () => { ch.unbind('changed'); p.unsubscribe(canal) }
  }, [tenantId, router])
  return null
}
