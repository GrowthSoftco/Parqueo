'use client'

import { useEffect, useState } from 'react'
import { Megaphone, X } from 'lucide-react'
import { toast } from '@/lib/toast'
import { getPusher, CH_BROADCAST } from '@/lib/pusherClient'
import MensajePopup from '@/components/MensajePopup'

// Escucha mensajes del desarrollador (broadcast) y los muestra como
// notch (toast), popup (modal) o banner (barra superior).
export default function BroadcastWatcher({ pusherKey, pusherCluster }: { pusherKey?: string; pusherCluster?: string }) {
  const [popup, setPopup] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    const p = getPusher(pusherKey, pusherCluster)
    if (!p) return
    const ch = p.subscribe(CH_BROADCAST)
    ch.bind('message', (data: { message?: string; kind?: string }) => {
      const { message, kind } = data || {}
      if (!message) return
      if (kind === 'popup') setPopup(message)
      else if (kind === 'banner') setBanner(message)
      else toast(message, 'dev')
    })
    return () => { ch.unbind('message'); p.unsubscribe(CH_BROADCAST) }
  }, [pusherKey, pusherCluster])

  return (
    <>
      {/* Banner superior */}
      {banner && (
        <div
          className="fixed left-0 right-0 z-[680] flex items-center justify-center gap-3 px-6"
          style={{ top: 0, height: 44, background: '#1c160a', borderBottom: '1px solid #eab30855' }}
        >
          <Megaphone size={15} color="#eab308" />
          <span style={{ color: '#f0d97a', fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner}</span>
          <button onClick={() => setBanner(null)} className="ml-2 transition-colors" style={{ color: '#a08b3a' }} onMouseEnter={e => (e.currentTarget.style.color = '#eab308')} onMouseLeave={e => (e.currentTarget.style.color = '#a08b3a')}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Popup modal */}
      {popup && <MensajePopup message={popup} onClose={() => setPopup(null)} />}
    </>
  )
}
