'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import StatCard, { type StatCardProps } from '@/components/StatCard'
import { X, RefreshCw } from 'lucide-react'
import NuevaSuscripcionButton from '@/components/NuevaSuscripcionButton'

export type Sub = {
  id: string
  placa: string
  cliente: string
  tel: string
  plan: string
  monto: string
  inicio: string
  vence: string
  diasRestantes: number
  diasTotal: number
  estado: 'Activa' | 'Por vencer' | 'Vencida'
  pagos: { fecha: string; monto: string; metodo: string }[]
}

const estadoStyle: Record<string, React.CSSProperties> = {
  Activa: { background: 'color-mix(in srgb, #22c55e 16%, transparent)', color: '#22c55e', border: '1px solid color-mix(in srgb, #22c55e 32%, transparent)' },
  'Por vencer': { background: 'color-mix(in srgb, #f59e0b 16%, transparent)', color: '#f59e0b', border: '1px solid color-mix(in srgb, #f59e0b 32%, transparent)' },
  Vencida: { background: 'color-mix(in srgb, #ef4444 16%, transparent)', color: '#ef4444', border: '1px solid color-mix(in srgb, #ef4444 32%, transparent)' },
}

const filtros = ['Todas', 'Activa', 'Por vencer', 'Vencida'] as const

export default function SuscripcionesView({ subs, stats, plan }: { subs: Sub[]; stats: StatCardProps[]; plan: string | null }) {
  const [open, setOpen] = useState(false)
  const [sub, setSub] = useState<Sub | null>(null)
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>('Todas')

  const visibles = subs.filter(s => filtro === 'Todas' || s.estado === filtro)

  const openDrawer = (s: Sub) => {
    setSub(s)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }
  const closeDrawer = () => {
    setOpen(false)
    setTimeout(() => setSub(null), 300)
  }

  return (
    <div className="px-7 pb-7 pt-5">
      <PageHeader crumb="Suscripciones" title="Suscripciones" subtitle="Clientes con planes mensuales, semanales y nocturnos" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {filtros.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className="px-3.5 py-1.5 rounded-full transition-colors"
              style={{ background: filtro === f ? 'var(--c-text)' : 'var(--c-surface2)', color: filtro === f ? 'var(--c-bg)' : 'var(--c-text3)', border: '1px solid var(--c-border2)', fontSize: '13px', fontWeight: 500 }}
            >
              {f}
            </button>
          ))}
        </div>
        <NuevaSuscripcionButton plan={plan} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ color: 'var(--c-text5)', fontSize: '12px', background: 'var(--c-panel)' }}>
              <th className="text-left font-medium px-5 py-3">Placa</th>
              <th className="text-left font-medium px-5 py-3">Cliente</th>
              <th className="text-left font-medium px-5 py-3">Plan</th>
              <th className="text-left font-medium px-5 py-3">Inicio</th>
              <th className="text-left font-medium px-5 py-3">Vence</th>
              <th className="text-right font-medium px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 && (
              <tr className="border-t" style={{ borderColor: 'var(--c-surface3)' }}>
                <td colSpan={6} className="px-5 py-8 text-center" style={{ color: 'var(--c-text5)', fontSize: '13px' }}>
                  No hay suscripciones para este filtro.
                </td>
              </tr>
            )}
            {visibles.map(s => (
              <tr
                key={s.id}
                onClick={() => openDrawer(s)}
                className="border-t cursor-pointer transition-colors"
                style={{ borderColor: 'var(--c-surface3)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td className="px-5 py-3.5 text-white font-mono" style={{ fontSize: '13px' }}>{s.placa}</td>
                <td className="px-5 py-3.5 text-white" style={{ fontSize: '13px' }}>{s.cliente}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text2)', fontSize: '13px' }}>{s.plan}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{s.inicio}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{s.vence}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[s.estado]}>{s.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sub && (
        <>
          <div onClick={closeDrawer} className="fixed inset-0 z-[60] transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', opacity: open ? 1 : 0 }} />
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] overflow-y-auto"
            style={{ width: 420, maxWidth: '90vw', background: 'var(--c-panel)', borderLeft: '1px solid var(--c-border)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <SubDetail sub={sub} onClose={closeDrawer} />
          </div>
        </>
      )}
    </div>
  )
}

const estadoColor: Record<string, string> = { Activa: '#22c55e', 'Por vencer': '#f59e0b', Vencida: '#ef4444' }

function SubDetail({ sub, onClose }: { sub: Sub; onClose: () => void }) {
  const pct = sub.diasTotal > 0 ? Math.min(100, Math.max(0, Math.round((sub.diasRestantes / sub.diasTotal) * 100))) : 0
  const warn = sub.diasRestantes <= 5 && sub.diasRestantes > 0
  const vencida = sub.diasRestantes <= 0
  const dot = estadoColor[sub.estado] ?? 'var(--c-text3)'
  const barra = vencida ? '#ef4444' : warn ? '#f59e0b' : 'var(--c-text)'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-white truncate" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}>{sub.cliente}</h2>
            <span className="inline-flex items-center gap-1.5 shrink-0" style={{ fontSize: '12px', color: dot }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: dot }} />
              {sub.estado}
            </span>
          </div>
          <p className="font-mono" style={{ fontSize: '13px', color: 'var(--c-text4)', letterSpacing: '0.02em' }}>{sub.placa}</p>
        </div>
        <button onClick={onClose} className="shrink-0 -mr-1.5 p-1.5 rounded-lg transition-colors" style={{ color: 'var(--c-text4)' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text)')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text4)')}>
          <X size={18} />
        </button>
      </div>

      <div className="h-px mx-6" style={{ background: 'var(--c-surface3)' }} />

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">
        {/* Monto / plan */}
        <div>
          <div className="flex items-baseline justify-between">
            <span style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Plan {sub.plan.toLowerCase()}</span>
            <span className="text-white" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>{sub.monto}</span>
          </div>
          <div className="mt-4 w-full rounded-full" style={{ height: 4, background: 'var(--c-surface3)' }}>
            <div className="rounded-full" style={{ height: 4, width: `${pct}%`, background: barra, transition: 'width 400ms ease' }} />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ color: 'var(--c-text4)', fontSize: '12.5px' }}>Vence {sub.vence}</span>
            <span style={{ color: warn || vencida ? barra : 'var(--c-text4)', fontSize: '12.5px', fontWeight: warn || vencida ? 600 : 400 }}>
              {vencida ? 'Vencida' : `${sub.diasRestantes} días restantes`}
            </span>
          </div>
        </div>

        {/* Datos */}
        <div className="flex flex-col">
          {[
            { k: 'Vehículo', v: sub.placa, mono: true },
            { k: 'Teléfono', v: sub.tel },
            { k: 'Inicio', v: sub.inicio },
          ].map((row, i) => (
            <div key={row.k} className="flex items-center justify-between py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--c-surface2)' }}>
              <span style={{ color: 'var(--c-text4)', fontSize: '13px' }}>{row.k}</span>
              <span className={row.mono ? 'text-white font-mono' : 'text-white'} style={{ fontSize: '13px' }}>{row.v}</span>
            </div>
          ))}
        </div>

        {/* Pagos */}
        <div>
          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '6px' }}>HISTORIAL DE PAGOS</p>
          <div className="flex flex-col">
            {sub.pagos.length === 0 && <p style={{ color: 'var(--c-text5)', fontSize: '13px', paddingTop: 10 }}>Sin pagos registrados.</p>}
            {sub.pagos.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--c-surface2)' }}>
                <div>
                  <p className="text-white" style={{ fontSize: '13.5px', fontWeight: 500 }}>{p.monto}</p>
                  <p style={{ color: 'var(--c-text4)', fontSize: '11.5px', marginTop: 1 }}>{p.fecha} · {p.metodo}</p>
                </div>
                <span style={{ fontSize: '11.5px', color: '#3f8f5f', fontWeight: 500 }}>Pagado</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-6 py-4 flex gap-2.5" style={{ borderTop: '1px solid var(--c-surface3)' }}>
        <button
          className="flex-1 flex items-center justify-center gap-2 rounded-full text-black font-semibold transition-transform hover:scale-[1.01]"
          style={{ background: 'var(--c-accent)', fontSize: '13.5px', padding: '11px' }}
        >
          <RefreshCw size={14} strokeWidth={2.5} /> Renovar
        </button>
        <button
          className="rounded-full transition-colors"
          style={{ background: 'transparent', border: '1px solid var(--c-border3)', color: 'var(--c-text3)', fontSize: '13.5px', padding: '11px 20px' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--c-text2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--c-text3)' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
