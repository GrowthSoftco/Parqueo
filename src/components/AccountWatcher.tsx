'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Escucha cambios de la cuenta (estado/plan) en tiempo real y refresca.
// Si el operador banea/suspende o cambia el plan, se refleja al instante.
export default function AccountWatcher() {
  const router = useRouter()
  useEffect(() => {
    const es = new EventSource('/api/account/stream')
    es.onmessage = () => router.refresh()
    return () => es.close()
  }, [router])
  return null
}
