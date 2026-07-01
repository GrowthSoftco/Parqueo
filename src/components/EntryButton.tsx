'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { registrarEntrada } from '@/app/actions'
import { toast } from '@/lib/toast'
import { iconoDe } from '@/lib/vehicleIcons'
import { ticketEntrada, imprimirTicket, type Empresa } from '@/lib/ticket'
import type { TicketCfg } from '@/components/TopBar'

export type Categoria = { id: string; nombre: string; icono: string }

const LEN = 6
const ESTADIAS = [{ id: 'FRACCION', l: 'Por fracción' }, { id: 'DIA', l: 'Día' }, { id: 'PLENA', l: 'Plena' }] as const

export default function EntryButton({ categorias, empresa, autoRecibo, plan, preguntarEstadia, ticketCfg }: { categorias: Categoria[]; empresa: Empresa; autoRecibo: boolean; plan?: string | null; preguntarEstadia?: boolean; ticketCfg?: TicketCfg }) {
  const [open, setOpen] = useState(false)
  const [chars, setChars] = useState<string[]>(Array(LEN).fill(''))
  const [intl, setIntl] = useState(false)
  const [intlVal, setIntlVal] = useState('')
  const [catId, setCatId] = useState<string>(categorias[0]?.id ?? '')
  const [cobroModo, setCobroModo] = useState<string>('FRACCION')
  const [pending, start] = useTransition()
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()

  const placa = (intl ? intlVal : chars.join('')).trim()

  useEffect(() => {
    if (open) setTimeout(() => refs.current[0]?.focus(), 50)
  }, [open])

  // Abrir desde el buscador (⌘K) con la placa precargada
  useEffect(() => {
    const h = (e: Event) => {
      const placa = (e as CustomEvent).detail?.placa
      if (placa) { setIntl(true); setIntlVal(String(placa)) }
      setOpen(true)
    }
    window.addEventListener('parqueo:entrada', h)
    return () => window.removeEventListener('parqueo:entrada', h)
  }, [])

  const close = () => {
    setOpen(false)
    setChars(Array(LEN).fill(''))
    setIntlVal('')
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
    if (!catId) {
      toast('Selecciona una categoría', 'error')
      return
    }
    const cat = categorias.find(c => c.id === catId)
    start(async () => {
      const res = await registrarEntrada(placa, catId, preguntarEstadia ? cobroModo : undefined)
      if (res.ok) {
        if (autoRecibo && plan !== 'BASICO') {
          imprimirTicket(ticketEntrada({
            empresa, placa, tipoNombre: cat?.nombre ?? 'Vehículo',
            codigo: res.codigo, codigoTipo: ticketCfg?.codigo, campos: ticketCfg?.campos, mensualidad: res.esMensualidad,
          }))
        }
        toast(res.esMensualidad ? `Entrada · ${placa} · MENSUALIDAD` : `Entrada registrada · ${placa}`, res.esMensualidad ? 'info' : 'success')
        close()
        router.refresh()
      } else toast(res.error ?? 'No se pudo registrar', 'error')
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-full text-black font-semibold transition-transform hover:scale-[1.03]"
        style={{ background: 'var(--c-accent)', fontSize: '13px', padding: '8px 16px' }}
      >
        <Plus size={15} strokeWidth={2.5} /> Registrar entrada
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={close}
        >
          <div
            className="rounded-2xl w-full max-w-md p-7"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-white" style={{ fontSize: '17px', fontWeight: 600 }}>Registrar entrada</p>
              <button onClick={close} style={{ color: 'var(--c-text4)' }} className="transition-colors hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between mb-5">
              <p style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Ingresa la placa del vehículo</p>
              <button
                onClick={() => setIntl(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors"
                style={{ background: intl ? 'var(--c-border)' : 'var(--c-panel)', border: '1px solid var(--c-border2)', color: intl ? 'var(--c-text)' : 'var(--c-text3)', fontSize: '11.5px', fontWeight: 500 }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: intl ? '#3b82f6' : 'var(--c-text5)' }} />
                Internacional
              </button>
            </div>

            {/* Placa: OTP (Colombia) o texto libre (internacional) */}
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
                      onFocus={e => e.target.select()}
                      inputMode="text"
                      maxLength={1}
                      className="text-center font-mono outline-none transition-all"
                      style={{
                        width: 46,
                        height: 56,
                        background: 'var(--c-panel)',
                        border: `1.5px solid ${chars[i] ? '#3b82f6' : 'var(--c-border2)'}`,
                        borderRadius: 12,
                        color: 'var(--c-text)',
                        fontSize: 22,
                        fontWeight: 600,
                        caretColor: '#3b82f6',
                      }}
                      onFocusCapture={e => (e.currentTarget.style.borderColor = '#3b82f6')}
                      onBlur={e => (e.currentTarget.style.borderColor = chars[i] ? '#3b82f6' : 'var(--c-border2)')}
                    />
                    {i === 2 && <span style={{ color: '#333', fontSize: 20, fontWeight: 700 }}>·</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Categoría de vehículo */}
            <p style={{ color: 'var(--c-text3)', fontSize: '13px', marginBottom: '8px' }}>Categoría</p>
            <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(categorias.length, 4)}, minmax(0, 1fr))` }}>
              {categorias.map(c => {
                const on = catId === c.id
                const Icon = iconoDe(c.icono)
                return (
                  <button
                    key={c.id}
                    onClick={() => setCatId(c.id)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                    style={{ background: on ? 'var(--c-border)' : 'var(--c-panel)', border: on ? '1.5px solid #6b6b6b' : '1.5px solid var(--c-border2)' }}
                  >
                    <Icon size={18} color={on ? 'var(--c-text)' : 'var(--c-text3)'} />
                    <span style={{ color: on ? 'var(--c-text)' : 'var(--c-text3)', fontSize: '11.5px' }}>{c.nombre}</span>
                  </button>
                )
              })}
            </div>

            {/* Estadía (solo si el parqueadero lo activó) */}
            {preguntarEstadia && (
              <div className="mb-6">
                <p style={{ color: 'var(--c-text3)', fontSize: '13px', marginBottom: '8px' }}>¿Cómo se cobra?</p>
                <div className="grid grid-cols-3 gap-2">
                  {ESTADIAS.map(e => {
                    const on = cobroModo === e.id
                    return (
                      <button
                        key={e.id}
                        onClick={() => setCobroModo(e.id)}
                        className="py-2 rounded-lg transition-all"
                        style={{ background: on ? 'var(--c-border)' : 'var(--c-panel)', border: on ? '1.5px solid #6b6b6b' : '1.5px solid var(--c-border2)', color: on ? 'var(--c-text)' : 'var(--c-text3)', fontSize: '12.5px', fontWeight: 500 }}
                      >
                        {e.l}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              onClick={submit}
              disabled={pending}
              className="w-full rounded-full py-3 text-black font-semibold transition-opacity"
              style={{ background: 'var(--c-accent)', fontSize: '14px', opacity: pending ? 0.6 : 1 }}
            >
              {pending ? 'Registrando...' : 'Registrar entrada'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
