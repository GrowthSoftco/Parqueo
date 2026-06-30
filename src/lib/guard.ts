import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { planTier } from '@/lib/plan'

// Páginas de dueño/admin. Si entra un empleado (EMPLEADO) lo manda a su zona.
export async function requireOwner() {
  const user = await getSessionUser()
  if (!user?.tenant) redirect('/login')
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') redirect('/dashboard/parqueadero')
  return user
}

// Módulos por plan: si el plan no alcanza el nivel, vuelve al dashboard.
export async function requireTier(tenantId: string, min: number) {
  const sub = await prisma.subscription.findUnique({ where: { tenantId }, select: { plan: true } })
  if (planTier(sub?.plan ?? null) < min) redirect('/dashboard')
}
