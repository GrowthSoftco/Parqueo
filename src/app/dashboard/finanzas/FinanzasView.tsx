'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { ArrowDownLeft, ArrowUpRight, Trash2, Bell, Check, Pencil } from 'lucide-react'
import { guardarCapital, crearMovimiento, eliminarMovimiento } from '@/app/actions'

export type MovVM = { id: string; tipo: string; categoria: string; concepto: string; monto: number; recurrente: boolean; fecha: string }

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const CATS_EGRESO = ['Nómina', 'Servicios', 'Insumos', 'Arriendo', 'Otro']
const CATS_INGRESO = ['Venta', 'Aporte', 'Otro']

export default function FinanzasView({
  capital: capitalInit, stats, movimientos, recordatorios,
}: {
  capital: number
  stats: { operativo: number; ingresosManual: number; egresos: number; balance: number }
  movimientos: MovVM[]
  recordatorios: MovVM[]
}) {
  const router = useRouter()
  const [saving, start] = useTransition()

  // Capital editable
  const [editCap, setEditCap] = useState(false)
  const [capital, setCapital] = useState(String(capitalInit))
  const num = (s: string) => parseInt(s.replace(/\D/g, '')) || 0
  const saveCapital = () => start(async () => { await guardarCapital(num(capital)); setEditCap(false); router.refresh() })

  // Nuevo movimiento
  const [tipo, setTipo] = useState('EGRESO')
  const [categoria, setCategoria] = useState('Nómina')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [recurrente, setRecurrente] = useState(false)
  const [err, setErr] = useState('')
  const cats = tipo === 'EGRESO' ? CATS_EGRESO : CATS_INGRESO

  const agregar = () => {
    setErr('')
    start(async () => {
      const res = await crearMovimiento({ tipo, categoria, concepto, monto: num(monto), recurrente })
      if (res.ok) { setConcepto(''); setMonto(''); setRecurrente(false); router.refresh() } else setErr(res.error ?? 'Error')
    })
  }
  const quitar = (id: string) => start(async () => { await eliminarMovimiento(id); router.refresh() })

  const card = { background: 'var(--c-surface)', border: '1px solid var(--c-border)' }
  const field = { background: 'var(--c-panel)', border: '1px solid var(--c-border2)', borderRadius: 8, color: 'var(--c-text)', padding: '9px 12px', fontSize: '13px', outline: 'none' } as React.CSSProperties

  return (
    <div className="px-7 pb-7 pt-5">
      <PageHeader crumb="Finanzas" title="Finanzas" subtitle="Capital, ingresos y egresos de tu negocio" />

      {/* Balance */}
      <div className="rounded-2xl p-6 mb-4" style={card}>
        <p style={{ color: 'var(--c-text4)', fontSize: 13 }}>Balance estimado</p>
        <p className="text-white font-bold" style={{ fontSize: 38, letterSpacing: '-0.02em', color: stats.balance < 0 ? '#ef4444' : 'var(--c-text)' }}>{fmt(stats.balance)}</p>
        <p style={{ color: 'var(--c-text5)', fontSize: 12.5 }}>Capital + ingresos − egresos</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="rounded-xl p-4" style={card}>
          <p style={{ color: 'var(--c-text4)', fontSize: 12, marginBottom: 6 }}>Capital</p>
          {editCap ? (
            <div className="flex items-center gap-1.5">
              <input value={capital} onChange={e => setCapital(e.target.value.replace(/\D/g, ''))} inputMode="numeric" autoFocus className="w-full outline-none" style={{ ...field, padding: '4px 8px', fontSize: 18, fontWeight: 700 }} />
              <button onClick={saveCapital} disabled={saving} style={{ color: '#22c55e' }}><Check size={18} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>{fmt(num(capital))}</p>
              <button onClick={() => setEditCap(true)} style={{ color: 'var(--c-text4)' }} className="hover:text-white transition-colors"><Pencil size={13} /></button>
            </div>
          )}
        </div>
        <div className="rounded-xl p-4" style={card}>
          <p style={{ color: 'var(--c-text4)', fontSize: 12, marginBottom: 6 }}>Ingresos parqueo</p>
          <p style={{ color: '#22c55e', fontSize: 20, fontWeight: 700 }}>{fmt(stats.operativo)}</p>
        </div>
        <div className="rounded-xl p-4" style={card}>
          <p style={{ color: 'var(--c-text4)', fontSize: 12, marginBottom: 6 }}>Otros ingresos</p>
          <p className="text-white" style={{ fontSize: 20, fontWeight: 700 }}>{fmt(stats.ingresosManual)}</p>
        </div>
        <div className="rounded-xl p-4" style={card}>
          <p style={{ color: 'var(--c-text4)', fontSize: 12, marginBottom: 6 }}>Egresos</p>
          <p style={{ color: '#ef4444', fontSize: 20, fontWeight: 700 }}>{fmt(stats.egresos)}</p>
        </div>
      </div>

      {/* Recordatorios */}
      {recordatorios.length > 0 && (
        <div className="rounded-2xl p-5 mb-5" style={card}>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={15} color="#f59e0b" />
            <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>Recordatorios recurrentes</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recordatorios.map(r => (
              <span key={r.id} className="px-3 py-1.5 rounded-full" style={{ background: 'var(--c-surface3)', border: '1px solid var(--c-border3)', color: 'var(--c-text2)', fontSize: 12.5 }}>{r.concepto} · {fmt(r.monto)}</span>
            ))}
          </div>
        </div>
      )}

      {/* Nuevo movimiento */}
      <div className="rounded-2xl p-5 mb-5" style={card}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>Nuevo movimiento</p>
          {/* Egreso / Ingreso: segmentado en una sola cápsula */}
          <div className="flex p-0.5 rounded-full" style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border2)' }}>
            {[['EGRESO', 'Egreso', '#ef4444'], ['INGRESO', 'Ingreso', '#22c55e']].map(([id, l, col]) => {
              const on = tipo === id
              return (
                <button key={id} onClick={() => { setTipo(id); setCategoria(id === 'EGRESO' ? 'Nómina' : 'Venta') }} className="px-4 py-1.5 rounded-full transition-colors" style={{ background: on ? 'var(--c-surface3)' : 'transparent', color: on ? col : 'var(--c-text4)', fontSize: 12.5, fontWeight: 600 }}>
                  {l}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Fila principal de campos, todos a la misma altura */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <select value={categoria} onChange={e => setCategoria(e.target.value)} className="outline-none shrink-0" style={{ ...field, height: 42, minWidth: 130 }}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={concepto} onChange={e => setConcepto(e.target.value)} placeholder="Concepto (ej. Nómina de Juan)" className="flex-1" style={{ ...field, height: 42 }} />
            <input value={monto ? '$' + Number(monto).toLocaleString('es-CO') : ''} onChange={e => setMonto(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Monto" style={{ ...field, height: 42, width: 140, textAlign: 'right', fontWeight: 600 }} />
          </div>

          {/* Footer: recurrente (chip) + agregar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setRecurrente(v => !v)}
              className="flex items-center gap-2 px-3 rounded-full transition-colors"
              style={{ height: 34, background: recurrente ? 'color-mix(in srgb, #f59e0b 15%, transparent)' : 'var(--c-panel)', border: `1px solid ${recurrente ? '#f59e0b55' : 'var(--c-border2)'}`, color: recurrente ? '#f59e0b' : 'var(--c-text3)', fontSize: 12.5, fontWeight: 500 }}
            >
              <span className="flex items-center justify-center" style={{ width: 15, height: 15, borderRadius: 5, background: recurrente ? '#f59e0b' : 'transparent', border: recurrente ? 'none' : '1.5px solid var(--c-border3)' }}>
                {recurrente && <Check size={11} color="#1a1206" strokeWidth={3.5} />}
              </span>
              Recurrente
            </button>
            <button onClick={agregar} disabled={saving} className="rounded-full px-6 text-black font-semibold transition-opacity" style={{ height: 42, background: 'var(--c-accent)', fontSize: 13.5, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : 'Agregar'}
            </button>
          </div>
          {err && <p style={{ color: '#ef4444', fontSize: 13 }}>{err}</p>}
        </div>
      </div>

      {/* Movimientos */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <p className="text-white" style={{ fontSize: 13.5, fontWeight: 600 }}>Movimientos</p>
        </div>
        {movimientos.length === 0 && <p className="px-5 py-8 text-center" style={{ color: 'var(--c-text5)', fontSize: 13 }}>Sin movimientos registrados.</p>}
        {movimientos.map((m, i) => {
          const egreso = m.tipo === 'EGRESO'
          return (
            <div key={m.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--c-surface3)' }}>
              <span className="flex items-center justify-center shrink-0" style={{ width: 30, height: 30, borderRadius: 8, background: egreso ? 'color-mix(in srgb, #ef4444 14%, transparent)' : 'color-mix(in srgb, #22c55e 14%, transparent)' }}>
                {egreso ? <ArrowUpRight size={15} color="#ef4444" /> : <ArrowDownLeft size={15} color="#22c55e" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate" style={{ fontSize: 13.5 }}>{m.concepto} {m.recurrente && <span style={{ color: '#f59e0b', fontSize: 11 }}>· recurrente</span>}</p>
                <p style={{ color: 'var(--c-text5)', fontSize: 11.5 }}>{m.categoria} · {m.fecha}</p>
              </div>
              <span style={{ color: egreso ? '#ef4444' : '#22c55e', fontSize: 14, fontWeight: 600 }}>{egreso ? '−' : '+'}{fmt(m.monto)}</span>
              <button onClick={() => quitar(m.id)} style={{ color: 'var(--c-text5)' }} className="hover:text-white transition-colors ml-1"><Trash2 size={15} /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
