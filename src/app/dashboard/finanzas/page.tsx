import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner, getTenantPlan } from '@/lib/guard'
import { planTier } from '@/lib/plan'
import PlanUpsell from '@/components/PlanUpsell'
import { Wallet } from 'lucide-react'
import FinanzasView, { type MovVM } from './FinanzasView'

export const dynamic = 'force-dynamic'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const corta = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`

export default async function FinanzasPage() {
  await requireOwner()
  const tenant = await getCurrentTenant()
  if (planTier(await getTenantPlan(tenant.id)) < 3) {
    return (
      <PlanUpsell
        modulo="Finanzas"
        descripcion="Controla el capital de tu negocio, registra ingresos y egresos (nómina, servicios, insumos) y mira tu balance real. Disponible en el plan Negocio."
        plan="NEGOCIO"
        icon={Wallet}
        puntos={[
          { t: 'Capital y balance', d: 'Cuánta plata debería haber, en tiempo real.' },
          { t: 'Ingresos y egresos', d: 'Nómina, servicios, insumos y más.' },
          { t: 'Recordatorios', d: 'Gastos recurrentes como la nómina.' },
        ]}
      />
    )
  }

  const [entries, agg] = await Promise.all([
    prisma.financeEntry.findMany({ where: { tenantId: tenant.id }, orderBy: { fecha: 'desc' } }),
    prisma.parkingRecord.aggregate({ where: { tenantId: tenant.id, status: 'SALIO' }, _sum: { monto: true } }),
  ])

  const operativo = agg._sum.monto ?? 0
  const ingresosManual = entries.filter(e => e.tipo === 'INGRESO').reduce((s, e) => s + e.monto, 0)
  const egresos = entries.filter(e => e.tipo === 'EGRESO').reduce((s, e) => s + e.monto, 0)
  const capital = tenant.capital
  const balance = capital + operativo + ingresosManual - egresos

  const movs: MovVM[] = entries.map(e => ({
    id: e.id, tipo: e.tipo, categoria: e.categoria, concepto: e.concepto, monto: e.monto,
    recurrente: e.recurrente, fecha: corta(e.fecha),
  }))
  const recordatorios = movs.filter(m => m.recurrente)

  return (
    <FinanzasView
      capital={capital}
      stats={{ operativo, ingresosManual, egresos, balance }}
      movimientos={movs}
      recordatorios={recordatorios}
    />
  )
}
