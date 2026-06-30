'use client'

import { useEffect, useState } from 'react'
import { Megaphone, X } from 'lucide-react'
import { toast } from '@/lib/toast'
import { getPusher, CH_BROADCAST } from '@/lib/pusherClient'

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
      {popup && (
        <div className="fixed inset-0 z-[690] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(5px)' }} onClick={() => setPopup(null)}>
          <div className="rounded-2xl w-full max-w-sm overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border3)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', animation: 'pop-in 180ms cubic-bezier(0.16,1,0.3,1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 3, background: '#eab308' }} />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span style={{ width: 7, height: 7, borderRadius: 9999, background: '#eab308' }} />
                  <span style={{ color: 'var(--c-text3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mensaje de Parqueo</span>
                </div>
                <button onClick={() => setPopup(null)} style={{ color: 'var(--c-text4)' }} className="hover:text-white transition-colors"><X size={17} /></button>
              </div>
              <p className="text-white" style={{ fontSize: 15.5, lineHeight: 1.6, fontWeight: 450 }}>{popup}</p>
              <div className="flex justify-end mt-7">
                <button onClick={() => setPopup(null)} className="px-5 py-2.5 rounded-full font-semibold transition-colors" style={{ background: 'var(--c-border)', border: '1px solid var(--c-border3)', color: 'var(--c-text)', fontSize: 13.5, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-border3)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-border)')}>
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
