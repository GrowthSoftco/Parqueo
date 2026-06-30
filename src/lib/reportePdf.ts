import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib'
import type { Movimiento } from '@/lib/contabilidad'

// A4
const W = 595.28
const H = 841.89
const M = 48
const XR = W - M

const c = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}
const INK = c('#1b1b1b')
const MUTED = c('#6f6b62')
const LINE = c('#d8d4ca')
const ACCENT = c('#2f2a24') // gris cálido oscuro (reemplaza el rojo)
const BG = c('#f6f4ef')

// Logo de Parqueo (paths del logo.svg, viewBox 40x40)
const LOGO = [
  'M30 40H19.5098C17.9943 40 16.5408 39.398 15.4692 38.3263L1.67368 24.5308C0.60204 23.4592 0 22.0057 0 20.4902V10L30 40Z',
  'M10.7143 39.9999H4.28571C1.91878 39.9999 0 38.0811 0 35.7142V29.2856L10.7143 39.9999Z',
  'M33.7239 36.5809C37.7426 32.5622 40.0002 27.1118 40.0002 21.4286C40.0002 15.7454 37.7426 10.2949 33.7239 6.27629C29.7053 2.25765 24.2549 1.02188e-06 18.5717 0C12.8884 -1.02187e-06 7.43801 2.25764 3.41937 6.27628L10.4904 13.3473C11.6062 14.4631 13.408 14.4074 14.8275 13.7181C15.9835 13.1568 17.2621 12.8571 18.5716 12.8571C20.8449 12.8571 23.0251 13.7602 24.6326 15.3677C26.24 16.9751 27.1431 19.1553 27.1431 21.4286C27.1431 22.7381 26.8434 24.0167 26.2821 25.1727C25.5928 26.5922 25.5371 28.394 26.6529 29.5098L33.7239 36.5809Z',
]

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const safe = (s: string) => s.replace(/[^\x00-\xFF]/g, '')
const fechaTxt = (d: Date) => {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}
const trunc = (s: string, max: number) => (s.length > max ? s.slice(0, max - 1) + '.' : s)

export type ReporteData = {
  tenantNombre: string
  direccion?: string
  nit?: string
  telefono?: string
  periodoLabel: string
  movs: Movimiento[]
}

export async function generarReportePdf({ tenantNombre, direccion, nit, telefono, periodoLabel, movs }: ReporteData): Promise<Uint8Array> {
  const rotacionTotal = movs.filter(m => m.tipo === 'Rotación').reduce((a, m) => a + m.monto, 0)
  const mensualidadTotal = movs.filter(m => m.tipo === 'Mensualidad').reduce((a, m) => a + m.monto, 0)
  const total = rotacionTotal + mensualidadTotal

  const doc = await PDFDocument.create()
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const reg = await doc.embedFont(StandardFonts.Helvetica)

  const COL = { num: M, fecha: M + 26, tipo: M + 150, placa: M + 255, veh: M + 345, monto: XR }

  let page: PDFPage
  let y = 0 // top-down (pdf-y = H - y)

  const text = (
    p: PDFPage, t: string, x: number, top: number,
    o: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; right?: number } = {},
  ) => {
    const size = o.size ?? 9
    const font = o.font ?? reg
    const s = safe(t)
    const px = o.right != null ? o.right - font.widthOfTextAtSize(s, size) : x
    p.drawText(s, { x: px, y: H - top, size, font, color: o.color ?? INK })
  }
  const hline = (p: PDFPage, top: number, x0 = M, x1 = XR, color = LINE) =>
    p.drawLine({ start: { x: x0, y: H - top }, end: { x: x1, y: H - top }, thickness: 0.8, color })

  // Dibuja el logo: x,topY en coords top-down; scale en px (ancho/alto del logo)
  const drawLogo = (p: PDFPage, x: number, top: number, px: number, color = INK, opacity = 1) => {
    const scale = px / 40
    for (const d of LOGO) p.drawSvgPath(d, { x, y: H - top, scale, color, opacity })
  }

  const newPage = (first: boolean) => {
    page = doc.addPage([W, H])
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: BG })

    // Marca de agua: logo gigante, muy tenue, centrado
    drawLogo(page, (W - 300) / 2, (H - 300) / 2, 300, INK, 0.035)

    if (first) {
      drawLogo(page, M, 44, 26, INK, 1)
      text(page, 'Parqueo', M + 36, 64, { size: 22, font: bold })
      text(page, 'REPORTE', XR, 56, { size: 16, font: bold, color: ACCENT, right: XR })
      text(page, 'de ingresos y movimientos', XR, 72, { size: 9, color: MUTED, right: XR })

      // Datos del parqueadero
      text(page, tenantNombre, M, 112, { size: 11, font: bold })
      const linea2 = [direccion, telefono].filter(Boolean).join('  ·  ')
      if (linea2) text(page, linea2, M, 127, { size: 8.5, color: MUTED })
      if (nit) text(page, `NIT ${nit}`, M, linea2 ? 140 : 127, { size: 8.5, color: MUTED })

      // Meta row
      hline(page, 158)
      const meta: [string, string][] = [
        ['Periodo', periodoLabel],
        ['Generado', fechaTxt(new Date())],
        ['Movimientos', String(movs.length)],
        ['Total ingresos', fmt(total)],
      ]
      const cols = [M, M + 135, M + 270, XR]
      meta.forEach(([k, v], i) => {
        const right = i === 3 ? XR : undefined
        text(page, k, cols[i], 176, { size: 8, color: MUTED, right })
        text(page, v, cols[i], 192, { size: 11, font: bold, right })
      })
      hline(page, 206)
      y = 240
    } else {
      y = 70
    }
    text(page, '#', COL.num, y, { size: 8, font: bold, color: MUTED })
    text(page, 'FECHA', COL.fecha, y, { size: 8, font: bold, color: MUTED })
    text(page, 'TIPO', COL.tipo, y, { size: 8, font: bold, color: MUTED })
    text(page, 'PLACA', COL.placa, y, { size: 8, font: bold, color: MUTED })
    text(page, 'VEHÍCULO', COL.veh, y, { size: 8, font: bold, color: MUTED })
    text(page, 'MONTO', 0, y, { size: 8, font: bold, color: MUTED, right: COL.monto })
    hline(page, y + 8)
    y += 26
  }

  newPage(true)

  const ROW = 21
  const LIMIT = H - 90

  if (movs.length === 0) {
    text(page!, 'Sin movimientos en este periodo.', M, y + 6, { size: 10, color: MUTED })
    y += 30
  }

  movs.forEach((m, i) => {
    if (y > LIMIT) newPage(false)
    text(page!, String(i + 1), COL.num, y, { size: 9, color: MUTED })
    text(page!, fechaTxt(m.fecha), COL.fecha, y, { size: 9 })
    text(page!, m.tipo, COL.tipo, y, { size: 9, color: m.tipo === 'Mensualidad' ? c('#8a4fc4') : INK })
    text(page!, m.detalle, COL.placa, y, { size: 9, font: bold })
    text(page!, trunc(m.vehiculo, 14), COL.veh, y, { size: 9, color: MUTED })
    text(page!, fmt(m.monto), 0, y, { size: 9, right: COL.monto })
    hline(page!, y + 7, M, XR, c('#e7e3da'))
    y += ROW
  })

  if (y + 96 > H - 60) newPage(false)
  y += 14
  const tx0 = W - M - 215
  const totals: [string, number][] = [
    ['Rotación', rotacionTotal],
    ['Mensualidades', mensualidadTotal],
  ]
  totals.forEach(([k, v]) => {
    text(page!, k, tx0, y, { size: 10, color: MUTED })
    text(page!, fmt(v), 0, y, { size: 10, right: XR })
    y += 22
  })
  hline(page!, y - 6, tx0, XR)
  y += 6
  text(page!, 'TOTAL', tx0, y, { size: 11, font: bold })
  text(page!, fmt(total), 0, y, { size: 13, font: bold, right: XR })

  const pages = doc.getPages()
  pages.forEach((p, i) => {
    hline(p, H - 56, M, XR, c('#e0dcd2'))
    text(p, 'Generado por Parqueo', M, H - 40, { size: 8, color: MUTED })
    text(p, `Página ${i + 1} de ${pages.length}`, 0, H - 40, { size: 8, color: MUTED, right: XR })
  })

  return doc.save()
}
