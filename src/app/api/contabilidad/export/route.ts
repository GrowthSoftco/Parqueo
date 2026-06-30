import { getCurrentTenant } from '@/lib/tenant'
import { cargarMovimientos, normalizarPeriodo, rangoDe, PERIODO_LABEL } from '@/lib/contabilidad'

export const dynamic = 'force-dynamic'

function csvCampo(v: string | number): string {
  const s = String(v)
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(request: Request) {
  let tenant
  try {
    tenant = await getCurrentTenant()
  } catch {
    return new Response('no auth', { status: 401 })
  }

  const url = new URL(request.url)
  const periodo = normalizarPeriodo(url.searchParams.get('periodo') ?? undefined)
  const desde = rangoDe(periodo)
  const movs = await cargarMovimientos(tenant.id, desde)

  const total = movs.reduce((a, m) => a + m.monto, 0)
  const fechaFmt = (d: Date) =>
    d.toLocaleString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const filas = [
    ['Fecha', 'Tipo', 'Placa', 'Vehículo / Plan', 'Monto'],
    ...movs.map(m => [fechaFmt(m.fecha), m.tipo, m.detalle, m.vehiculo, m.monto]),
    [],
    ['', '', '', 'TOTAL', total],
  ]

  // BOM para que Excel abra los acentos bien
  const csv = '﻿' + filas.map(f => f.map(csvCampo).join(';')).join('\r\n')
  const nombre = `contabilidad-${periodo}-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nombre}"`,
      'Cache-Control': 'no-store',
      'X-Periodo': PERIODO_LABEL[periodo],
    },
  })
}
