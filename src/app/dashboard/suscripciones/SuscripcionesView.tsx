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
  Activa: { background: '#0f2a1a', color: '#22c55e', border: '1px solid #1a4a2a' },
  'Por vencer': { background: '#2a230f', color: '#f59e0b', border: '1px solid #4a3a1a' },
  Vencida: { background: '#2a0f0f', color: '#ef4444', border: '1px solid #4a1a1a' },
}

const filtros = ['Todas', 'Activa', 'Por vencer', 'Vencida'] as const

export default function SuscripcionesView({ subs, stats }: { subs: Sub[]; stats: StatCardProps[] }) {
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
              style={{ background: filtro === f ? '#fff' : '#161616', color: filtro === f ? '#000' : '#888', border: '1px solid #232323', fontSize: '13px', fontWeight: 500 }}
            >
              {f}
            </button>
          ))}
        </div>
        <NuevaSuscripcionButton />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <table className="w-full">
          <thead>
            <tr style={{ color: '#555', fontSize: '12px', background: '#0f0f0f' }}>
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
              <tr className="border-t" style={{ borderColor: '#1a1a1a' }}>
                <td colSpan={6} className="px-5 py-8 text-center" style={{ color: '#555', fontSize: '13px' }}>
                  No hay suscripciones para este filtro.
                </td>
              </tr>
            )}
            {visibles.map(s => (
              <tr
                key={s.id}
                onClick={() => openDrawer(s)}
                className="border-t cursor-pointer transition-colors"
                style={{ borderColor: '#1a1a1a' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#181818')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td className="px-5 py-3.5 text-white font-mono" style={{ fontSize: '13px' }}>{s.placa}</td>
                <td className="px-5 py-3.5 text-white" style={{ fontSize: '13px' }}>{s.cliente}</td>
                <td className="px-5 py-3.5" style={{ color: '#aaa', fontSize: '13px' }}>{s.plan}</td>
                <td className="px-5 py-3.5" style={{ color: '#888', fontSize: '13px' }}>{s.inicio}</td>
                <td className="px-5 py-3.5" style={{ color: '#888', fontSize: '13px' }}>{s.vence}</td>
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
            style={{ width: 420, maxWidth: '90vw', background: '#0f0f0f', borderLeft: '1px solid #1e1e1e', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
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
  const dot = estadoColor[sub.estado] ?? '#888'
  const barra = vencida ? '#ef4444' : warn ? '#f59e0b' : '#e7e7e7'

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
          <p className="font-mono" style={{ fontSize: '13px', color: '#777', letterSpacing: '0.02em' }}>{sub.placa}</p>
        </div>
        <button onClick={onClose} className="shrink-0 -mr-1.5 p-1.5 rounded-lg transition-colors" style={{ color: '#666' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#666')}>
          <X size={18} />
        </button>
      </div>

      <div className="h-px mx-6" style={{ background: '#1a1a1a' }} />

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">
        {/* Monto / plan */}
        <div>
          <div className="flex items-baseline justify-between">
            <span style={{ color: '#888', fontSize: '13px' }}>Plan {sub.plan.toLowerCase()}</span>
            <span className="text-white" style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>{sub.monto}</span>
          </div>
          <div className="mt-4 w-full rounded-full" style={{ height: 4, background: '#1c1c1c' }}>
            <div className="rounded-full" style={{ height: 4, width: `${pct}%`, background: barra, transition: 'width 400ms ease' }} />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ color: '#777', fontSize: '12.5px' }}>Vence {sub.vence}</span>
            <span style={{ color: warn || vencida ? barra : '#777', fontSize: '12.5px', fontWeight: warn || vencida ? 600 : 400 }}>
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
            <div key={row.k} className="flex items-center justify-between py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid #161616' }}>
              <span style={{ color: '#777', fontSize: '13px' }}>{row.k}</span>
              <span className={row.mono ? 'text-white font-mono' : 'text-white'} style={{ fontSize: '13px' }}>{row.v}</span>
            </div>
          ))}
        </div>

        {/* Pagos */}
        <div>
          <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '6px' }}>HISTORIAL DE PAGOS</p>
          <div className="flex flex-col">
            {sub.pagos.length === 0 && <p style={{ color: '#555', fontSize: '13px', paddingTop: 10 }}>Sin pagos registrados.</p>}
            {sub.pagos.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3" style={{ borderTop: i === 0 ? 'none' : '1px solid #161616' }}>
                <div>
                  <p className="text-white" style={{ fontSize: '13.5px', fontWeight: 500 }}>{p.monto}</p>
                  <p style={{ color: '#666', fontSize: '11.5px', marginTop: 1 }}>{p.fecha} · {p.metodo}</p>
                </div>
                <span style={{ fontSize: '11.5px', color: '#3f8f5f', fontWeight: 500 }}>Pagado</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="px-6 py-4 flex gap-2.5" style={{ borderTop: '1px solid #1a1a1a' }}>
        <button
          className="flex-1 flex items-center justify-center gap-2 rounded-full text-black font-semibold transition-transform hover:scale-[1.01]"
          style={{ background: '#fff', fontSize: '13.5px', padding: '11px' }}
        >
          <RefreshCw size={14} strokeWidth={2.5} /> Renovar
        </button>
        <button
          className="rounded-full transition-colors"
          style={{ background: 'transparent', border: '1px solid #262626', color: '#999', fontSize: '13.5px', padding: '11px 20px' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#161616'; (e.currentTarget as HTMLElement).style.color = '#ddd' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#999' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
