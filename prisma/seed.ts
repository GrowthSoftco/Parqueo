import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const days = (n: number) => new Date(Date.now() + n * 86400000)
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000)

async function main() {
  console.log('Limpiando datos...')
  await prisma.auditLog.deleteMany()
  await prisma.clientSubscription.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.parkingRecord.deleteMany()
  await prisma.category.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  // Operador (super admin)
  await prisma.user.create({
    data: {
      email: 'operador@parqueo.com',
      passwordHash: 'seed-pending-auth',
      nombre: 'Radix LLC',
      role: 'SUPER_ADMIN',
    },
  })

  // ---- Tenant principal (el que ve la app) ----
  const centro = await prisma.tenant.create({
    data: {
      nombre: 'Parqueadero El Centro',
      direccion: 'Calle 10 #5-20, Centro',
      telefono: '(601) 234 5678',
      nit: '900.123.456-7',
      ciudad: 'Bogotá',
      status: 'ACTIVE',
      espacios: 50,
      users: {
        create: {
          email: 'admin@parqueo.com',
          passwordHash: 'seed-pending-auth',
          nombre: 'Juan Pérez',
          role: 'OWNER',
        },
      },
      subscription: {
        create: { plan: 'PRO', status: 'ACTIVE', cycle: 'MENSUAL', periodEnd: days(20) },
      },
      categories: {
        create: [
          { nombre: 'Carro', icono: 'car', orden: 0, esDefault: true, modo: 'FRACCION', fraccionMin: 15, fraccionPrecio: 1500, plenaPrecio: 5000, toleranciaMin: 10, porDia: 18000, porMes: 180000 },
          { nombre: 'Moto', icono: 'motorbike', orden: 1, esDefault: true, modo: 'FRACCION', fraccionMin: 15, fraccionPrecio: 800, plenaPrecio: 3000, toleranciaMin: 10, porDia: 10000, porMes: 90000 },
          { nombre: 'Bici', icono: 'bike', orden: 2, esDefault: true, modo: 'FRACCION', fraccionMin: 30, fraccionPrecio: 500, plenaPrecio: 1500, toleranciaMin: 15, porDia: 4000, porMes: 40000 },
        ],
      },
      payments: {
        create: [
          { monto: 99900, metodo: 'Nequi', concepto: 'Plan Pro · junio', paidAt: days(-5) },
          { monto: 99900, metodo: 'Efectivo', concepto: 'Plan Pro · mayo', paidAt: days(-35) },
        ],
      },
      invoices: {
        create: [
          { numero: 'FE-0012', monto: 99900, status: 'Pagada', issuedAt: days(-5) },
          { numero: 'FE-0008', monto: 99900, status: 'Pagada', issuedAt: days(-35) },
        ],
      },
      shifts: {
        create: { operario: 'Juan Pérez', base: 50000, total: 184500, status: 'ABIERTO', abiertoAt: hoursAgo(6) },
      },
    },
  })

  // Clientes + suscripciones del parqueadero principal
  const clientes = [
    { nombre: 'María González', tel: '300 123 4567', placa: 'ABC 123', plan: 'MENSUAL', monto: 180000, vence: 4 },
    { nombre: 'Pedro Ramírez', tel: '301 987 6543', placa: 'XYZ 789', plan: 'NOCTURNA', monto: 90000, vence: 18 },
    { nombre: 'Laura Díaz', tel: '310 555 1212', placa: 'QWE 456', plan: 'MENSUAL', monto: 180000, vence: 3 },
    { nombre: 'Andrés Polo', tel: '320 444 7788', placa: 'RTY 321', plan: 'SEMANAL', monto: 40000, vence: 4 },
  ] as const

  for (const c of clientes) {
    const cust = await prisma.customer.create({
      data: { tenantId: centro.id, nombre: c.nombre, telefono: c.tel },
    })
    await prisma.clientSubscription.create({
      data: {
        tenantId: centro.id,
        customerId: cust.id,
        placa: c.placa,
        plan: c.plan,
        monto: c.monto,
        venceAt: days(c.vence),
        status: c.vence <= 5 ? 'POR_VENCER' : 'ACTIVA',
      },
    })
  }

  // Registros de entrada/salida
  await prisma.parkingRecord.createMany({
    data: [
      { tenantId: centro.id, placa: 'ABC 123', tipoNombre: 'Carro', icono: 'car', entradaAt: hoursAgo(2), status: 'ADENTRO' },
      { tenantId: centro.id, placa: 'XYZ 789', tipoNombre: 'Moto', icono: 'motorbike', entradaAt: hoursAgo(1), status: 'ADENTRO' },
      { tenantId: centro.id, placa: 'QWE 456', tipoNombre: 'Carro', icono: 'car', entradaAt: hoursAgo(5), salidaAt: hoursAgo(3), monto: 9200, status: 'SALIO' },
      { tenantId: centro.id, placa: 'RTY 321', tipoNombre: 'Bici', icono: 'bike', entradaAt: hoursAgo(6), salidaAt: hoursAgo(5), monto: 1500, status: 'SALIO' },
      { tenantId: centro.id, placa: 'MNO 654', tipoNombre: 'Moto', icono: 'motorbike', entradaAt: hoursAgo(7), salidaAt: hoursAgo(4), monto: 6700, status: 'SALIO' },
    ],
  })

  // ---- Otros tenants (para la consola de operador) ----
  const otros = [
    { nombre: 'AutoParking Norte', ciudad: 'Medellín', status: 'TRIAL', plan: null, espacios: 40 },
    { nombre: 'Parqueadero La 80', ciudad: 'Cali', status: 'ACTIVE', plan: 'BASICO', espacios: 50 },
    { nombre: 'Estación Central', ciudad: 'Bogotá', status: 'ACTIVE', plan: 'NEGOCIO', espacios: 200 },
    { nombre: 'Parqueadero Sur', ciudad: 'Barranquilla', status: 'SUSPENDED', plan: 'BASICO', espacios: 35 },
    { nombre: 'MotoParking Express', ciudad: 'Bucaramanga', status: 'BANNED', plan: null, espacios: 60 },
  ] as const

  for (const t of otros) {
    await prisma.tenant.create({
      data: {
        nombre: t.nombre,
        ciudad: t.ciudad,
        status: t.status,
        espacios: t.espacios,
        subscription: {
          create: {
            plan: t.plan,
            status: t.status === 'TRIAL' ? 'TRIAL' : t.status === 'ACTIVE' ? 'ACTIVE' : 'PAST_DUE',
            cycle: 'MENSUAL',
          },
        },
      },
    })
  }

  console.log('✅ Seed completo.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
