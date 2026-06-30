import { prisma } from '@/lib/prisma'

export type Periodo = 'hoy' | 'semana' | 'mes' | 'anio' | 'todo'

export const PERIODO_LABEL: Record<Periodo, string> = {
  hoy: 'Hoy',
  semana: 'Esta semana',
  mes: 'Este mes',
  anio: 'Este año',
  todo: 'Histórico',
}

export function normalizarPeriodo(v: string | undefined): Periodo {
  const ok: Periodo[] = ['hoy', 'semana', 'mes', 'anio', 'todo']
  return ok.includes(v as Periodo) ? (v as Periodo) : 'mes'
}

// Inicio del rango según el periodo (fin = ahora)
export function rangoDe(periodo: Periodo, now = new Date()): Date {
  switch (periodo) {
    case 'hoy':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'semana': {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const dow = (d.getDay() + 6) % 7 // lunes = 0
      d.setDate(d.getDate() - dow)
      return d
    }
    case 'mes':
      return new Date(now.getFullYear(), now.getMonth(), 1)
    case 'anio':
      return new Date(now.getFullYear(), 0, 1)
    case 'todo':
      return new Date(0)
  }
}

export type Movimiento = {
  fecha: Date
  tipo: 'Rotación' | 'Mensualidad'
  detalle: string // placa
  vehiculo: string // CARRO/MOTO/BICI o plan
  monto: number
}

// Trae los dos flujos de ingreso reales del parqueadero y los une.
export async function cargarMovimientos(tenantId: string, desde: Date): Promise<Movimiento[]> {
  const [salidas, subs] = await Promise.all([
    prisma.parkingRecord.findMany({
      where: { tenantId, status: 'SALIO', salidaAt: { gte: desde }, monto: { not: null } },
      select: { placa: true, tipoNombre: true, monto: true, salidaAt: true },
    }),
    prisma.clientSubscription.findMany({
      where: { tenantId, inicioAt: { gte: desde } },
      select: { placa: true, plan: true, monto: true, inicioAt: true },
    }),
  ])

  const movs: Movimiento[] = [
    ...salidas.map(s => ({
      fecha: s.salidaAt as Date,
      tipo: 'Rotación' as const,
      detalle: s.placa,
      vehiculo: s.tipoNombre,
      monto: s.monto ?? 0,
    })),
    ...subs.map(s => ({
      fecha: s.inicioAt,
      tipo: 'Mensualidad' as const,
      detalle: s.placa,
      vehiculo: s.plan,
      monto: s.monto,
    })),
  ]

  movs.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
  return movs
}
