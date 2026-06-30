import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Páginas de dueño/admin. Si entra un empleado (EMPLEADO) lo manda a su zona.
export async function requireOwner() {
  const user = await getSessionUser()
  if (!user?.tenant) redirect('/login')
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') redirect('/dashboard/parqueadero')
  return user
}

// Plan actual del tenant (para mostrar la pantalla de upsell por módulo).
export async function getTenantPlan(tenantId: string): Promise<string | null> {
  const sub = await prisma.subscription.findUnique({ where: { tenantId }, select: { plan: true } })
  return sub?.plan ?? null
}
