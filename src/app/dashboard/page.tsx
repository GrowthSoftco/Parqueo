import { Home, ChevronRight, Car } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner } from '@/lib/guard'
import StatCard from '@/components/StatCard'

export const dynamic = 'force-dynamic'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const fmtC = (n: number) => (n >= 1_000_000 ? '$' + (n / 1_000_000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'K' : '$' + n)
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function haceTexto(d: Date) {
  const min = Math.round((Date.now() - d.getTime()) / 60000)
  if (min < 60) return `Hace ${Math.max(1, min)} min`
  const h = Math.round(min / 60)
  if (h < 24) return `Hace ${h} h`
  return `Hace ${Math.round(h / 24)} d`
}

export default async function DashboardPage() {
  await requireOwner()
  const tenant = await getCurrentTenant()
  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
  const inicioDia = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [records, subsActivas] = await Promise.all([
    prisma.parkingRecord.findMany({ where: { tenantId: tenant.id }, orderBy: { entradaAt: 'desc' }, take: 300 }),
    prisma.clientSubscription.findMany({ where: { tenantId: tenant.id, status: { in: ['ACTIVA', 'POR_VENCER'] } } }),
  ])

  const salidas = records.filter(r => r.status === 'SALIO' && r.salidaAt && r.monto != null)
  const ingresosMes = salidas.filter(r => r.salidaAt! >= inicioMes).reduce((a, r) => a + (r.monto ?? 0), 0)
  const ingresosHoy = salidas.filter(r => r.salidaAt! >= inicioDia).reduce((a, r) => a + (r.monto ?? 0), 0)
  const mensualMonto = subsActivas.reduce((a, s) => a + s.monto, 0)

  const adentro = records.filter(r => r.status === 'ADENTRO')
  const entradasHoy = records.filter(r => r.entradaAt >= inicioDia).length

  // Ingresos por día — últimos 14 días (monocromo)
  const dias = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(inicioDia)
    d.setDate(d.getDate() - (13 - i))
    return { ts: d.getTime(), value: 0, label: String(d.getDate()), showLabel: i % 3 === 0 || i === 13 }
  })
  for (const r of salidas) {
    const d = r.salidaAt!
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const b = dias.find(x => x.ts === key)
    if (b) b.value += r.monto ?? 0
  }
  const maxDia = Math.max(1, ...dias.map(d => d.value))
  const spark7 = dias.slice(-7).map(d => d.value)
  const haySpark = spark7.some(v => v > 0)

  // Movimientos recientes
  const movimientos = records.slice(0, 7).map(r => {
    const salio = r.status === 'SALIO' && r.salidaAt
    return {
      placa: r.placa,
      tipo: r.tipoNombre,
      estado: salio ? 'Salió' : 'Adentro',
      monto: salio ? `+${fmt(r.monto ?? 0)}` : '—',
      time: haceTexto(salio ? r.salidaAt! : r.entradaAt),
      salio,
    }
  })

  return (
    <div className="px-7 pb-7 pt-5">
      <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--c-text5)', fontSize: '13px' }}>
        <Home size={14} />
        <ChevronRight size={13} />
        <span>Dashboard</span>
        <ChevronRight size={13} />
        <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--c-surface3)', color: 'var(--c-text2)', fontSize: '12px' }}>Resumen</span>
      </div>

      <div className="mb-6">
        <h1 className="text-white font-bold" style={{ fontSize: '26px' }}>Dashboard</h1>
        <p style={{ color: 'var(--c-text5)', fontSize: '13px', marginTop: '2px' }}>
          {DIAS[now.getDay()]}, {now.getDate()} de {MESES[now.getMonth()]} de {now.getFullYear()}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Ocupación actual" value={String(adentro.length)} note="vehículos adentro" />
        <StatCard label="Ingresos hoy" value={fmt(ingresosHoy)} note={`${entradasHoy} ingresos`} spark={haySpark ? spark7 : undefined} />
        <StatCard label="Ingresos del mes" value={fmtC(ingresosMes + mensualMonto)} note={MESES[now.getMonth()]} />
        <StatCard label="Mensualidades" value={String(subsActivas.length)} note={mensualMonto ? `${fmt(mensualMonto)}/mes` : 'activas'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Ingresos últimos 14 días */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <div className="flex items-center justify-between">
            <p style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Ingresos · últimos 14 días</p>
            <span className="text-white" style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(dias.reduce((a, d) => a + d.value, 0))}</span>
          </div>
          <div className="flex items-end gap-[5px]" style={{ height: 140, marginTop: 18 }}>
            {dias.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end group" style={{ height: '100%' }} title={`${d.label} · ${fmt(d.value)}`}>
                <div
                  className="w-full rounded-[3px] transition-colors group-hover:brightness-150"
                  style={{ height: `${(d.value / maxDia) * 100}%`, minHeight: d.value > 0 ? 4 : 2, background: d.value > 0 ? 'var(--c-text)' : 'var(--c-border)' }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-[5px]" style={{ marginTop: 8 }}>
            {dias.map((d, i) => (
              <span key={i} className="flex-1 text-center" style={{ color: 'var(--c-text5)', fontSize: '10px' }}>{d.showLabel ? d.label : ''}</span>
            ))}
          </div>
        </div>

        {/* En el parqueadero ahora */}
        <div className="rounded-2xl p-5 flex flex-col" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: 'var(--c-text4)', fontSize: '13px' }}>En el parqueadero ahora</p>
            <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--c-surface3)', color: 'var(--c-text2)', fontSize: '12px', fontWeight: 600 }}>{adentro.length}</span>
          </div>
          {adentro.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6" style={{ color: 'var(--c-text5)' }}>
              <Car size={26} strokeWidth={1.5} />
              <p style={{ fontSize: '12.5px', marginTop: 10 }}>No hay vehículos adentro</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: 200 }}>
              {adentro.slice(0, 8).map(r => (
                <div key={r.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--c-accent)' }} />
                    <span className="text-white font-mono" style={{ fontSize: '13px', letterSpacing: '0.04em' }}>{r.placa}</span>
                    <span style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{r.tipoNombre}</span>
                  </div>
                  <span style={{ color: 'var(--c-text5)', fontSize: '11.5px' }}>{haceTexto(r.entradaAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Movimientos */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Movimientos recientes</p>
          <a href="/dashboard/historial" style={{ color: 'var(--c-text4)', fontSize: '12px' }}>Ver todo</a>
        </div>
        {movimientos.length === 0 ? (
          <div className="px-5 py-10 text-center" style={{ color: 'var(--c-text5)', fontSize: '13px' }}>Aún no hay movimientos</div>
        ) : (
          movimientos.map((m, i) => (
            <div key={i} className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: i < movimientos.length - 1 ? '1px solid var(--c-surface2)' : 'none' }}>
              <div className="flex items-center gap-3">
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: m.salio ? 'var(--c-text)' : 'transparent', border: m.salio ? 'none' : '1.5px solid var(--c-text5)' }} />
                <span className="text-white font-mono" style={{ fontSize: '13px', letterSpacing: '0.04em' }}>{m.placa}</span>
                <span style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{m.tipo} · {m.estado}</span>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ color: 'var(--c-text5)', fontSize: '11.5px' }}>{m.time}</span>
                <span style={{ color: m.salio ? 'var(--c-text)' : 'var(--c-text5)', fontSize: '13px', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>{m.monto}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
