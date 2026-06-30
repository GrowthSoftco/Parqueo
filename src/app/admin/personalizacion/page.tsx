import { prisma } from '@/lib/prisma'
import PersonalizacionView from './PersonalizacionView'

export const dynamic = 'force-dynamic'

export default async function PersonalizacionPage() {
  const s = await prisma.setting.findUnique({ where: { key: 'loginBg' } })
  return <PersonalizacionView inicial={s?.value ?? null} />
}
