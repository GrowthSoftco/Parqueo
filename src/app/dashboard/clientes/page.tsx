import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner } from '@/lib/guard'
import ClientesView, { type Cliente } from './ClientesView'
import type { StatCardProps } from '@/components/StatCard'

export const dynamic = 'force-dynamic'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const planLabel: Record<string, string> = { MENSUAL: 'Mensual', SEMANAL: 'Semanal', DIARIA: 'Diaria', NOCTURNA: 'Nocturna' }
const planDias: Record<string, number> = { MENSUAL: 30, NOCTURNA: 30, SEMANAL: 7, DIARIA: 1 }
const estadoLabel: Record<string, Cliente['estado']> = { ACTIVA: 'Activa', POR_VENCER: 'Por vencer', VENCIDA: 'Vencida' }

function hora(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function fechaEvento(d: Date) {
  const hoy = new Date()
  const mismoDia = d.toDateString() === hoy.toDateString()
  const ayer = new Date(hoy.getTime() - 86400000).toDateString() === d.toDateString()
  if (mismoDia) return `Hoy · ${hora(d)}`
  if (ayer) return `Ayer · ${hora(d)}`
  return `${d.getDate()} ${MESES[d.getMonth()]} · ${hora(d)}`
}
function desde(d: Date) {
  return `${cap(MESES[d.getMonth()])} ${d.getFullYear()}`
}
function venceFmt(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export default async function ClientesPage() {
  await requireOwner()
  const tenant = await getCurrentTenant()

  const [customers, records] = await Promise.all([
    prisma.customer.findMany({
      where: { tenantId: tenant.id },
      include: { clientSubs: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.parkingRecord.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ salidaAt: 'desc' }, { entradaAt: 'desc' }],
    }),
  ])

  // categoría por placa (derivada de los registros)
  const catPorPlaca = new Map<string, { nombre: string; icono: string }>()
  for (const r of records) if (!catPorPlaca.has(r.placa)) catPorPlaca.set(r.placa, { nombre: r.tipoNombre, icono: r.icono })

  const clientes: Cliente[] = customers.map(c => {
    const sub = c.clientSubs[0]
    const placas = [...new Set(c.clientSubs.map(s => s.placa))]
    const placaPrincipal = placas[0] ?? '—'

    const diasTotal = sub ? planDias[sub.plan] ?? 30 : 30
    const diasRestantes = sub ? Math.max(0, Math.ceil((sub.venceAt.getTime() - Date.now()) / 86400000)) : 0

    // timeline: entradas/salidas de sus placas + pago de la mensualidad
    const eventos: Cliente['timeline'] = []
    for (const r of records.filter(r => placas.includes(r.placa)).slice(0, 5)) {
      if (r.salidaAt) eventos.push({ tipo: 'out', detalle: `Salida · ${r.placa}`, fecha: fechaEvento(r.salidaAt) })
      eventos.push({ tipo: 'in', detalle: `Entrada · ${r.placa}`, fecha: fechaEvento(r.entradaAt) })
    }
    if (sub) eventos.push({ tipo: 'pago', detalle: `Pago ${planLabel[sub.plan].toLowerCase()} · ${fmt(sub.monto)}`, fecha: fechaEvento(sub.inicioAt) })

    return {
      id: c.id,
      nombre: c.nombre,
      placa: placaPrincipal,
      tel: c.telefono ?? '—',
      email: c.email ?? '—',
      plan: sub ? planLabel[sub.plan] : '—',
      desde: desde(c.createdAt),
      estado: sub ? estadoLabel[sub.status] : 'Vencida',
      vehiculos: placas.map(p => {
        const info = catPorPlaca.get(p)
        return { placa: p, tipoNombre: info?.nombre ?? '—', icono: info?.icono ?? 'car' }
      }),
      mensualidad: {
        plan: sub ? planLabel[sub.plan] : '—',
        monto: sub ? fmt(sub.monto) : '$0',
        vence: sub ? venceFmt(sub.venceAt) : '—',
        diasRestantes,
        diasTotal,
      },
      timeline: eventos.slice(0, 6),
    }
  })

  // Stats reales
  const total = customers.length
  const activos = customers.filter(c => c.clientSubs.some(s => s.status === 'ACTIVA')).length
  const porVencer = customers.filter(c => c.clientSubs.some(s => s.status === 'POR_VENCER')).length
  const ahora = new Date()
  const nuevos = customers.filter(c => c.createdAt.getMonth() === ahora.getMonth() && c.createdAt.getFullYear() === ahora.getFullYear()).length

  const stats: StatCardProps[] = [
    { label: 'Total clientes', value: String(total), note: 'registrados' },
    { label: 'Suscriptores activos', value: String(activos), note: 'al día' },
    { label: 'Por vencer (7 días)', value: String(porVencer), change: porVencer > 0 ? 'Atención' : undefined, tone: 'warn' },
    { label: 'Nuevos este mes', value: String(nuevos), note: 'este mes' },
  ]

  return <ClientesView clientes={clientes} stats={stats} />
}
