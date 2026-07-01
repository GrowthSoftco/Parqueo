import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner } from '@/lib/guard'
import ConfiguracionView from './ConfiguracionView'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const user = await requireOwner()
  const t = await getCurrentTenant()
  const seccion = (await searchParams).s
  const [cats, empleados, sub, convenios] = await Promise.all([
    prisma.category.findMany({ where: { tenantId: t.id }, orderBy: { orden: 'asc' } }),
    prisma.user.findMany({ where: { tenantId: t.id, role: 'EMPLEADO' }, orderBy: { createdAt: 'asc' }, select: { id: true, nombre: true, email: true } }),
    prisma.subscription.findUnique({ where: { tenantId: t.id }, select: { plan: true } }),
    prisma.convenio.findMany({ where: { tenantId: t.id }, orderBy: { createdAt: 'desc' }, select: { id: true, nombre: true, tipo: true, valor: true, activo: true } }),
  ])
  let ticketCampos: Record<string, boolean> = {}
  try { ticketCampos = JSON.parse(t.ticketConfig || '{}') } catch {}

  const categorias = cats.map(c => ({
    id: c.id,
    nombre: c.nombre,
    icono: c.icono,
    esDefault: c.esDefault,
    modo: c.modo as 'FRACCION' | 'PLENA',
    fraccionMin: String(c.fraccionMin),
    fraccionPrecio: String(c.fraccionPrecio),
    plenaPrecio: String(c.plenaPrecio),
    tolOn: c.toleranciaMin > 0,
    toleranciaMin: String(c.toleranciaMin),
    dia: String(c.porDia),
    mes: String(c.porMes),
  }))

  return (
    <ConfiguracionView
      tenant={{ nombre: t.nombre, direccion: t.direccion ?? '', telefono: t.telefono ?? '', nit: t.nit ?? '' }}
      perfil={{ nombre: user?.nombre ?? '', email: user?.email ?? '' }}
      categorias={categorias}
      plan={sub?.plan ?? null}
      espacios={t.espacios}
      autoRecibo={t.autoRecibo}
      empleados={empleados}
      operacion={{ preguntarEstadia: t.preguntarEstadia, tarifaPerdido: t.tarifaPerdido, ticketCodigo: t.ticketCodigo, ticketCampos }}
      convenios={convenios}
      seccionInicial={seccion === 'perfil' ? 'perfil' : 'general'}
    />
  )
}
