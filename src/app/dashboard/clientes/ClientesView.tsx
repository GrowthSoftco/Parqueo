'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import StatCard, { type StatCardProps } from '@/components/StatCard'
import { X, ChevronRight } from 'lucide-react'
import NuevoClienteButton from '@/components/NuevoClienteButton'
import { iconoDe } from '@/lib/vehicleIcons'

export type Cliente = {
  id: string
  nombre: string
  placa: string
  tel: string
  email: string
  plan: string
  desde: string
  estado: 'Activa' | 'Por vencer' | 'Vencida'
  vehiculos: { placa: string; tipoNombre: string; icono: string }[]
  mensualidad: { plan: string; monto: string; vence: string; diasRestantes: number; diasTotal: number }
  timeline: { fecha: string; tipo: 'in' | 'out' | 'pago'; detalle: string }[]
}
const estadoStyle: Record<string, React.CSSProperties> = {
  Activa: { background: '#0f2a1a', color: '#22c55e', border: '1px solid #1a4a2a' },
  'Por vencer': { background: '#2a230f', color: '#f59e0b', border: '1px solid #4a3a1a' },
  Vencida: { background: '#2a0f0f', color: '#ef4444', border: '1px solid #4a1a1a' },
}

export default function ClientesView({ clientes, stats }: { clientes: Cliente[]; stats: StatCardProps[] }) {
  const [open, setOpen] = useState(false)
  const [client, setClient] = useState<Cliente | null>(null)

  const openDrawer = (c: Cliente) => {
    setClient(c)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }
  const closeDrawer = () => {
    setOpen(false)
    setTimeout(() => setClient(null), 300)
  }

  return (
    <div className="px-7 pb-7 pt-5">
      <PageHeader crumb="Clientes" title="Clientes" subtitle="Directorio de clientes frecuentes y suscriptores" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <NuevoClienteButton />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ color: 'var(--c-text4)', fontSize: '11px', letterSpacing: '0.04em' }}>
              <th className="text-left font-medium px-5 pt-4 pb-3 uppercase">Cliente</th>
              <th className="text-left font-medium px-5 pt-4 pb-3 uppercase">Placa</th>
              <th className="text-left font-medium px-5 pt-4 pb-3 uppercase">Plan</th>
              <th className="text-left font-medium px-5 pt-4 pb-3 uppercase">Teléfono</th>
              <th className="text-left font-medium px-5 pt-4 pb-3 uppercase">Desde</th>
              <th className="text-right font-medium px-5 pt-4 pb-3 uppercase">Estado</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 && (
              <tr className="border-t" style={{ borderColor: 'var(--c-surface3)' }}>
                <td colSpan={7} className="px-5 py-8 text-center" style={{ color: 'var(--c-text5)', fontSize: '13px' }}>
                  Aún no tienes clientes registrados.
                </td>
              </tr>
            )}
            {clientes.map(c => (
              <tr
                key={c.id}
                onClick={() => openDrawer(c)}
                className="group border-t cursor-pointer transition-colors"
                style={{ borderColor: 'var(--c-surface3)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--c-surface3)', border: '1px solid var(--c-border3)' }}>
                      <span style={{ color: 'var(--c-text2)', fontSize: '13px', fontWeight: 600 }}>{c.nombre.charAt(0)}</span>
                    </div>
                    <span className="text-white" style={{ fontSize: '13.5px', fontWeight: 500 }}>{c.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-white font-mono" style={{ fontSize: '13px' }}>{c.placa}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--c-surface3)', border: '1px solid var(--c-border3)', color: 'var(--c-text2)', fontSize: '12px' }}>{c.plan}</span>
                </td>
                <td className="px-5 py-4" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{c.tel}</td>
                <td className="px-5 py-4" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{c.desde}</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[c.estado]}>{c.estado}</span>
                </td>
                <td className="pr-4">
                  <ChevronRight size={16} color="var(--c-text5)" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {client && (
        <>
          <div onClick={closeDrawer} className="fixed inset-0 z-[60] transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', opacity: open ? 1 : 0 }} />
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] overflow-y-auto"
            style={{ width: 420, maxWidth: '90vw', background: 'var(--c-panel)', borderLeft: '1px solid var(--c-border)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <ClientDetail client={client} onClose={closeDrawer} />
          </div>
        </>
      )}
    </div>
  )
}

const estadoColor: Record<string, string> = { Activa: '#22c55e', 'Por vencer': '#f59e0b', Vencida: '#ef4444' }

function ClientDetail({ client, onClose }: { client: Cliente; onClose: () => void }) {
  const m = client.mensualidad
  const pct = m.diasTotal > 0 ? Math.min(100, Math.max(0, Math.round((m.diasRestantes / m.diasTotal) * 100))) : 0
  const warn = m.diasRestantes <= 5 && m.diasRestantes > 0
  const vencida = m.diasRestantes <= 0
  const barra = vencida ? '#ef4444' : warn ? '#f59e0b' : 'var(--c-text)'
  const dot = estadoColor[client.estado] ?? 'var(--c-text3)'
  const puntoTl: Record<string, string> = { in: '#22c55e', out: 'var(--c-text4)', pago: 'var(--c-text2)' }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--c-surface3)', border: '1px solid var(--c-border3)', fontSize: '16px', fontWeight: 600, color: 'var(--c-text2)' }}>
            {client.nombre.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-white truncate" style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}>{client.nombre}</h2>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: dot, flexShrink: 0 }} title={client.estado} />
            </div>
            <p style={{ color: 'var(--c-text4)', fontSize: '12.5px', marginTop: 1 }}>Cliente desde {client.desde}</p>
          </div>
        </div>
        <button onClick={onClose} className="shrink-0 -mr-1.5 p-1.5 rounded-lg transition-colors" style={{ color: 'var(--c-text4)' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text)')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text4)')}>
          <X size={18} />
        </button>
      </div>

      <div className="h-px mx-6" style={{ background: 'var(--c-surface3)' }} />

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-7">
        {/* Contacto */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between py-2.5">
            <span style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Teléfono</span>
            <span className="text-white" style={{ fontSize: '13px' }}>{client.tel || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2.5" style={{ borderTop: '1px solid var(--c-surface2)' }}>
            <span style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Email</span>
            <span className="text-white truncate ml-4" style={{ fontSize: '13px' }}>{client.email || '—'}</span>
          </div>
        </div>

        {/* Vehículos */}
        <div>
          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '4px' }}>VEHÍCULOS</p>
          <div className="flex flex-col">
            {client.vehiculos.map((v, i) => {
              const Icon = iconoDe(v.icono)
              return (
                <div key={v.placa} className="flex items-center gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--c-surface2)' }}>
                  <Icon size={16} color="var(--c-text3)" />
                  <span className="text-white font-mono" style={{ fontSize: '13px' }}>{v.placa}</span>
                  <span className="ml-auto" style={{ color: 'var(--c-text4)', fontSize: '12.5px' }}>{v.tipoNombre}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mensualidad */}
        <div>
          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '10px' }}>MENSUALIDAD</p>
          <div className="flex items-baseline justify-between">
            <span style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Plan {m.plan.toLowerCase()}</span>
            <span className="text-white" style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>{m.monto}</span>
          </div>
          <div className="mt-4 w-full rounded-full" style={{ height: 4, background: 'var(--c-surface3)' }}>
            <div className="rounded-full" style={{ height: 4, width: `${pct}%`, background: barra, transition: 'width 400ms ease' }} />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ color: 'var(--c-text4)', fontSize: '12.5px' }}>Vence {m.vence}</span>
            <span style={{ color: warn || vencida ? barra : 'var(--c-text4)', fontSize: '12.5px', fontWeight: warn || vencida ? 600 : 400 }}>
              {vencida ? 'Vencida' : `${m.diasRestantes} días restantes`}
            </span>
          </div>
        </div>

        {/* Línea de tiempo */}
        <div>
          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '14px' }}>LÍNEA DE TIEMPO</p>
          <div className="relative flex flex-col gap-5">
            <div className="absolute left-[3.5px] top-1.5 bottom-1.5 w-px" style={{ background: 'var(--c-border)' }} />
            {client.timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3.5 relative">
                <span className="shrink-0 z-10" style={{ width: 8, height: 8, borderRadius: 9999, marginTop: 4, background: puntoTl[t.tipo] ?? 'var(--c-text4)', boxShadow: '0 0 0 3px var(--c-panel)' }} />
                <div>
                  <p className="text-white" style={{ fontSize: '13px' }}>{t.detalle}</p>
                  <p style={{ color: 'var(--c-text4)', fontSize: '11.5px', marginTop: '1px' }}>{t.fecha}</p>
                </div>
              </div>
            ))}
            {client.timeline.length === 0 && (
              <p style={{ color: 'var(--c-text5)', fontSize: '12px' }}>Sin movimientos registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
