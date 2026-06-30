import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const s = await prisma.setting.findUnique({ where: { key: 'loginBg' } })
  return Response.json(
    { value: s?.value ?? null },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}
