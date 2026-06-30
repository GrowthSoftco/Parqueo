import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { getSessionUser } from '@/lib/auth'
import { getTenantPlan } from '@/lib/guard'
import { planTier } from '@/lib/plan'
import PlanUpsell from '@/components/PlanUpsell'
import { FileText } from 'lucide-react'
import HistorialView, { type Evento } from './HistorialView'

export const dynamic = 'force-dynamic'

const DIAS =['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

function duracion(a: Date, b: Date) {
  const min = Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000))
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default async function HistorialPage() {
  const tenant = await getCurrentTenant()
  if (planTier(await getTenantPlan(tenant.id)) < 2) {
    return <PlanUpsell modulo="Historial completo" descripcion="Consulta y busca todos los movimientos por placa, con duración, montos y filtros. Disponible desde el plan Pro." plan="PRO" icon={FileText} />
  }
  const user = await getSessionUser()
  const esOwner = user?.role === 'OWNER' || user?.role === 'ADMIN'
  const registros = await prisma.parkingRecord.findMany({
    where: { tenantId: tenant.id },
    orderBy: { entradaAt: 'desc' },
    take: 100,
  })

  // Convertir cada registro en eventos (entrada / salida), ordenados por hora
  type EvTime = Evento & { _t: number }
  const lista: EvTime[] = []
  for (const r of registros) {
    lista.push({
      recordId: r.id,
      placa: r.placa,
      tipo: r.tipoNombre,
      hora: hhmm(r.entradaAt),
      accion: 'Entró',
      enCurso: r.status === 'ADENTRO',
      _t: r.entradaAt.getTime(),
    })
    if (r.salidaAt) {
      lista.push({
        recordId: r.id,
        placa: r.placa,
        tipo: r.tipoNombre,
        hora: hhmm(r.salidaAt),
        accion: 'Salió',
        monto: r.monto != null ? fmt(r.monto) : undefined,
        tiempo: duracion(r.entradaAt, r.salidaAt),
        _t: r.salidaAt.getTime(),
      })
    }
  }
  lista.sort((a, b) => b._t - a._t)
  const eventos: Evento[] = lista.map(({ _t, ...e }) => e)

  const now = new Date()
  const fecha = `Hoy · ${DIAS[now.getDay()]} ${now.getDate()} de ${MESES[now.getMonth()]}`

  return <HistorialView eventos={eventos} fecha={fecha} esOwner={esOwner} />
}
