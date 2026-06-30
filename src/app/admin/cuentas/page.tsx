import { prisma } from '@/lib/prisma'
import CuentasView, { type Cuenta } from './CuentasView'

export const dynamic = 'force-dynamic'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const fecha = (d: Date) => `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
const corta = (d: Date) => `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]}`
const estadoMap = { ACTIVE: 'Activo', TRIAL: 'Prueba', SUSPENDED: 'Suspendido', BANNED: 'Baneado' } as const
const planMap: Record<string, Cuenta['plan']> = { BASICO: 'Básico', PRO: 'Pro', NEGOCIO: 'Negocio' }
const pagoMap: Record<string, string> = { PAGADO: 'Pagado', FALLIDO: 'Fallido', PENDIENTE: 'Pendiente' }

function hace(d: Date) {
  const min = Math.round((Date.now() - d.getTime()) / 60000)
  if (min < 60) return `Hace ${Math.max(1, min)} min`
  const h = Math.round(min / 60)
  if (h < 24) return `Hace ${h} h`
  return `Hace ${Math.round(h / 24)} días`
}

export default async function AdminCuentas() {
  const tenants = await prisma.tenant.findMany({
    include: {
      subscription: true,
      users: { where: { role: 'OWNER' }, take: 1 },
      payments: { orderBy: { paidAt: 'desc' } },
      _count: { select: { records: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const cuentas: Cuenta[] = tenants.map(t => ({
    id: t.id,
    nombre: t.nombre,
    dueño: t.users[0]?.nombre ?? '—',
    email: t.users[0]?.email ?? '—',
    tel: t.telefono ?? '—',
    ciudad: t.ciudad ?? '—',
    plan: t.subscription?.plan ? planMap[t.subscription.plan] : '—',
    estado: estadoMap[t.status],
    registro: fecha(t.createdAt),
    ultima: hace(t.updatedAt),
    espacios: t.espacios,
    vehiculosMes: t._count.records,
    pagos: t.payments.map(p => ({ fecha: corta(p.paidAt), monto: fmt(p.monto), estado: pagoMap[p.status] })),
  }))

  return <CuentasView cuentas={cuentas} />
}
