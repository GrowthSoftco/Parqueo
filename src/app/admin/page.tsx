import StatCard from '@/components/StatCard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const PRICE: Record<string, number> = { BASICO: 49900, PRO: 99900, NEGOCIO: 179900 }
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const fmtM = (n: number) => (n >= 1_000_000 ? '$' + (n / 1_000_000).toFixed(2) + 'M' : '$' + (n / 1000).toFixed(0) + 'K')
const planLabel: Record<string, string> = { BASICO: 'Básico', PRO: 'Pro', NEGOCIO: 'Negocio' }

const ESTADO: Record<string, { label: string; dot: string }> = {
  ACTIVE: { label: 'Activo', dot: '#22c55e' },
  TRIAL: { label: 'Prueba', dot: '#eab308' },
  SUSPENDED: { label: 'Suspendido', dot: '#f59e0b' },
  BANNED: { label: 'Baneado', dot: '#ef4444' },
}

function hace(d: Date) {
  const h = Math.round((Date.now() - d.getTime()) / 3600000)
  if (h < 1) return 'Hace minutos'
  if (h < 24) return `Hace ${h} h`
  return `Hace ${Math.round(h / 24)} d`
}

export default async function AdminResumen() {
  const tenants = await prisma.tenant.findMany({
    include: { subscription: true, users: { where: { role: 'OWNER' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  const total = tenants.length
  const activos = tenants.filter(t => t.status === 'ACTIVE').length
  const prueba = tenants.filter(t => t.status === 'TRIAL').length
  const mrr = tenants
    .filter(t => t.status === 'ACTIVE' && t.subscription?.plan)
    .reduce((a, t) => a + (PRICE[t.subscription!.plan!] ?? 0), 0)

  const planDist = (['BASICO', 'PRO', 'NEGOCIO'] as const).map(p => ({
    plan: planLabel[p],
    count: tenants.filter(t => t.subscription?.plan === p).length,
  }))
  const maxPlan = Math.max(1, ...planDist.map(p => p.count))

  return (
    <div className="px-8 pb-8 pt-9">
      <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-white font-bold" style={{ fontSize: '24px', letterSpacing: '-0.01em' }}>Operador</h1>
        <p style={{ color: '#666', fontSize: '13.5px', marginTop: 3 }}>Estado general de Parqueo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard label="Parqueaderos" value={String(total)} note="registrados" />
        <StatCard label="Activos" value={String(activos)} note="pagando" />
        <StatCard label="En prueba" value={String(prueba)} note="en seguimiento" />
        <StatCard label="MRR" value={fmtM(mrr)} note="ingresos / mes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabla de parqueaderos */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e1e' }}>
            <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Parqueaderos</p>
            <span style={{ color: '#555', fontSize: '12px' }}>{total} en total</span>
          </div>

          <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '1.6fr 1fr 0.9fr auto', color: '#555', fontSize: '11.5px', borderBottom: '1px solid #181818' }}>
            <span>Parqueadero</span><span>Plan</span><span>Estado</span><span className="text-right">Registrado</span>
          </div>

          {tenants.length === 0 ? (
            <div className="px-5 py-10 text-center" style={{ color: '#555', fontSize: 13 }}>Aún no hay parqueaderos</div>
          ) : (
            tenants.slice(0, 8).map((t, i) => {
              const e = ESTADO[t.status] ?? ESTADO.TRIAL
              return (
                <div key={t.id} className="grid items-center px-5 py-3" style={{ gridTemplateColumns: '1.6fr 1fr 0.9fr auto', borderBottom: i < Math.min(tenants.length, 8) - 1 ? '1px solid #181818' : 'none' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1c1c1c', border: '1px solid #262626' }}>
                      <span className="text-white" style={{ fontSize: 12, fontWeight: 700 }}>{t.nombre.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white truncate" style={{ fontSize: 13 }}>{t.nombre}</p>
                      <p className="truncate" style={{ color: '#666', fontSize: 11.5 }}>{t.users[0]?.email ?? '—'}</p>
                    </div>
                  </div>
                  <span style={{ color: t.subscription?.plan ? '#ccc' : '#666', fontSize: 12.5 }}>
                    {t.subscription?.plan ? planLabel[t.subscription.plan] : 'Sin plan'}
                  </span>
                  <span className="flex items-center gap-1.5" style={{ color: '#bbb', fontSize: 12.5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: e.dot }} />
                    {e.label}
                  </span>
                  <span className="text-right" style={{ color: '#555', fontSize: 11.5 }}>{hace(t.createdAt)}</span>
                </div>
              )
            })
          )}
        </div>

        {/* Distribución de planes */}
        <div className="rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Distribución de planes</p>
          <div className="mt-5 space-y-4">
            {planDist.map(p => (
              <div key={p.plan}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span style={{ color: '#bbb', fontSize: 13 }}>{p.plan}</span>
                  <span className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>{p.count}</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: '#1f1f1f' }}>
                  <div className="h-full rounded-full" style={{ width: `${(p.count / maxPlan) * 100}%`, background: '#fff' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: '#1e1e1e', margin: '18px 0 14px' }} />
          <div className="flex items-center justify-between">
            <span style={{ color: '#777', fontSize: 12.5 }}>Ingreso anual proyectado</span>
            <span className="text-white" style={{ fontSize: 14, fontWeight: 700 }}>{fmt(mrr * 12)}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
