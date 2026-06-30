'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import StatCard, { type StatCardProps } from '@/components/StatCard'
import { Phone, Mail, X, LogIn, LogOut, CreditCard, ChevronRight } from 'lucide-react'
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

      <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <table className="w-full">
          <thead>
            <tr style={{ color: '#666', fontSize: '11px', letterSpacing: '0.04em' }}>
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
              <tr className="border-t" style={{ borderColor: '#1c1c1c' }}>
                <td colSpan={7} className="px-5 py-8 text-center" style={{ color: '#555', fontSize: '13px' }}>
                  Aún no tienes clientes registrados.
                </td>
              </tr>
            )}
            {clientes.map(c => (
              <tr
                key={c.id}
                onClick={() => openDrawer(c)}
                className="group border-t cursor-pointer transition-colors"
                style={{ borderColor: '#1c1c1c' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#171717')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                      <span style={{ color: '#bbb', fontSize: '13px', fontWeight: 600 }}>{c.nombre.charAt(0)}</span>
                    </div>
                    <span className="text-white" style={{ fontSize: '13.5px', fontWeight: 500 }}>{c.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-white font-mono" style={{ fontSize: '13px' }}>{c.placa}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 rounded-md" style={{ background: '#1a1a1a', border: '1px solid #272727', color: '#aaa', fontSize: '12px' }}>{c.plan}</span>
                </td>
                <td className="px-5 py-4" style={{ color: '#888', fontSize: '13px' }}>{c.tel}</td>
                <td className="px-5 py-4" style={{ color: '#888', fontSize: '13px' }}>{c.desde}</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[c.estado]}>{c.estado}</span>
                </td>
                <td className="pr-4">
                  <ChevronRight size={16} color="#555" className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
            style={{ width: 420, maxWidth: '90vw', background: '#0f0f0f', borderLeft: '1px solid #1e1e1e', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <ClientDetail client={client} onClose={closeDrawer} />
          </div>
        </>
      )}
    </div>
  )
}

function ClientDetail({ client, onClose }: { client: Cliente; onClose: () => void }) {
  const m = client.mensualidad
  const pct = m.diasTotal > 0 ? Math.round((m.diasRestantes / m.diasTotal) * 100) : 0

  return (
    <div>
      <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: '#1c1c1c' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', fontSize: '18px', fontWeight: 700, color: '#ccc' }}>
            {client.nombre.charAt(0)}
          </div>
          <div>
            <p className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>{client.nombre}</p>
            <p style={{ color: '#555', fontSize: '12px' }}>Cliente desde {client.desde}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#666' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#666')}>
          <X size={18} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Phone size={14} color="#666" />
            <span style={{ color: '#ccc', fontSize: '13px' }}>{client.tel}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail size={14} color="#666" />
            <span style={{ color: '#ccc', fontSize: '13px' }}>{client.email}</span>
          </div>
        </div>

        <div>
          <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>VEHÍCULOS</p>
          <div className="flex flex-col gap-2">
            {client.vehiculos.map(v => {
              const Icon = iconoDe(v.icono)
              return (
                <div key={v.placa} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#1c1c1c' }}>
                    <Icon size={15} color="#aaa" />
                  </div>
                  <span className="text-white font-mono" style={{ fontSize: '13px' }}>{v.placa}</span>
                  <span className="ml-auto" style={{ color: '#555', fontSize: '12px' }}>{v.tipoNombre}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>MENSUALIDAD</p>
          <div className="p-4 rounded-xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={15} color="#a855f7" />
                <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Plan {m.plan}</span>
              </div>
              <span className="text-white" style={{ fontSize: '14px', fontWeight: 700 }}>{m.monto}</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span style={{ color: '#888', fontSize: '12px' }}>Vence {m.vence}</span>
              <span style={{ color: m.diasRestantes <= 5 ? '#f59e0b' : '#888', fontSize: '12px' }}>
                {m.diasRestantes > 0 ? `${m.diasRestantes} días restantes` : 'Vencida'}
              </span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: '#222' }}>
              <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: m.diasRestantes <= 5 ? '#f59e0b' : '#22c55e' }} />
            </div>
          </div>
        </div>

        <div>
          <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '14px' }}>LÍNEA DE TIEMPO</p>
          <div className="relative flex flex-col gap-5">
            <div className="absolute left-[11px] top-1 bottom-1 w-px" style={{ background: '#222' }} />
            {client.timeline.map((t, i) => {
              const cfg = t.tipo === 'in' ? { Icon: LogIn, color: '#22c55e' } : t.tipo === 'out' ? { Icon: LogOut, color: '#888' } : { Icon: CreditCard, color: '#a855f7' }
              return (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10" style={{ background: '#141414', border: `1px solid ${cfg.color}40` }}>
                    <cfg.Icon size={12} color={cfg.color} />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-white" style={{ fontSize: '13px' }}>{t.detalle}</p>
                    <p style={{ color: '#555', fontSize: '11px', marginTop: '1px' }}>{t.fecha}</p>
                  </div>
                </div>
              )
            })}
            {client.timeline.length === 0 && (
              <p style={{ color: '#555', fontSize: '12px' }}>Sin movimientos registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
