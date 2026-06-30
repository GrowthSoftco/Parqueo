'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import StatCard, { type StatCardProps } from '@/components/StatCard'
import PageHeader from '@/components/PageHeader'
import { X, CreditCard, CheckCircle2, RefreshCw, Ban, Calendar } from 'lucide-react'
import { cambiarEstadoCuenta, cambiarPlan, marcarPagado } from '@/app/admin-actions'

export type Row = {
  id: string
  cuenta: string
  plan: string
  monto: string
  prox: string
  estado: 'Al día' | 'Prueba' | 'Suspendido' | 'Baneado'
  pagos: { fecha: string; monto: string; estado: string }[]
}

const estadoStyle: Record<string, React.CSSProperties> = {
  'Al día': { background: 'color-mix(in srgb, #22c55e 16%, transparent)', color: '#22c55e', border: '1px solid color-mix(in srgb, #22c55e 32%, transparent)' },
  Prueba: { background: 'color-mix(in srgb, #3b82f6 16%, transparent)', color: '#3b82f6', border: '1px solid color-mix(in srgb, #3b82f6 32%, transparent)' },
  Suspendido: { background: 'color-mix(in srgb, #f59e0b 16%, transparent)', color: '#f59e0b', border: '1px solid color-mix(in srgb, #f59e0b 32%, transparent)' },
  Baneado: { background: 'color-mix(in srgb, #ef4444 16%, transparent)', color: '#ef4444', border: '1px solid color-mix(in srgb, #ef4444 32%, transparent)' },
}

export default function SuscripcionesView({ rows, stats }: { rows: Row[]; stats: StatCardProps[] }) {
  const [open, setOpen] = useState(false)
  const [row, setRow] = useState<Row | null>(null)

  const openDrawer = (r: Row) => {
    setRow(r)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }
  const closeDrawer = () => {
    setOpen(false)
    setTimeout(() => setRow(null), 300)
  }

  return (
    <div className="px-8 pb-8 pt-7">
      <PageHeader crumb="Suscripciones" title="Suscripciones" subtitle="Facturación de tus parqueaderos" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ color: 'var(--c-text5)', fontSize: '12px', background: 'var(--c-panel)' }}>
              <th className="text-left font-medium px-5 py-3">Cuenta</th>
              <th className="text-left font-medium px-5 py-3">Plan</th>
              <th className="text-left font-medium px-5 py-3">Monto</th>
              <th className="text-left font-medium px-5 py-3">Próximo cobro</th>
              <th className="text-right font-medium px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr
                key={r.id}
                onClick={() => openDrawer(r)}
                className="border-t cursor-pointer transition-colors"
                style={{ borderColor: 'var(--c-surface3)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td className="px-5 py-3.5 text-white" style={{ fontSize: '13px' }}>{r.cuenta}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text2)', fontSize: '13px' }}>{r.plan}</td>
                <td className="px-5 py-3.5 text-white" style={{ fontSize: '13px', fontWeight: 600 }}>{r.monto}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{r.prox}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[r.estado]}>{r.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {row && (
        <>
          <div onClick={closeDrawer} className="fixed inset-0 z-[60] transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', opacity: open ? 1 : 0 }} />
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] overflow-y-auto"
            style={{ width: 420, maxWidth: '92vw', background: 'var(--c-panel)', borderLeft: '1px solid var(--c-border)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <Detail row={row} onClose={closeDrawer} />
          </div>
        </>
      )}
    </div>
  )
}

const planEnum: Record<string, 'BASICO' | 'PRO' | 'NEGOCIO'> = { Básico: 'BASICO', Pro: 'PRO', Negocio: 'NEGOCIO' }

function Detail({ row, onClose }: { row: Row; onClose: () => void }) {
  const router = useRouter()
  const [, start] = useTransition()
  const act = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn()
      router.refresh()
      onClose()
    })
  return (
    <div>
      <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: 'var(--c-surface3)' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>{row.cuenta}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[row.estado]}>{row.estado}</span>
          </div>
          <p style={{ color: 'var(--c-text4)', fontSize: '12px' }}>Facturación de la cuenta</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--c-text4)' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text)')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text4)')}>
          <X size={18} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-6">
        <div className="p-4 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard size={15} color="#8b5cf6" />
              <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Plan {row.plan === '—' ? 'sin asignar' : row.plan}</span>
            </div>
            <span className="text-white" style={{ fontSize: '15px', fontWeight: 700 }}>{row.monto}<span style={{ color: 'var(--c-text4)', fontWeight: 400, fontSize: '12px' }}>/mes</span></span>
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--c-text3)', fontSize: '12px' }}>
            <Calendar size={13} /> Próximo cobro: {row.prox}
          </div>
        </div>

        <div>
          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>HISTORIAL DE PAGOS</p>
          {row.pagos.length === 0 ? (
            <p style={{ color: 'var(--c-text5)', fontSize: '13px' }}>Sin pagos registrados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {row.pagos.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: p.estado === 'Pagado' ? 'color-mix(in srgb, #22c55e 16%, transparent)' : 'color-mix(in srgb, #ef4444 16%, transparent)' }}>
                    <CheckCircle2 size={14} color={p.estado === 'Pagado' ? '#22c55e' : '#ef4444'} />
                  </div>
                  <span className="text-white flex-1" style={{ fontSize: '13px', fontWeight: 500 }}>{p.monto}</span>
                  <span style={{ color: 'var(--c-text5)', fontSize: '12px' }}>{p.fecha} · {p.estado}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>CAMBIAR PLAN</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['Básico', 'Pro', 'Negocio'].map(l => {
              const on = row.plan === l
              return (
                <button
                  key={l}
                  onClick={() => act(() => cambiarPlan(row.id, planEnum[l]))}
                  className="rounded-xl p-2.5 transition-all"
                  style={{ background: on ? 'rgba(139,92,246,0.1)' : 'var(--c-surface)', border: on ? '1px solid #8b5cf6' : '1px solid var(--c-border)', color: on ? 'var(--c-text)' : 'var(--c-text2)', fontSize: '13px', fontWeight: 600 }}
                >
                  {l}
                </button>
              )
            })}
          </div>

          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>ACCIONES</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => act(() => marcarPagado(row.id))} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg w-full text-left transition-colors" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: 'var(--c-text2)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface3)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-surface)')}>
              <RefreshCw size={15} /> <span style={{ fontSize: '13px' }}>Marcar como pagado</span>
            </button>
            {row.estado === 'Suspendido' || row.estado === 'Baneado' ? (
              <button onClick={() => act(() => cambiarEstadoCuenta(row.id, 'ACTIVE'))} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg w-full text-left transition-colors" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: '#22c55e' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface3)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-surface)')}>
                <CheckCircle2 size={15} /> <span style={{ fontSize: '13px' }}>Reactivar cuenta</span>
              </button>
            ) : (
              <button onClick={() => act(() => cambiarEstadoCuenta(row.id, 'SUSPENDED'))} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg w-full text-left transition-colors" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color: '#ef4444' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface3)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-surface)')}>
                <Ban size={15} /> <span style={{ fontSize: '13px' }}>Suspender cuenta</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
