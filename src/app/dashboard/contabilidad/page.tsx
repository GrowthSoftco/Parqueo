import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'
import ContabilidadToolbar from '@/components/ContabilidadToolbar'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner, getTenantPlan } from '@/lib/guard'
import { planTier } from '@/lib/plan'
import PlanUpsell from '@/components/PlanUpsell'
import { BarChart3 } from 'lucide-react'
import { cargarMovimientos, normalizarPeriodo, rangoDe, PERIODO_LABEL, type Movimiento, type Periodo } from '@/lib/contabilidad'

export const dynamic = 'force-dynamic'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const fmtC = (n: number) => (n >= 1_000_000 ? '$' + (n / 1_000_000).toFixed(1) + 'M' : n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'K' : '$' + n)

type Bucket = { label: string; value: number; showLabel: boolean }
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

function buildBuckets(movs: Movimiento[], periodo: Periodo, now: Date): Bucket[] {
  if (periodo === 'hoy') {
    const arr: Bucket[] = Array.from({ length: 24 }, (_, h) => ({ label: String(h).padStart(2, '0'), value: 0, showLabel: h % 6 === 0 }))
    for (const m of movs) if (startOfDay(m.fecha) === startOfDay(now)) arr[m.fecha.getHours()].value += m.monto
    return arr
  }
  if (periodo === 'semana') {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const start = rangoDe('semana', now).getTime()
    const arr: Bucket[] = dias.map(d => ({ label: d, value: 0, showLabel: true }))
    for (const m of movs) {
      const idx = Math.floor((startOfDay(m.fecha) - start) / 86_400_000)
      if (idx >= 0 && idx < 7) arr[idx].value += m.monto
    }
    return arr
  }
  if (periodo === 'mes') {
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const arr: Bucket[] = Array.from({ length: days }, (_, i) => ({ label: String(i + 1), value: 0, showLabel: (i + 1) % 5 === 0 || i === 0 }))
    for (const m of movs) if (m.fecha.getMonth() === now.getMonth() && m.fecha.getFullYear() === now.getFullYear()) arr[m.fecha.getDate() - 1].value += m.monto
    return arr
  }
  const arr: Bucket[] = MESES.map(l => ({ label: l, value: 0, showLabel: true }))
  for (const m of movs) if (periodo === 'todo' || m.fecha.getFullYear() === now.getFullYear()) arr[m.fecha.getMonth()].value += m.monto
  return arr
}

function IngresosChart({ buckets }: { buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map(b => b.value))
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <p style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Ingresos en el periodo</p>
      <div className="flex items-end gap-[3px]" style={{ height: 150, marginTop: 18 }}>
        {buckets.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end group" style={{ height: '100%' }} title={`${b.label} · ${fmt(b.value)}`}>
            <div
              className="w-full rounded-[3px] transition-colors group-hover:brightness-150"
              style={{ height: `${(b.value / max) * 100}%`, minHeight: b.value > 0 ? 3 : 1, background: b.value > 0 ? 'var(--c-text)' : 'var(--c-border)' }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-[3px]" style={{ marginTop: 8 }}>
        {buckets.map((b, i) => (
          <span key={i} className="flex-1 text-center" style={{ color: 'var(--c-text5)', fontSize: '10px' }}>
            {b.showLabel ? b.label : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

export default async function ContabilidadPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  await requireOwner()
  const tenant = await getCurrentTenant()
  if (planTier(await getTenantPlan(tenant.id)) < 2) {
    return <PlanUpsell modulo="Contabilidad y reportes" descripcion="Lleva las cuentas de tu parqueadero: ingresos por periodo, desglose, gráfica y exportación a PDF o CSV. Disponible desde el plan Pro." plan="PRO" icon={BarChart3} />
  }
  const periodo = normalizarPeriodo((await searchParams).periodo)
  const now = new Date()
  const desde = rangoDe(periodo, now)
  const movs = await cargarMovimientos(tenant.id, desde)

  const ingresoTotal = movs.reduce((a, m) => a + m.monto, 0)
  const rotacion = movs.filter(m => m.tipo === 'Rotación')
  const mensualidades = movs.filter(m => m.tipo === 'Mensualidad')
  const rotacionTotal = rotacion.reduce((a, m) => a + m.monto, 0)
  const mensualidadTotal = mensualidades.reduce((a, m) => a + m.monto, 0)
  const ticket = rotacion.length ? Math.round(rotacionTotal / rotacion.length) : 0

  const buckets = buildBuckets(movs, periodo, now)

  // Desglose por tipo de vehículo (rotación)
  const porVeh: Record<string, { count: number; monto: number }> = {}
  for (const m of rotacion) {
    porVeh[m.vehiculo] = porVeh[m.vehiculo] ?? { count: 0, monto: 0 }
    porVeh[m.vehiculo].count++
    porVeh[m.vehiculo].monto += m.monto
  }
  const vehRows = Object.entries(porVeh).sort((a, b) => b[1].monto - a[1].monto)

  const fuentes = [
    { label: 'Rotación', monto: rotacionTotal, color: 'var(--c-text)' },
    { label: 'Mensualidades', monto: mensualidadTotal, color: '#a855f7' },
  ]

  const recientes = movs.slice(0, 12)
  const fechaCorta = (d: Date) => d.toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div id="print-area" className="px-7 pb-7 pt-4">
      <PageHeader crumb="Contabilidad" title="Contabilidad" subtitle={`Ingresos del negocio · ${PERIODO_LABEL[periodo]}`} />

      <ContabilidadToolbar periodo={periodo} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ingreso total" value={fmtC(ingresoTotal)} note={PERIODO_LABEL[periodo]} />
        <StatCard label="Vehículos atendidos" value={String(rotacion.length)} note="rotación" />
        <StatCard label="Ticket promedio" value={fmt(ticket)} note="por vehículo" />
        <StatCard label="Mensualidades" value={fmtC(mensualidadTotal)} note={`${mensualidades.length} cobradas`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <IngresosChart buckets={buckets} />
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
          <p style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Origen de los ingresos</p>
          <div className="mt-4 space-y-4">
            {fuentes.map(f => {
              const pct = ingresoTotal ? Math.round((f.monto / ingresoTotal) * 100) : 0
              return (
                <div key={f.label}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
                    <span style={{ color: 'var(--c-text2)', fontSize: '13px' }}>{f.label}</span>
                    <span className="text-white" style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(f.monto)}</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'var(--c-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: f.color }} />
                  </div>
                  <span style={{ color: 'var(--c-text5)', fontSize: '11px' }}>{pct}%</span>
                </div>
              )
            })}
          </div>

          <div style={{ height: 1, background: 'var(--c-border)', margin: '18px 0 14px' }} />
          <p style={{ color: 'var(--c-text4)', fontSize: '13px', marginBottom: 12 }}>Por tipo de vehículo</p>
          {vehRows.length === 0 && <p style={{ color: 'var(--c-text5)', fontSize: '12px' }}>Sin rotación en el periodo</p>}
          <div className="space-y-2.5">
            {vehRows.map(([veh, d]) => (
              <div key={veh} className="flex items-center justify-between">
                <span style={{ color: 'var(--c-text2)', fontSize: '13px' }}>{veh} <span style={{ color: 'var(--c-text5)' }}>· {d.count}</span></span>
                <span className="text-white" style={{ fontSize: '13px' }}>{fmt(d.monto)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl mt-4 overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Movimientos</p>
          <span style={{ color: 'var(--c-text5)', fontSize: '12px' }}>{movs.length} en {PERIODO_LABEL[periodo].toLowerCase()}</span>
        </div>
        {recientes.length === 0 ? (
          <div className="px-5 py-10 text-center" style={{ color: 'var(--c-text5)', fontSize: '13px' }}>Sin movimientos en este periodo</div>
        ) : (
          <div>
            {recientes.map((m, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: i < recientes.length - 1 ? '1px solid var(--c-surface2)' : 'none' }}>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2 py-0.5 rounded-md"
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      background: m.tipo === 'Mensualidad' ? '#a855f71f' : '#ffffff14',
                      color: m.tipo === 'Mensualidad' ? '#c084fc' : 'var(--c-text2)',
                    }}
                  >
                    {m.tipo}
                  </span>
                  <span className="text-white font-mono" style={{ fontSize: '13px', letterSpacing: '0.04em' }}>{m.detalle}</span>
                  <span style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{m.vehiculo}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{fechaCorta(m.fecha)}</span>
                  <span className="text-white" style={{ fontSize: '13px', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>{fmt(m.monto)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
