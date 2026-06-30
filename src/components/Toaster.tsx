'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { AlertCircle, CheckCircle2, Info, Megaphone, X } from 'lucide-react'
import type { ToastType } from '@/lib/toast'

type Toast = { id: number; type: ToastType; message: string; show: boolean }

const CONF: Record<ToastType, { color: string; icon: React.ElementType }> = {
  error: { color: '#ef4444', icon: AlertCircle },
  success: { color: '#22c55e', icon: CheckCircle2 },
  info: { color: '#e5e5e5', icon: Info },
  dev: { color: '#eab308', icon: Megaphone }, // amarillo = mensaje del desarrollador
}

const DURACION = 3500
const DURACION_DEV = 7000

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [expandido, setExpandido] = useState<string | null>(null)
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const quitar = useCallback((id: number) => {
    const t = timers.current.get(id)
    if (t) { clearTimeout(t); timers.current.delete(id) }
    setToasts(prev => prev.map(x => (x.id === id ? { ...x, show: false } : x)))
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 260)
  }, [])

  const programar = useCallback((id: number, ms: number) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.set(id, setTimeout(() => quitar(id), ms))
  }, [quitar])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail as { message: string; type: ToastType }
      if (!message) return
      const id = Date.now() + Math.random()
      const tipo = type ?? 'info'
      setToasts(prev => [...prev, { id, type: tipo, message, show: false }])
      requestAnimationFrame(() => setToasts(prev => prev.map(t => (t.id === id ? { ...t, show: true } : t))))
      programar(id, tipo === 'dev' ? DURACION_DEV : DURACION)
    }
    window.addEventListener('parqueo:toast', handler)
    return () => window.removeEventListener('parqueo:toast', handler)
  }, [programar])

  return (
    <>
      <div className="fixed left-1/2 z-[700] flex flex-col items-center gap-2" style={{ top: 14, transform: 'translateX(-50%)', pointerEvents: 'none' }}>
        {toasts.map(t => {
          const { color, icon: Icon } = CONF[t.type]
          const esDev = t.type === 'dev'
          return (
            <div
              key={t.id}
              className="group flex items-center gap-2.5"
              onClick={() => (esDev ? setExpandido(t.message) : quitar(t.id))}
              onMouseEnter={() => { const x = timers.current.get(t.id); if (x) { clearTimeout(x); timers.current.delete(t.id) } }}
              onMouseLeave={() => programar(t.id, esDev ? DURACION_DEV : DURACION)}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer',
                background: '#0a0a0a',
                border: `1px solid ${esDev ? '#eab30855' : '#242424'}`,
                borderRadius: 9999,
                padding: '9px 12px 9px 12px',
                boxShadow: esDev ? '0 12px 40px rgba(234,179,8,0.12)' : '0 12px 40px rgba(0,0,0,0.55)',
                maxWidth: 'min(86vw, 460px)',
                opacity: t.show ? 1 : 0,
                transform: t.show ? 'translateY(0) scale(1)' : 'translateY(-18px) scale(0.9)',
                transition: 'opacity 240ms ease, transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <span className="flex items-center justify-center shrink-0" style={{ width: 22, height: 22, borderRadius: 9999, background: `${color}1f`, color }}>
                <Icon size={14} strokeWidth={2.4} />
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: esDev ? '#f0d97a' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.message}
              </span>
              {/* X en círculo (aparece al hover) */}
              <button
                onClick={e => { e.stopPropagation(); quitar(t.id) }}
                className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ width: 18, height: 18, borderRadius: 9999, background: '#1f1f1f', border: '1px solid #333', color: '#aaa' }}
                title="Cerrar"
              >
                <X size={11} strokeWidth={2.6} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Popup del mensaje completo (mensaje del desarrollador) */}
      {expandido && (
        <div className="fixed inset-0 z-[710] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setExpandido(null)}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: '#141414', border: '1px solid #2a2a2a', animation: 'pop-in 170ms cubic-bezier(0.16,1,0.3,1)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: 9999, background: '#eab30822', color: '#eab308' }}>
                  <Megaphone size={15} strokeWidth={2.4} />
                </span>
                <p className="text-white" style={{ fontSize: 15, fontWeight: 600 }}>Mensaje de Parqueo</p>
              </div>
              <button onClick={() => setExpandido(null)} style={{ color: '#666' }} className="hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <p style={{ color: '#ddd', fontSize: 14, lineHeight: 1.6 }}>{expandido}</p>
          </div>
        </div>
      )}
    </>
  )
}
