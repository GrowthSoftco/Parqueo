import { getCurrentTenant } from '@/lib/tenant'
import { cargarMovimientos, normalizarPeriodo, rangoDe, PERIODO_LABEL } from '@/lib/contabilidad'
import { generarReportePdf } from '@/lib/reportePdf'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  let tenant
  try {
    tenant = await getCurrentTenant()
  } catch {
    return new Response('no auth', { status: 401 })
  }

  const url = new URL(request.url)
  const periodo = normalizarPeriodo(url.searchParams.get('periodo') ?? undefined)
  const movs = await cargarMovimientos(tenant.id, rangoDe(periodo))

  const bytes = await generarReportePdf({
    tenantNombre: tenant.nombre,
    direccion: tenant.direccion ?? undefined,
    nit: tenant.nit ?? undefined,
    telefono: tenant.telefono ?? undefined,
    periodoLabel: PERIODO_LABEL[periodo],
    movs,
  })

  const nombre = `reporte-${periodo}-${new Date().toISOString().slice(0, 10)}.pdf`
  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Cache-Control': 'no-store',
    },
  })
}
