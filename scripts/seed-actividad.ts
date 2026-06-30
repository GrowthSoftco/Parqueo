import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// Cobro por fracción, igual que calcularCobro en la app
function cobro(cat: { fraccionMin: number | null; fraccionPrecio: number | null; toleranciaMin: number | null }, minutos: number) {
  const fMin = cat.fraccionMin ?? 15
  const fPre = cat.fraccionPrecio ?? 1500
  const tol = cat.toleranciaMin ?? 0
  const fracciones = Math.max(1, Math.ceil((minutos - tol) / fMin))
  return fracciones * fPre
}

const LETRAS = 'ABCDEFGHJKLMNPRSTVWXYZ'
const rnd = (n: number) => Math.floor(Math.random() * n)
const pick = <T,>(a: T[]) => a[rnd(a.length)]
function placaCarro() { return `${pick([...LETRAS])}${pick([...LETRAS])}${pick([...LETRAS])}${rnd(10)}${rnd(10)}${rnd(10)}` }
function placaMoto() { return `${pick([...LETRAS])}${pick([...LETRAS])}${pick([...LETRAS])}${rnd(10)}${rnd(10)}${pick([...LETRAS])}` }

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { nombre: 'Las Palmas' }, include: { categories: { orderBy: { orden: 'asc' } } } })
  if (!tenant) throw new Error('No existe el parqueadero "Las Palmas". Corre primero seed-demo.ts')

  // Limpiar actividad previa para dejarlo consistente
  await prisma.parkingRecord.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.shift.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.clientSubscription.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.customer.deleteMany({ where: { tenantId: tenant.id } })

  const cats = tenant.categories
  const carro = cats.find(c => c.nombre === 'Carro')!
  const moto = cats.find(c => c.nombre === 'Moto')!
  const camioneta = cats.find(c => c.nombre === 'Camioneta') ?? carro
  // Mezcla realista: muchos carros, varias motos, alguna camioneta
  const mezcla = [carro, carro, carro, carro, carro, moto, moto, moto, camioneta]
  const placaDe = (c: typeof carro) => (c.nombre === 'Moto' ? placaMoto() : placaCarro())

  const ahora = new Date()
  const inicioDia = new Date(ahora); inicioDia.setHours(6, 0, 0, 0) // abrió 6:00 am

  // ---- Vehículos que YA SALIERON hoy (rotación con cobro) ----
  let totalCaja = 0
  const salidas = []
  const numSalidas = 34
  for (let i = 0; i < numSalidas; i++) {
    const cat = pick(mezcla)
    // entrada entre 6:00 y hace ~30 min
    const entrada = new Date(inicioDia.getTime() + rnd((ahora.getTime() - inicioDia.getTime()) - 30 * 60000))
    const estadia = 20 + rnd(240) // 20 min a 4.3 h
    const salida = new Date(Math.min(entrada.getTime() + estadia * 60000, ahora.getTime() - 60000))
    const minutos = Math.round((salida.getTime() - entrada.getTime()) / 60000)
    const monto = cobro(cat, minutos)
    totalCaja += monto
    salidas.push({
      tenantId: tenant.id, placa: placaDe(cat), categoryId: cat.id, tipoNombre: cat.nombre, icono: cat.icono,
      entradaAt: entrada, salidaAt: salida, monto, status: 'SALIO' as const,
    })
  }
  await prisma.parkingRecord.createMany({ data: salidas })

  // ---- Vehículos ACTUALMENTE ADENTRO ----
  const adentro = []
  const numAdentro = 27
  for (let i = 0; i < numAdentro; i++) {
    const cat = pick(mezcla)
    const entrada = new Date(inicioDia.getTime() + rnd(ahora.getTime() - inicioDia.getTime()))
    adentro.push({
      tenantId: tenant.id, placa: placaDe(cat), categoryId: cat.id, tipoNombre: cat.nombre, icono: cat.icono,
      entradaAt: entrada, status: 'ADENTRO' as const,
    })
  }
  await prisma.parkingRecord.createMany({ data: adentro })

  // ---- Turno abierto (caja de hoy) ----
  await prisma.shift.create({
    data: { tenantId: tenant.id, operario: 'Las Palmas', base: 50000, total: totalCaja, status: 'ABIERTO', abiertoAt: inicioDia },
  })

  // ---- Mensualidades (clientes fijos) ----
  const clientes = [
    { nombre: 'Andrés Gómez', telefono: '300 412 7788', plan: 'MENSUAL' as const, monto: 200000, placa: placaCarro(), dias: 18 },
    { nombre: 'María Restrepo', telefono: '301 556 2210', plan: 'MENSUAL' as const, monto: 200000, placa: placaCarro(), dias: 25 },
    { nombre: 'Juan Ospina', telefono: '310 778 9012', plan: 'MENSUAL' as const, monto: 95000, placa: placaMoto(), dias: 5 },
    { nombre: 'Laura Mejía', telefono: '320 224 6655', plan: 'MENSUAL' as const, monto: 200000, placa: placaCarro(), dias: 2 },
    { nombre: 'Carlos Zapata', telefono: '311 990 3344', plan: 'SEMANAL' as const, monto: 55000, placa: placaCarro(), dias: 3 },
    { nombre: 'Distribuciones El Poblado', telefono: '604 444 1212', plan: 'MENSUAL' as const, monto: 260000, placa: placaCarro(), dias: 12 },
  ]
  for (const c of clientes) {
    const vence = new Date(ahora.getTime() + c.dias * 86400000)
    const inicio = new Date(vence.getTime() - 30 * 86400000)
    const status = c.dias <= 5 ? 'POR_VENCER' as const : 'ACTIVA' as const
    await prisma.customer.create({
      data: {
        tenantId: tenant.id, nombre: c.nombre, telefono: c.telefono,
        clientSubs: { create: { tenantId: tenant.id, placa: c.placa, plan: c.plan, monto: c.monto, inicioAt: inicio, venceAt: vence, status } },
      },
    })
  }

  const cuposUsados = numAdentro
  console.log('\n✅ Actividad realista cargada en "Las Palmas":')
  console.log(`   Adentro ahora : ${cuposUsados} / ${tenant.espacios} cupos`)
  console.log(`   Salidas hoy   : ${numSalidas} vehículos`)
  console.log(`   En caja       : $${(50000 + totalCaja).toLocaleString('es-CO')} (base $50.000 + $${totalCaja.toLocaleString('es-CO')} rotación)`)
  console.log(`   Mensualidades : ${clientes.length} clientes (2 por vencer)`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1) })
