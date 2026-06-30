import { prisma } from '@/lib/prisma'
import SuscripcionesView, { type Row } from './SuscripcionesView'
import type { StatCardProps } from '@/components/StatCard'

export const dynamic = 'force-dynamic'

const PRICE: Record<string, number> = { BASICO: 49900, PRO: 99900, NEGOCIO: 179900 }
const planLabel: Record<string, string> = { BASICO: 'Básico', PRO: 'Pro', NEGOCIO: 'Negocio' }
const pagoLabel: Record<string, string> = { PAGADO: 'Pagado', FALLIDO: 'Fallido', PENDIENTE: 'Pendiente' }
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const fmtM = (n: number) => '$' + (n / 1_000_000).toFixed(2) + 'M'
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const corta = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`

export default async function AdminSuscripciones() {
  const tenants = await prisma.tenant.findMany({
    include: { subscription: true, payments: { orderBy: { paidAt: 'desc' } } },
    orderBy: { nombre: 'asc' },
  })

  const rows: Row[] = tenants.map(t => {
    const s = t.subscription
    const monto = s?.plan ? PRICE[s.plan] : 0
    const estado: Row['estado'] =
      t.status === 'TRIAL' ? 'Prueba' : t.status === 'ACTIVE' ? 'Al día' : t.status === 'SUSPENDED' ? 'Suspendido' : 'Baneado'
    return {
      id: t.id,
      cuenta: t.nombre,
      plan: s?.plan ? planLabel[s.plan] : '—',
      monto: fmt(monto),
      prox: s?.periodEnd ? corta(s.periodEnd) : '—',
      estado,
      pagos: t.payments.map(p => ({ fecha: corta(p.paidAt), monto: fmt(p.monto), estado: pagoLabel[p.status] })),
    }
  })

  const mrr = tenants.filter(t => t.status === 'ACTIVE' && t.subscription?.plan).reduce((a, t) => a + PRICE[t.subscription!.plan!], 0)
  const activas = tenants.filter(t => t.status === 'ACTIVE').length
  const vencidos = tenants.filter(t => t.status === 'SUSPENDED' || t.status === 'BANNED').length

  const stats: StatCardProps[] = [
    { label: 'MRR', value: fmtM(mrr), note: 'mensual' },
    { label: 'Suscripciones activas', value: String(activas), note: 'pagando' },
    { label: 'Pagos vencidos', value: String(vencidos), tone: 'warn', change: vencidos > 0 ? 'Revisar' : undefined },
    { label: 'Ingreso anual proy. (ARR)', value: fmtM(mrr * 12), note: 'proyectado' },
  ]

  return <SuscripcionesView rows={rows} stats={stats} />
}
