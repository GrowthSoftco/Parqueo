'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, X, CheckCircle2, Printer } from 'lucide-react'
import { registrarSalidaPorPlaca } from '@/app/actions'
import { toast } from '@/lib/toast'
import { ticketSalida, imprimirTicket, type Empresa } from '@/lib/ticket'

const LEN = 6
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')

type Resultado = { placa: string; monto: number; minutos: number; tipoNombre: string; entradaAt: string; salidaAt: string }

const METODOS: Record<string, string[]> = {
  BASICO: ['Efectivo'],
  PRO: ['Efectivo', 'Nequi', 'Daviplata'],
  NEGOCIO: ['Efectivo', 'Nequi', 'Daviplata', 'Tarjeta'],
}

export default function ExitButton({ plan, empresa, autoRecibo }: { plan?: string | null; empresa: Empresa; autoRecibo: boolean }) {
  const metodos = plan ? METODOS[plan] ?? ['Efectivo'] : ['Efectivo']
  const [open, setOpen] = useState(false)
  const [chars, setChars] = useState<string[]>(Array(LEN).fill(''))
  const [intl, setIntl] = useState(false)
  const [intlVal, setIntlVal] = useState('')
  const [result, setResult] = useState<Resultado | null>(null)
  const [metodo, setMetodo] = useState('Efectivo')
  const [paga, setPaga] = useState('')
  const [pending, start] = useTransition()
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const placa = (intl ? intlVal : chars.join('')).trim()

  useEffect(() => {
    if (open && !result && !intl) setTimeout(() => refs.current[0]?.focus(), 50)
  }, [open, result, intl])

  // Abrir desde el buscador (⌘K) con la placa precargada
  useEffect(() => {
    const h = (e: Event) => {
      const placa = (e as CustomEvent).detail?.placa
      if (placa) { setIntl(true); setIntlVal(String(placa)) }
      setResult(null)
      setOpen(true)
    }
    window.addEventListener('parqueo:salida', h)
    return () => window.removeEventListener('parqueo:salida', h)
  }, [])

  const close = () => {
    setOpen(false)
    setChars(Array(LEN).fill(''))
    setIntlVal('')
    setResult(null)
    setMetodo('Efectivo')
    setPaga('')
    router.refresh()
  }

  const setChar = (i: number, val: string) => {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1)
    setChars(prev => {
      const next = [...prev]
      next[i] = v
      return next
    })
    if (v && i < LEN - 1) refs.current[i + 1]?.focus()
  }

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'Enter') submit()
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
    if (!placa) {
      toast('Escribe la placa', 'error')
      return
    }
    start(async () => {
      const res = await registrarSalidaPorPlaca(placa)
      if (res.ok) setResult({ placa: res.placa!, monto: res.monto!, minutos: res.minutos!, tipoNombre: res.tipoNombre!, entradaAt: res.entradaAt!, salidaAt: res.salidaAt! })
      else toast(res.error ?? 'No se pudo registrar la salida', 'error')
    })
  }

  const imprimir = () => {
    if (!result) return
    imprimirTicket(ticketSalida({
      empresa,
      placa: result.placa,
      tipoNombre: result.tipoNombre,
      entradaAt: new Date(result.entradaAt),
      salidaAt: new Date(result.salidaAt),
      minutos: result.minutos,
      monto: result.monto,
      metodo,
      paga: paga ? Number(paga) : undefined,
    }))
  }

  const finalizar = () => {
    if (autoRecibo) imprimir()
    close()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full font-semibold transition-colors"
        style={{ background: 'var(--c-surface2)', border: '1px solid var(--c-border3)', color: 'var(--c-text2)', fontSize: '13px', padding: '8px 16px' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-border)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-surface2)')}
      >
        <LogOut size={15} /> Registrar salida
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={close}>
          <div className="rounded-2xl w-full max-w-md p-7" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border3)' }} onClick={e => e.stopPropagation()}>
            {result ? (
              /* Resultado del cobro */
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: 'color-mix(in srgb, #22c55e 16%, transparent)' }}>
                  <CheckCircle2 size={24} color="#22c55e" />
                </div>
                <p style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Salida registrada · {result.placa}</p>
                <p className="text-white font-bold mt-2" style={{ fontSize: '40px' }}>{fmt(result.monto)}</p>
                <p style={{ color: 'var(--c-text4)', fontSize: '13px', marginBottom: '20px' }}>Tiempo: {result.minutos} min</p>

                {/* Métodos de pago (según plan) */}
                <div className="w-full text-left mb-4">
                  <p style={{ color: 'var(--c-text3)', fontSize: '12px', marginBottom: '8px' }}>Método de pago</p>
                  <div className="flex flex-wrap gap-2">
                    {metodos.map(m => {
                      const on = metodo === m
                      return (
                        <button
                          key={m}
                          onClick={() => setMetodo(m)}
                          className="px-3 py-1.5 rounded-full transition-colors"
                          style={{ background: on ? 'var(--c-text)' : 'var(--c-surface2)', color: on ? 'var(--c-bg)' : 'var(--c-text3)', border: '1px solid var(--c-border3)', fontSize: '12.5px', fontWeight: 500 }}
                        >
                          {m}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Paga con / devuelta (solo efectivo) */}
                {metodo === 'Efectivo' ? (
                  <div className="w-full text-left mb-5">
                    <p style={{ color: 'var(--c-text3)', fontSize: '12px', marginBottom: '8px' }}>Paga con</p>
                    <input
                      value={paga ? '$' + Number(paga).toLocaleString('es-CO') : ''}
                      onChange={e => setPaga(e.target.value.replace(/\D/g, ''))}
                      inputMode="numeric"
                      placeholder="Monto recibido"
                      className="w-full outline-none"
                      style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border2)', borderRadius: 10, color: 'var(--c-text)', padding: '11px 14px', fontSize: 16 }}
                    />
                    {paga &&
                      (Number(paga) - result.monto >= 0 ? (
                        <p style={{ color: '#22c55e', fontSize: 15, fontWeight: 700, marginTop: 12 }}>
                          Devuelta: {fmt(Number(paga) - result.monto)}
                        </p>
                      ) : (
                        <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, marginTop: 12 }}>
                          Faltan {fmt(result.monto - Number(paga))}
                        </p>
                      ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--c-text4)', fontSize: 13, marginBottom: 20 }}>Cobro exacto por {metodo}</p>
                )}

                <div className="w-full flex gap-2">
                  <button onClick={imprimir} className="flex items-center justify-center gap-2 rounded-full py-3 font-semibold transition-colors" style={{ flex: 1, background: 'var(--c-border)', border: '1px solid var(--c-border3)', color: 'var(--c-text)', fontSize: '14px', cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-border3)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-border)')}>
                    <Printer size={15} /> Imprimir
                  </button>
                  <button onClick={finalizar} className="rounded-full py-3 text-black font-semibold" style={{ flex: 1, background: 'var(--c-accent)', fontSize: '14px', cursor: 'pointer' }}>
                    Listo
                  </button>
                </div>
              </div>
            ) : (
              /* Ingreso de placa */
              <>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white" style={{ fontSize: '17px', fontWeight: 600 }}>Registrar salida</p>
                  <button onClick={close} style={{ color: 'var(--c-text4)' }} className="transition-colors hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between mb-5">
                  <p style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Ingresa la placa del vehículo que sale</p>
                  <button
                    onClick={() => setIntl(v => !v)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors shrink-0"
                    style={{ background: intl ? 'var(--c-border)' : 'var(--c-panel)', border: '1px solid var(--c-border2)', color: intl ? 'var(--c-text)' : 'var(--c-text3)', fontSize: '11.5px', fontWeight: 500 }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: intl ? '#ef4444' : 'var(--c-text5)' }} />
                    Internacional
                  </button>
                </div>

                {intl ? (
                  <input
                    autoFocus
                    value={intlVal}
                    onChange={e => setIntlVal(e.target.value.toUpperCase())}
                    onKeyDown={e => { if (e.key === 'Enter') submit() }}
                    placeholder="Placa"
                    className="w-full text-center font-mono outline-none mb-6"
                    style={{ height: 56, background: 'var(--c-panel)', border: '1.5px solid var(--c-border2)', borderRadius: 12, color: 'var(--c-text)', fontSize: 22, fontWeight: 600, letterSpacing: '0.12em' }}
                  />
                ) : (
                  <div className="flex items-center justify-center gap-2 mb-6" onPaste={onPaste}>
                    {Array.from({ length: LEN }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          ref={el => {
                            refs.current[i] = el
                          }}
                          value={chars[i]}
                          onChange={e => setChar(i, e.target.value)}
                          onKeyDown={e => onKey(i, e)}
                          onFocus={e => {
                            e.target.select()
                            e.currentTarget.style.borderColor = '#ef4444'
                          }}
                          onBlur={e => (e.currentTarget.style.borderColor = chars[i] ? '#ef4444' : 'var(--c-border2)')}
                          maxLength={1}
                          className="text-center font-mono outline-none"
                          style={{ width: 46, height: 56, background: 'var(--c-panel)', border: `1.5px solid ${chars[i] ? '#ef4444' : 'var(--c-border2)'}`, borderRadius: 12, color: 'var(--c-text)', fontSize: 22, fontWeight: 600, caretColor: '#ef4444' }}
                        />
                        {i === 2 && <span style={{ color: '#333', fontSize: 20, fontWeight: 700 }}>·</span>}
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={submit} disabled={pending} className="w-full rounded-full py-3 text-black font-semibold transition-opacity" style={{ background: 'var(--c-accent)', fontSize: '14px', opacity: pending ? 0.6 : 1 }}>
                  {pending ? 'Calculando...' : 'Calcular y cobrar'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
