import { prisma } from './prisma'
import { getSessionUser } from './auth'

// El "parqueadero actual" sale del usuario logueado (sesión).
export async function getCurrentTenant() {
  const user = await getSessionUser()
  if (user?.tenant) return user.tenant
  throw new Error('Sin sesión válida')
}
