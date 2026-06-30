import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'

// Páginas de dueño/admin. Si entra un empleado (EMPLEADO) lo manda a su zona.
export async function requireOwner() {
  const user = await getSessionUser()
  if (!user?.tenant) redirect('/login')
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') redirect('/dashboard/parqueadero')
  return user
}
