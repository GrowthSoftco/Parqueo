'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import StatCard, { type StatCardProps } from '@/components/StatCard'
import { X, Car, CreditCard, CheckCircle2, Phone, RefreshCw } from 'lucide-react'
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

function SubDetail({ sub, onClose }: { sub: Sub; onClose: () => void }) {
  const pct = sub.diasTotal > 0 ? Math.round((sub.diasRestantes / sub.diasTotal) * 100) : 0
  const warn = sub.diasRestantes <= 5

  return (
    <div>
      <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: '#1c1c1c' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>{sub.cliente}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[sub.estado]}>{sub.estado}</span>
          </div>
          <p className="font-mono" style={{ fontSize: '13px', color: '#888' }}>{sub.placa}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#666' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#666')}>
          <X size={18} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-6">
        <div className="p-4 rounded-xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={15} color="#a855f7" />
              <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Plan {sub.plan}</span>
            </div>
            <span className="text-white" style={{ fontSize: '16px', fontWeight: 700 }}>{sub.monto}</span>
          </div>
          <div className="flex justify-between mb-1.5">
            <span style={{ color: '#888', fontSize: '12px' }}>Vence {sub.vence}</span>
            <span style={{ color: warn ? '#f59e0b' : '#888', fontSize: '12px' }}>
              {sub.diasRestantes > 0 ? `${sub.diasRestantes} días restantes` : 'Vencida'}
            </span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: '#222' }}>
            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: warn ? '#f59e0b' : '#22c55e' }} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Car size={14} color="#666" />
            <span className="text-white font-mono" style={{ fontSize: '13px' }}>{sub.placa}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={14} color="#666" />
            <span style={{ color: '#ccc', fontSize: '13px' }}>{sub.tel}</span>
          </div>
        </div>

        <div>
          <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>HISTORIAL DE PAGOS</p>
          <div className="flex flex-col gap-2">
            {sub.pagos.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#0f2a1a' }}>
                  <CheckCircle2 size={15} color="#22c55e" />
                </div>
                <div className="flex-1">
                  <p className="text-white" style={{ fontSize: '13px', fontWeight: 500 }}>{p.monto}</p>
                  <p style={{ color: '#555', fontSize: '11px' }}>{p.fecha} · {p.metodo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-black font-semibold" style={{ background: '#fff', fontSize: '13px' }}>
            <RefreshCw size={14} /> Renovar
          </button>
          <button className="px-4 py-2.5 rounded-full" style={{ background: '#161616', border: '1px solid #232323', color: '#aaa', fontSize: '13px' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
