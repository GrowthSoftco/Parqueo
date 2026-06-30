'use client'

import { useState, useTransition } from 'react'
import { Megaphone, Send, X, Check } from 'lucide-react'
import { enviarMensajeGlobal, type MensajeKind } from '@/app/admin-actions'
import { toast } from '@/lib/toast'

const TIPOS: { kind: MensajeKind; label: string; desc: string }[] = [
  { kind: 'notch', label: 'Notch', desc: 'Aviso breve que desaparece solo' },
  { kind: 'popup', label: 'Popup', desc: 'Ventana que el usuario cierra' },
  { kind: 'banner', label: 'Banner', desc: 'Barra fija arriba' },
]

// Mini representación de cada tipo (para el selector)
function Glyph({ kind, on }: { kind: MensajeKind; on: boolean }) {
  const c = on ? 'var(--c-text)' : 'var(--c-text5)'
  return (
    <div className="relative w-full rounded-md overflow-hidden" style={{ height: 38, background: 'var(--c-bg)', border: '1px solid var(--c-surface3)' }}>
      {kind === 'notch' && <div style={{ position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)', width: 30, height: 7, borderRadius: 9999, background: c }} />}
      {kind === 'banner' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 9, background: c }} />}
      {kind === 'popup' && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 26, height: 18, borderRadius: 4, background: c }} />}
    </div>
  )
}

export default function MensajeComposer() {
  const [kind, setKind] = useState<MensajeKind>('notch')
  const [msg, setMsg] = useState('')
  const [pending, start] = useTransition()
  const texto = msg.trim()
  const limite = kind === 'notch' ? 90 : 240

  const enviar = () => {
    if (!texto) return
    start(async () => {
      const res = await enviarMensajeGlobal(texto, kind)
      if (res.ok) { toast('Mensaje enviado a todos los parqueaderos', 'success'); setMsg('') }
      else toast(res.error ?? 'No se pudo enviar', 'error')
    })
  }

  const preview = texto || 'Tu mensaje se verá aquí…'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Composer */}
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-white" style={{ fontSize: 13, fontWeight: 600, marginBottom: 11 }}>Cómo se muestra</p>
          <div className="grid grid-cols-3 gap-2.5">
            {TIPOS.map(t => {
              const on = kind === t.kind
              return (
                <button
                  key={t.kind}
                  onClick={() => setKind(t.kind)}
                  className="rounded-xl p-3 text-left transition-colors"
                  style={{ background: on ? 'var(--c-surface2)' : 'var(--c-panel)', border: `1px solid ${on ? 'var(--c-text5)' : 'var(--c-border)'}` }}
                >
                  <Glyph kind={t.kind} on={on} />
                  <div className="flex items-center justify-between gap-1" style={{ marginTop: 10 }}>
                    <p style={{ color: on ? 'var(--c-text)' : 'var(--c-text2)', fontSize: 13, fontWeight: 600 }}>{t.label}</p>
                    {on && (
                      <span className="flex items-center justify-center shrink-0" style={{ width: 15, height: 15, borderRadius: 9999, background: 'var(--c-accent)', color: 'var(--c-on-accent)' }}>
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--c-text4)', fontSize: 11, marginTop: 2, lineHeight: 1.35 }}>{t.desc}</p>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-white" style={{ fontSize: 13, fontWeight: 600, marginBottom: 11 }}>Mensaje</p>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            maxLength={limite}
            rows={kind === 'notch' ? 2 : 4}
            placeholder="Ej: Mantenimiento programado esta noche a las 11 pm"
            className="w-full outline-none resize-none transition-colors"
            style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border2)', borderRadius: 12, color: 'var(--c-text)', padding: '13px 15px', fontSize: 14, lineHeight: 1.5 }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--c-text5)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--c-border2)')}
          />
          <div className="flex items-center justify-between mt-2.5">
            <span style={{ color: 'var(--c-text5)', fontSize: 11.5 }}>Llega en vivo a todos los parqueaderos conectados</span>
            <span style={{ color: msg.length >= limite ? '#eab308' : 'var(--c-text5)', fontSize: 11.5 }}>{msg.length}/{limite}</span>
          </div>
        </div>

        <button
          onClick={enviar}
          disabled={pending || !texto}
          className="flex items-center justify-center gap-2 rounded-full py-3.5 text-black font-semibold transition-transform hover:scale-[1.01]"
          style={{ background: 'var(--c-accent)', fontSize: 14, opacity: pending || !texto ? 0.45 : 1, cursor: pending || !texto ? 'default' : 'pointer' }}
        >
          <Send size={15} /> {pending ? 'Enviando…' : 'Enviar a todos'}
        </button>
      </div>

      {/* Vista previa: ventana de la app */}
      <div>
        <p className="text-white" style={{ fontSize: 13, fontWeight: 600, marginBottom: 11 }}>Vista previa</p>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#060606', border: '1px solid var(--c-surface3)' }}>
          {/* titlebar */}
          <div className="flex items-center gap-1.5 px-3.5" style={{ height: 30, borderBottom: '1px solid var(--c-surface2)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 9999, background: '#ef4d4d' }} />
            <span style={{ width: 9, height: 9, borderRadius: 9999, background: '#f5bf4f' }} />
            <span style={{ width: 9, height: 9, borderRadius: 9999, background: '#5bc46b' }} />
          </div>

          {/* body */}
          <div className="relative" style={{ height: 280, padding: 16 }}>
            {/* esqueleto tenue de la app */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 0%, var(--c-panel), #060606 70%)' }} />
            <div className="absolute" style={{ left: 16, top: 22, display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.5 }}>
              <div style={{ width: 130, height: 9, borderRadius: 5, background: 'var(--c-surface3)' }} />
              <div style={{ width: 90, height: 7, borderRadius: 5, background: 'var(--c-surface2)' }} />
            </div>
            <div className="absolute grid grid-cols-3 gap-2" style={{ left: 16, right: 16, top: 64, opacity: 0.5 }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 38, borderRadius: 8, background: 'var(--c-panel)', border: '1px solid var(--c-surface2)' }} />)}
            </div>

            {/* Mensaje en posición */}
            {kind === 'notch' && (
              <div className="absolute" style={{ top: 12, left: '50%', transform: 'translateX(-50%)', maxWidth: '92%' }}>
                <div className="flex items-center gap-2.5" style={{ background: 'var(--c-bg)', border: '1px solid #eab30855', borderRadius: 9999, padding: '8px 13px', boxShadow: '0 12px 40px rgba(234,179,8,0.14)' }}>
                  <span className="flex items-center justify-center shrink-0" style={{ width: 20, height: 20, borderRadius: 9999, background: '#eab3081f', color: '#eab308' }}><Megaphone size={12} /></span>
                  <span style={{ color: '#f0d97a', fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{preview}</span>
                </div>
              </div>
            )}

            {kind === 'banner' && (
              <div className="absolute flex items-center justify-center gap-2.5" style={{ top: 0, left: 0, right: 0, height: 38, background: '#1c160a', borderBottom: '1px solid #eab30855' }}>
                <Megaphone size={13} color="#eab308" />
                <span style={{ color: '#f0d97a', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '78%' }}>{preview}</span>
                <X size={12} color="#a08b3a" />
              </div>
            )}

            {kind === 'popup' && (
              <>
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }} />
                <div className="absolute overflow-hidden" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 224, borderRadius: 16, background: 'var(--c-surface)', border: '1px solid var(--c-border2)' }}>
                  <div className="flex flex-col items-center text-center" style={{ padding: '18px 18px 14px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.svg" alt="" width={22} height={22} style={{ marginBottom: 9 }} />
                    <div className="flex items-center gap-1.5">
                      <span style={{ width: 5, height: 5, borderRadius: 9999, background: '#eab308' }} />
                      <span style={{ color: 'var(--c-text3)', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Mensaje de Parqueo</span>
                    </div>
                  </div>
                  <div className="h-px mx-5" style={{ background: 'var(--c-border)' }} />
                  <div style={{ padding: '14px 18px' }}>
                    <p className="text-center text-white" style={{ fontSize: 11.5, lineHeight: 1.55 }}>{preview}</p>
                  </div>
                  <div style={{ padding: '0 14px 14px' }}>
                    <div className="w-full rounded-full text-center" style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)', fontSize: 11, fontWeight: 600, padding: '8px' }}>Entendido</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
