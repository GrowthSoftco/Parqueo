// Tiquetes térmicos (58/80mm) + impresión vía iframe oculto.
// Funciona en web y en Electron (window.print del documento del iframe).

import bwipjs from 'bwip-js/browser'

export type Empresa = { nombre: string; nit?: string; direccion?: string; telefono?: string }
// Qué campos del encabezado muestra el tiquete (lo decide el admin).
export type TicketCampos = { nit?: boolean; direccion?: boolean; telefono?: boolean }

const fmt$ = (n: number) => '$' + n.toLocaleString('es-CO')

// Genera el código del tiquete como SVG (Code128 para pistola láser, QR para cámara).
function codigoSVG(codigo: string, tipo: string): string {
  try {
    if (tipo === 'qr') return `<div class="qr">${bwipjs.toSVG({ bcid: 'qrcode', text: codigo, scale: 3 })}</div>`
    return `<div class="bc">${bwipjs.toSVG({ bcid: 'code128', text: codigo, scale: 2, height: 9, includetext: false })}</div>`
  } catch {
    return ''
  }
}
const p2 = (x: number) => String(x).padStart(2, '0')
const fecha = (d: Date) => `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`
const hora = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Logo de Parqueo (paths del logo.svg) para la marca de agua
const LOGO = `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><g fill="#000"><path d="M30 40H19.5098C17.9943 40 16.5408 39.398 15.4692 38.3263L1.67368 24.5308C0.60204 23.4592 0 22.0057 0 20.4902V10L30 40Z"/><path d="M10.7143 39.9999H4.28571C1.91878 39.9999 0 38.0811 0 35.7142V29.2856L10.7143 39.9999Z"/><path d="M33.7239 36.5809C37.7426 32.5622 40.0002 27.1118 40.0002 21.4286C40.0002 15.7454 37.7426 10.2949 33.7239 6.27629C29.7053 2.25765 24.2549 1.02188e-06 18.5717 0C12.8884 -1.02187e-06 7.43801 2.25764 3.41937 6.27628L10.4904 13.3473C11.6062 14.4631 13.408 14.4074 14.8275 13.7181C15.9835 13.1568 17.2621 12.8571 18.5716 12.8571C20.8449 12.8571 23.0251 13.7602 24.6326 15.3677C26.24 16.9751 27.1431 19.1553 27.1431 21.4286C27.1431 22.7381 26.8434 24.0167 26.2821 25.1727C25.5928 26.5922 25.5371 28.394 26.6529 29.5098L33.7239 36.5809Z"/></g></svg>`

const CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  @page { size: 80mm auto; margin: 0; }
  body { width: 76mm; margin: 0 auto; padding: 6px 4px 14px; font-family: 'Courier New', monospace; color:#000; font-size: 12px; line-height: 1.45; position:relative; }
  .wm { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:46mm; height:46mm; opacity:0.06; pointer-events:none; z-index:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .content { position:relative; z-index:1; }
  .c { text-align:center; }
  .b { font-weight:700; }
  .big { font-size: 20px; font-weight:700; letter-spacing:1px; }
  .xl { font-size: 22px; font-weight:700; }
  .muted { color:#333; font-size: 11px; }
  .hr { border:none; border-top:1px dashed #000; margin:7px 0; }
  .row { display:flex; justify-content:space-between; gap:8px; }
  .mt { margin-top:4px; }
  .pb { margin-top:8px; }
  .codebox { text-align:center; margin-top:9px; }
  .codebox .bc svg { max-width:64mm; height:auto; }
  .codebox .qr svg { width:30mm; height:30mm; }
`

function wrap(inner: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Tiquete</title><style>${CSS}</style></head><body><div class="wm">${LOGO}</div><div class="content">${inner}<div class="c muted pb">Con tecnología de Parqueo</div></div></body></html>`
}

function cabecera(e: Empresa, campos?: TicketCampos): string {
  const c = campos ?? {}
  const show = (v: boolean | undefined) => v !== false // por defecto se muestran
  return `
    <div class="c b" style="font-size:15px">${esc(e.nombre)}</div>
    ${e.nit && show(c.nit) ? `<div class="c muted">NIT ${esc(e.nit)}</div>` : ''}
    ${e.direccion && show(c.direccion) ? `<div class="c muted">${esc(e.direccion)}</div>` : ''}
    ${e.telefono && show(c.telefono) ? `<div class="c muted">Tel ${esc(e.telefono)}</div>` : ''}
  `
}

export function ticketEntrada(d: {
  empresa: Empresa; placa: string; tipoNombre: string; entradaAt?: Date
  codigo?: string; codigoTipo?: string; campos?: TicketCampos; mensualidad?: boolean
}): string {
  const t = d.entradaAt ?? new Date()
  return wrap(`
    ${cabecera(d.empresa, d.campos)}
    <hr class="hr"/>
    <div class="c b">TIQUETE DE ENTRADA</div>
    <hr class="hr"/>
    <div class="c muted">Placa</div>
    <div class="c big">${esc(d.placa)}</div>
    <div class="row mt"><span>Vehículo</span><span class="b">${esc(d.tipoNombre)}</span></div>
    <div class="row"><span>Fecha</span><span class="b">${fecha(t)}</span></div>
    <div class="row"><span>Hora entrada</span><span class="b">${hora(t)}</span></div>
    ${d.mensualidad ? `<hr class="hr"/><div class="c b">● MENSUALIDAD ●</div>` : ''}
    ${d.codigo && d.codigoTipo !== 'none' ? `<div class="codebox">${codigoSVG(d.codigo, d.codigoTipo || 'code128')}<div class="c muted mt">${esc(d.codigo)}</div></div>` : ''}
    <hr class="hr"/>
    <div class="c muted">Conserve este tiquete para retirar el vehículo</div>
  `)
}

export function ticketSalida(d: {
  empresa: Empresa; placa: string; tipoNombre: string
  entradaAt: Date; salidaAt: Date; minutos: number; monto: number; metodo: string; paga?: number
  descuento?: number; convenio?: string; mensualidad?: boolean; campos?: TicketCampos
}): string {
  const dur = d.minutos < 60 ? `${d.minutos} min` : `${Math.floor(d.minutos / 60)}h ${d.minutos % 60}m`
  const devuelta = d.paga && d.paga >= d.monto ? d.paga - d.monto : null
  return wrap(`
    ${cabecera(d.empresa, d.campos)}
    <hr class="hr"/>
    <div class="c b">RECIBO DE PAGO</div>
    <hr class="hr"/>
    <div class="c muted">Placa</div>
    <div class="c big">${esc(d.placa)}</div>
    <div class="row mt"><span>Vehículo</span><span class="b">${esc(d.tipoNombre)}</span></div>
    <div class="row"><span>Entrada</span><span class="b">${fecha(d.entradaAt)} ${hora(d.entradaAt)}</span></div>
    <div class="row"><span>Salida</span><span class="b">${fecha(d.salidaAt)} ${hora(d.salidaAt)}</span></div>
    <div class="row"><span>Tiempo</span><span class="b">${dur}</span></div>
    <div class="row"><span>Método</span><span class="b">${esc(d.metodo)}</span></div>
    ${d.convenio ? `<div class="row"><span>Convenio</span><span class="b">${esc(d.convenio)}</span></div>` : ''}
    ${d.descuento && d.descuento > 0 ? `<div class="row"><span>Descuento</span><span class="b">- ${fmt$(d.descuento)}</span></div>` : ''}
    <hr class="hr"/>
    ${d.mensualidad
      ? `<div class="c big">MENSUALIDAD</div><div class="c muted">Sin cobro — cliente con plan</div>`
      : `<div class="row"><span class="b">TOTAL</span><span class="xl">${fmt$(d.monto)}</span></div>
    ${d.paga ? `<div class="row mt"><span>Recibido</span><span class="b">${fmt$(d.paga)}</span></div>` : ''}
    ${devuelta != null ? `<div class="row"><span>Devuelta</span><span class="b">${fmt$(devuelta)}</span></div>` : ''}`}
    <hr class="hr"/>
    <div class="c muted">¡Gracias por su visita!</div>
    <div class="c muted">${fecha(d.salidaAt)} ${hora(d.salidaAt)}</div>
  `)
}

// Imprime el HTML en un iframe oculto (sin afectar la app)
export function imprimirTicket(html: string) {
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(html)
  doc.close()
  const win = iframe.contentWindow!
  setTimeout(() => {
    win.focus()
    win.print()
    setTimeout(() => document.body.removeChild(iframe), 800)
  }, 250)
}
