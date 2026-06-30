import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import ParqueaderoView, { type Vehiculo, type ResumenCat } from './ParqueaderoView'

export const dynamic = 'force-dynamic'

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

function hace(d: Date) {
  const min = Math.round((Date.now() - d.getTime()) / 60000)
  if (min < 60) return `${Math.max(1, min)} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export default async function ParqueaderoPage() {
  const tenant = await getCurrentTenant()
  const [adentro, categorias] = await Promise.all([
    prisma.parkingRecord.findMany({ where: { tenantId: tenant.id, status: 'ADENTRO' }, orderBy: { entradaAt: 'desc' } }),
    prisma.category.findMany({ where: { tenantId: tenant.id }, orderBy: { orden: 'asc' }, select: { nombre: true, icono: true } }),
  ])

  const vehiculos: Vehiculo[] = adentro.map(r => ({
    recordId: r.id,
    placa: r.placa,
    tipoNombre: r.tipoNombre,
    icono: r.icono,
    desde: hhmm(r.entradaAt),
    hace: hace(r.entradaAt),
  }))

  const resumen: ResumenCat[] = categorias.map(c => ({
    nombre: c.nombre,
    icono: c.icono,
    count: vehiculos.filter(v => v.tipoNombre === c.nombre).length,
  }))

  const ocupados = vehiculos.length
  const total = tenant.espacios
  const libres = Math.max(0, total - ocupados)

  return <ParqueaderoView vehiculos={vehiculos} total={total} ocupados={ocupados} libres={libres} resumen={resumen} />
}
