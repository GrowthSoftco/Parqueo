import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner } from '@/lib/guard'
import { planTier } from '@/lib/plan'
import ReportesView from './ReportesView'
import ReportesUpsell from './ReportesUpsell'

export const dynamic = 'force-dynamic'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export default async function ReportesPage() {
  await requireOwner()
  const tenant = await getCurrentTenant()
  const plan = (await prisma.subscription.findUnique({ where: { tenantId: tenant.id }, select: { plan: true } }))?.plan ?? null
  if (planTier(plan) < 3) return <ReportesUpsell />

  // ---- Turnos cerrados (control de empleados / caja) ----
  const shifts = await prisma.shift.findMany({
    where: { tenantId: tenant.id, status: 'CERRADO' },
    orderBy: { cerradoAt: 'desc' },
    take: 80,
  })
  const turnos = shifts.map(s => {
    const esperado = s.base + s.total
    const dif = s.contado != null ? s.contado - esperado : null
    return {
      id: s.id,
      operario: s.operario,
      fecha: s.cerradoAt ? `${String(s.cerradoAt.getDate()).padStart(2, '0')} ${MESES[s.cerradoAt.getMonth()]}` : '—',
      base: s.base,
      recaudado: s.total,
      esperado,
      contado: s.contado,
      dif,
    }
  })

  const rankMap = new Map<string, { operario: string; turnos: number; recaudado: number; descuadre: number; cuadrados: number }>()
  for (const s of shifts) {
    const r = rankMap.get(s.operario) ?? { operario: s.operario, turnos: 0, recaudado: 0, descuadre: 0, cuadrados: 0 }
    r.turnos++
    r.recaudado += s.total
    if (s.contado != null) {
      const d = s.contado - (s.base + s.total)
      r.descuadre += d
      if (d === 0) r.cuadrados++
    }
    rankMap.set(s.operario, r)
  }
  const ranking = [...rankMap.values()].sort((a, b) => b.recaudado - a.recaudado)

  // ---- Analítica (últimos 6 meses) ----
  const desde = new Date()
  desde.setMonth(desde.getMonth() - 6)
  desde.setHours(0, 0, 0, 0)
  const recs = await prisma.parkingRecord.findMany({
    where: { tenantId: tenant.id, status: 'SALIO', salidaAt: { gte: desde } },
    select: { monto: true, entradaAt: true, salidaAt: true, tipoNombre: true },
  })

  const catMap = new Map<string, number>()
  let totalIngresos = 0
  for (const r of recs) {
    const m = r.monto ?? 0
    totalIngresos += m
    catMap.set(r.tipoNombre, (catMap.get(r.tipoNombre) ?? 0) + m)
  }
  const porCategoria = [...catMap.entries()]
    .map(([nombre, monto]) => ({ nombre, monto, pct: totalIngresos ? Math.round((monto / totalIngresos) * 100) : 0 }))
    .sort((a, b) => b.monto - a.monto)

  const porHora = Array(24).fill(0) as number[]
  for (const r of recs) porHora[r.entradaAt.getHours()]++
  const horaPico = porHora.indexOf(Math.max(...porHora, 0))

  const mesMap = new Map<string, number>()
  for (const r of recs) {
    if (!r.salidaAt) continue
    const d = r.salidaAt
    mesMap.set(`${d.getFullYear()}-${d.getMonth()}`, (mesMap.get(`${d.getFullYear()}-${d.getMonth()}`) ?? 0) + (r.monto ?? 0))
  }
  const ahora = new Date()
  const porMes: { label: string; monto: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    porMes.push({ label: MESES[d.getMonth()], monto: mesMap.get(`${d.getFullYear()}-${d.getMonth()}`) ?? 0 })
  }

  const vehiculos = recs.length
  const ticketProm = vehiculos ? Math.round(totalIngresos / vehiculos) : 0

  return (
    <ReportesView
      turnos={turnos}
      ranking={ranking}
      porCategoria={porCategoria}
      porHora={porHora}
      horaPico={horaPico}
      porMes={porMes}
      stats={{ totalIngresos, vehiculos, ticketProm }}
      empresa={tenant.nombre}
    />
  )
}
