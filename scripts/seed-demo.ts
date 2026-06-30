import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'laspalmas@parqueo.com'
  const password = 'palmas123'
  const limpio = email.trim().toLowerCase()

  // Si ya existe, lo borramos para recrearlo limpio
  const existente = await prisma.user.findUnique({ where: { email: limpio }, include: { tenant: true } })
  if (existente?.tenantId) {
    await prisma.tenant.delete({ where: { id: existente.tenantId } })
    console.log('Cuenta anterior eliminada, recreando…')
  }

  const hash = await bcrypt.hash(password, 10)
  const tenant = await prisma.tenant.create({
    data: {
      nombre: 'Las Palmas',
      ciudad: 'Medellín',
      direccion: 'Cra. 25 #3 Sur-45, El Poblado, Medellín',
      telefono: '604 312 8890',
      nit: '901.455.220-7',
      status: 'ACTIVE',
      espacios: 120,
      autoRecibo: true,
      users: { create: { email: limpio, passwordHash: hash, nombre: 'Las Palmas', role: 'OWNER' } },
      subscription: {
        create: {
          plan: 'PRO',
          status: 'ACTIVE',
          cycle: 'MENSUAL',
          periodEnd: new Date(Date.now() + 30 * 86400000),
        },
      },
      categories: {
        create: [
          { nombre: 'Carro', icono: 'car', orden: 0, esDefault: true, modo: 'FRACCION', fraccionMin: 15, fraccionPrecio: 1700, plenaPrecio: 6000, toleranciaMin: 10, porDia: 20000, porMes: 200000 },
          { nombre: 'Moto', icono: 'motorbike', orden: 1, esDefault: true, modo: 'FRACCION', fraccionMin: 15, fraccionPrecio: 900, plenaPrecio: 3500, toleranciaMin: 10, porDia: 11000, porMes: 95000 },
          { nombre: 'Bici', icono: 'bike', orden: 2, esDefault: true, modo: 'FRACCION', fraccionMin: 30, fraccionPrecio: 600, plenaPrecio: 2000, toleranciaMin: 15, porDia: 5000, porMes: 45000 },
          { nombre: 'Camioneta', icono: 'truck', orden: 3, esDefault: false, modo: 'FRACCION', fraccionMin: 15, fraccionPrecio: 2200, plenaPrecio: 8000, toleranciaMin: 10, porDia: 26000, porMes: 260000 },
        ],
      },
    },
    include: { users: true, categories: true },
  })

  console.log('\n✅ Parqueadero creado:')
  console.log('   Nombre :', tenant.nombre, '—', tenant.ciudad)
  console.log('   Plan   : PRO (activo)')
  console.log('   Email  :', email)
  console.log('   Clave  :', password)
  console.log('   Categorías:', tenant.categories.map(c => c.nombre).join(', '))
}

main()
  .then(() => prisma.$disconnect())
  .catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1) })
