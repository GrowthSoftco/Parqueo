'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { crearSuscripcion } from '@/app/actions'

const inputStyle: React.CSSProperties = {
  background: 'var(--c-panel)', border: '1px solid var(--c-border2)', borderRadius: '8px',
  color: 'var(--c-text)', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%',
}

const planes = [
  { id: 'MENSUAL', label: 'Mensual', monto: 180000 },
  { id: 'SEMANAL', label: 'Semanal', monto: 40000 },
  { id: 'NOCTURNA', label: 'Nocturna', monto: 90000 },
  { id: 'DIARIA', label: 'Diaria', monto: 8000 },
] as const

export default function NuevaSuscripcionButton() {
  const LEN = 6
  const [open, setOpen] = useState(false)
  const [chars, setChars] = useState<string[]>(Array(LEN).fill(''))
  const [intl, setIntl] = useState(false)
  const [intlVal, setIntlVal] = useState('')
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const placa = (intl ? intlVal : chars.join('')).trim()
  const [cliente, setCliente] = useState('')
  const [tel, setTel] = useState('')
  const [plan, setPlan] = useState<(typeof planes)[number]['id']>('MENSUAL')
  const [monto, setMonto] = useState('180000')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const close = () => { setOpen(false); setChars(Array(LEN).fill('')); setIntlVal(''); setCliente(''); setTel(''); setPlan('MENSUAL'); setMonto('180000'); setError('') }
  const pickPlan = (p: (typeof planes)[number]) => { setPlan(p.id); setMonto(String(p.monto)) }

  const setChar = (i: number, val: string) => {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1)
    setChars(prev => { const next = [...prev]; next[i] = v; return next })
    if (v && i < LEN - 1) refs.current[i + 1]?.focus()
  }
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, LEN)
    if (!text) return
    e.preventDefault()
    const next = Array(LEN).fill('')
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setChars(next)
    refs.current[Math.min(text.length, LEN - 1)]?.focus()
  }

  const submit = () => {
    if (!placa.trim() || !cliente.trim()) { setError('Placa y cliente requeridos'); return }
    start(async () => {
      const res = await crearSuscripcion({ placa, cliente, tel, plan, monto: parseInt(monto) || 0 })
      if (res.ok) { close(); router.refresh() } else setError(res.error ?? 'Error')
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-black font-semibold" style={{ background: 'var(--c-accent)', fontSize: '13px' }}>
        <Plus size={15} strokeWidth={2.5} /> Nueva suscripción
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={close}>
          <div className="rounded-2xl w-full max-w-sm p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border3)' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>Nueva suscripción</p>
              <button onClick={close} style={{ color: 'var(--c-text4)' }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Placa</label>
                  <button
                    onClick={() => { setIntl(v => !v); setError('') }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors"
                    style={{ background: intl ? 'var(--c-border)' : 'var(--c-panel)', border: '1px solid var(--c-border2)', color: intl ? 'var(--c-text)' : 'var(--c-text3)', fontSize: '11px', fontWeight: 500 }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: 9999, background: intl ? '#3b82f6' : 'var(--c-text5)' }} />
                    Internacional
                  </button>
                </div>
                {intl ? (
                  <input
                    value={intlVal}
                    onChange={e => setIntlVal(e.target.value.toUpperCase())}
                    placeholder="Placa"
                    className="text-center font-mono outline-none"
                    style={{ height: 48, background: 'var(--c-panel)', border: '1.5px solid var(--c-border2)', borderRadius: 10, color: 'var(--c-text)', fontSize: 18, fontWeight: 600, letterSpacing: '0.1em' }}
                  />
                ) : (
                  <div className="flex items-center justify-center gap-1.5" onPaste={onPaste}>
                    {Array.from({ length: LEN }).map((_, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <input
                          ref={el => { refs.current[i] = el }}
                          value={chars[i]}
                          onChange={e => setChar(i, e.target.value)}
                          onKeyDown={e => onKey(i, e)}
                          onFocus={e => e.target.select()}
                          maxLength={1}
                          className="text-center font-mono outline-none"
                          style={{ width: 40, height: 48, background: 'var(--c-panel)', border: `1.5px solid ${chars[i] ? '#3b82f6' : 'var(--c-border2)'}`, borderRadius: 10, color: 'var(--c-text)', fontSize: 17, fontWeight: 600 }}
                        />
                        {i === 2 && <span style={{ color: '#333', fontSize: 17, fontWeight: 700 }}>·</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Cliente</label>
                <input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nombre del cliente" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Teléfono</label>
                <input value={tel} onChange={e => setTel(e.target.value)} placeholder="300 123 4567" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {planes.map(p => {
                    const on = plan === p.id
                    return (
                      <button key={p.id} onClick={() => pickPlan(p)} className="py-2 rounded-lg transition-all" style={{ background: on ? 'var(--c-border)' : 'var(--c-panel)', border: on ? '1px solid #3b82f6' : '1px solid var(--c-border2)', color: on ? 'var(--c-text)' : 'var(--c-text3)', fontSize: '13px' }}>
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Monto (COP)</label>
                <input value={monto} onChange={e => setMonto(e.target.value.replace(/\D/g, ''))} inputMode="numeric" style={inputStyle} />
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}
              <button onClick={submit} disabled={pending} className="w-full rounded-full py-2.5 mt-1 text-black font-semibold" style={{ background: 'var(--c-accent)', fontSize: '14px', opacity: pending ? 0.6 : 1 }}>
                {pending ? 'Guardando...' : 'Crear suscripción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
