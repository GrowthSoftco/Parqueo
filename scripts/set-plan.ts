import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
async function main() {
  const plan = (process.argv[2] || 'NEGOCIO') as 'BASICO' | 'PRO' | 'NEGOCIO'
  const t = await prisma.tenant.findFirst({ where: { nombre: 'Las Palmas' } })
  if (!t) { console.log('No existe Las Palmas'); return }
  await prisma.subscription.update({ where: { tenantId: t.id }, data: { plan, status: 'ACTIVE' } })
  console.log(`Las Palmas -> ${plan}`)
}
main().then(() => prisma.$disconnect())
