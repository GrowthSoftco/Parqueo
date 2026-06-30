import { cookies } from 'next/headers'
import { cache } from 'react'
import crypto from 'crypto'
import { prisma } from './prisma'

const SECRET = process.env.AUTH_SECRET || 'parqueo-dev-secret-cambia-en-produccion'
const COOKIE = 'parqueo_session'

function sign(value: string) {
  const h = crypto.createHmac('sha256', SECRET).update(value).digest('hex')
  return `${value}.${h}`
}

function unsign(signed: string): string | null {
  const i = signed.lastIndexOf('.')
  if (i < 0) return null
  const value = signed.slice(0, i)
  const h = signed.slice(i + 1)
  const expected = crypto.createHmac('sha256', SECRET).update(value).digest('hex')
  if (h.length !== expected.length) return null
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(expected)) ? value : null
}

export async function createSession(userId: string) {
  const c = await cookies()
  c.set(COOKIE, sign(userId), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
}

export async function destroySession() {
  const c = await cookies()
  c.delete(COOKIE)
}

// Cacheado por request: el layout y la página piden la sesión por separado;
// cache() de React lo dedupe para que solo haga 1 consulta por navegación.
export const getSessionUser = cache(async () => {
  const c = await cookies()
  const raw = c.get(COOKIE)?.value
  if (!raw) return null
  const userId = unsign(raw)
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId }, include: { tenant: true } })
})
