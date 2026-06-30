import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner } from '@/lib/guard'
import SuscripcionesView, { type Sub } from './SuscripcionesView'
import type { StatCardProps } from '@/components/StatCard'

export const dynamic = 'force-dynamic'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const planLabel: Record<string, string> = { MENSUAL: 'Mensual', SEMANAL: 'Semanal', DIARIA: 'Diaria', NOCTURNA: 'Nocturna' }
const planDias: Record<string, number> = { MENSUAL: 30, NOCTURNA: 30, SEMANAL: 7, DIARIA: 1 }
const estadoLabel: Record<string, Sub['estado']> = { ACTIVA: 'Activa', POR_VENCER: 'Por vencer', VENCIDA: 'Vencida' }
const corta = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`
const larga = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`

export default async function SuscripcionesPage() {
  await requireOwner()
  const tenant = await getCurrentTenant()

  const subsDb = await prisma.clientSubscription.findMany({
    where: { tenantId: tenant.id },
    include: { customer: true },
    orderBy: { venceAt: 'asc' },
  })

  const subs: Sub[] = subsDb.map(s => {
    const diasTotal = planDias[s.plan] ?? 30
    const diasRestantes = Math.max(0, Math.ceil((s.venceAt.getTime() - Date.now()) / 86400000))
    return {
      id: s.id,
      placa: s.placa,
      cliente: s.customer?.nombre ?? '—',
      tel: s.customer?.telefono ?? '—',
      plan: planLabel[s.plan],
      monto: fmt(s.monto),
      inicio: corta(s.inicioAt),
      vence: corta(s.venceAt),
      diasRestantes,
      diasTotal,
      estado: estadoLabel[s.status],
      pagos: [{ fecha: larga(s.inicioAt), monto: fmt(s.monto), metodo: 'Mensualidad' }],
    }
  })

  const activas = subsDb.filter(s => s.status === 'ACTIVA').length
  const porVencer = subsDb.filter(s => s.status === 'POR_VENCER').length
  const totalClientes = await prisma.customer.count({ where: { tenantId: tenant.id } })

  const stats: StatCardProps[] = [
    { label: 'Suscripciones activas', value: String(activas), note: 'al día' },
    { label: 'Por vencer (7 días)', value: String(porVencer), change: porVencer > 0 ? 'Atención' : undefined, tone: 'warn' },
    { label: 'Total clientes', value: String(totalClientes), note: 'registrados' },
  ]

  const plan = (await prisma.subscription.findUnique({ where: { tenantId: tenant.id }, select: { plan: true } }))?.plan ?? null

  return <SuscripcionesView subs={subs} stats={stats} plan={plan} />
}
