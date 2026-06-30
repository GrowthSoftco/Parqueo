'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

// Cada tema con colores representativos para pintar el preview
// (independiente del tema activo). Deben coincidir con globals.css.
export const TEMAS = [
  { id: 'parqueo', nombre: 'Parqueo', bg: '#000000', surface: '#141414', border: '#1e1e1e', text: '#ffffff', accent: '#ffffff', claro: false },
  { id: 'medianoche', nombre: 'Medianoche', bg: '#060912', surface: '#111728', border: '#1e2942', text: '#eef2fb', accent: '#3b82f6', claro: false },
  { id: 'pizarra', nombre: 'Pizarra', bg: '#0b0e12', surface: '#1a1f27', border: '#2a323e', text: '#f1f4f8', accent: '#38bdf8', claro: false },
  { id: 'carbon', nombre: 'Carbón', bg: '#000000', surface: '#0c0c0c', border: '#181818', text: '#fafafa', accent: '#ffffff', claro: false },
  { id: 'bosque', nombre: 'Bosque', bg: '#050a07', surface: '#101b14', border: '#1d3325', text: '#eef5ef', accent: '#22c55e', claro: false },
  { id: 'vino', nombre: 'Vino', bg: '#0c0507', surface: '#1f1014', border: '#391d25', text: '#f8eef1', accent: '#f43f5e', claro: false },
  { id: 'ambar', nombre: 'Ámbar', bg: '#0c0903', surface: '#1f1810', border: '#392e1d', text: '#f7f1e6', accent: '#f59e0b', claro: false },
  { id: 'dia', nombre: 'Día', bg: '#ececec', surface: '#ffffff', border: '#e4e4e7', text: '#18181b', accent: '#18181b', claro: true },
] as const

const KEY = 'parqueo-theme'

export function aplicarTema(id: string) {
  document.documentElement.setAttribute('data-theme', id)
  try { localStorage.setItem(KEY, id) } catch {}
}

export default function ThemeSelector() {
  const [activo, setActivo] = useState<string>('parqueo')

  useEffect(() => {
    const t = (() => { try { return localStorage.getItem(KEY) } catch { return null } })()
    setActivo(t || document.documentElement.getAttribute('data-theme') || 'parqueo')
  }, [])

  const elegir = (id: string) => { aplicarTema(id); setActivo(id) }

  return (
    <div>
      <p style={{ color: 'var(--c-text3)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
        Elige el aspecto de la app. Se guarda en este dispositivo y se aplica al instante.
      </p>

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {TEMAS.map(t => {
          const sel = activo === t.id
          return (
            <button
              key={t.id}
              onClick={() => elegir(t.id)}
              className="text-left rounded-xl overflow-hidden transition-all"
              style={{
                border: sel ? '1.5px solid var(--c-accent)' : '1px solid var(--c-border2)',
                background: 'var(--c-surface)',
                padding: 0,
                outline: 'none',
              }}
            >
              {/* Mini preview del tema */}
              <div style={{ background: t.bg, padding: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div className="flex items-center justify-between">
                  <div style={{ display: 'flex', gap: 5 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 9999, background: t.accent }} />
                    <span style={{ width: 9, height: 9, borderRadius: 9999, background: t.text, opacity: 0.5 }} />
                  </div>
                  {sel && (
                    <span className="flex items-center justify-center" style={{ width: 16, height: 16, borderRadius: 9999, background: t.accent }}>
                      <Check size={11} color={t.claro ? '#fff' : (t.id === 'parqueo' || t.id === 'carbon' ? '#000' : '#fff')} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div style={{ height: 8, borderRadius: 4, background: t.surface, border: `1px solid ${t.border}` }} />
                <div style={{ height: 8, width: '70%', borderRadius: 4, background: t.surface, border: `1px solid ${t.border}` }} />
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span style={{ height: 6, width: 24, borderRadius: 9999, background: t.accent }} />
                  <span style={{ height: 6, width: 14, borderRadius: 9999, background: t.text, opacity: 0.25 }} />
                </div>
              </div>
              {/* Nombre */}
              <div className="flex items-center justify-between px-3 py-2.5" style={{ background: 'var(--c-surface)' }}>
                <span style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 600 }}>{t.nombre}</span>
                {t.claro && <span style={{ color: 'var(--c-text4)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em' }}>CLARO</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
