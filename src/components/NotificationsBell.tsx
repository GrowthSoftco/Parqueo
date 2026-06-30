'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

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
        style={{ background: 'var(--c-surface2)', border: '1px solid var(--c-border2)', color: open ? 'var(--c-text)' : 'var(--c-text3)' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = open ? 'var(--c-text)' : 'var(--c-text3)')}
      >
        <Bell size={16} />
        {items.length > 0 && <span style={{ position: 'absolute', top: 7, right: 8, width: 6, height: 6, borderRadius: 9999, background: '#22c55e', border: '1px solid var(--c-surface2)' }} />}
      </button>

      <div
        className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-50"
        style={{
          width: 312, background: 'var(--c-surface)', border: '1px solid var(--c-border2)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
          transformOrigin: 'top right', opacity: open ? 1 : 0,
          transform: open ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(-6px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 160ms ease-out, transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-white" style={{ fontSize: '13px', fontWeight: 600 }}>Actividad reciente</p>
          {items.length > 0 && <span style={{ color: 'var(--c-text5)', fontSize: '11.5px' }}>{items.length}</span>}
        </div>
        <div className="h-px mx-4" style={{ background: 'var(--c-border)' }} />
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p className="text-center" style={{ color: 'var(--c-text5)', fontSize: '12.5px', padding: '28px 0' }}>Sin movimientos todavía</p>
          ) : (
            items.map((it, i) => {
              const entrada = it.accion === 'Entró'
              const Icon = entrada ? ArrowDownLeft : ArrowUpRight
              const color = entrada ? '#3f9e63' : 'var(--c-text4)'
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 transition-colors"
                  style={{ height: 46, borderTop: i === 0 ? 'none' : '1px solid var(--c-surface3)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <Icon size={15} color={color} strokeWidth={2.25} className="shrink-0" />
                  <p className="flex-1 min-w-0 truncate font-mono text-white" style={{ fontSize: '12.5px' }}>
                    {it.placa}<span style={{ color: 'var(--c-text5)', fontWeight: 400 }}> · {it.detalle}</span>
                  </p>
                  <span className="shrink-0" style={{ color: 'var(--c-text5)', fontSize: '11px' }}>{it.hace}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
