'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, LogIn, LogOut } from 'lucide-react'

export type Actividad = { placa: string; accion: 'Entró' | 'Salió'; detalle: string; hace: string }

export default function NotificationsBell({ items }: { items: Actividad[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors relative"
        style={{ background: '#161616', border: '1px solid #232323', color: open ? '#fff' : '#888' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = open ? '#fff' : '#888')}
      >
        <Bell size={16} />
        {items.length > 0 && <span style={{ position: 'absolute', top: 7, right: 8, width: 6, height: 6, borderRadius: 9999, background: '#22c55e', border: '1px solid #161616' }} />}
      </button>

      <div
        className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-50"
        style={{
          width: 280, background: '#161616', border: '1px solid #262626', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          transformOrigin: 'top right', opacity: open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(-6px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 160ms ease-out, transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: '#222' }}>
          <p className="text-white" style={{ fontSize: '13px', fontWeight: 600 }}>Actividad reciente</p>
        </div>
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p className="text-center" style={{ color: '#555', fontSize: '12.5px', padding: '24px 0' }}>Sin movimientos todavía</p>
          ) : (
            items.map((it, i) => {
              const entrada = it.accion === 'Entró'
              const Icon = entrada ? LogIn : LogOut
              const color = entrada ? '#22c55e' : '#9ca3af'
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < items.length - 1 ? '1px solid #1c1c1c' : 'none' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: entrada ? '#0f2a1a' : '#1c1c1c', border: `1px solid ${color}33` }}>
                    <Icon size={13} color={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-mono" style={{ fontSize: '12.5px' }}>{it.placa} <span style={{ color: '#666', fontWeight: 400 }}>· {it.detalle}</span></p>
                    <p style={{ color: '#555', fontSize: '11px' }}>{it.hace}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
