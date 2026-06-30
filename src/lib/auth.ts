import { cookies } from 'next/headers'
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

export async function getSessionUser() {
  const c = await cookies()
  const raw = c.get(COOKIE)?.value
  if (!raw) return null
  const userId = unsign(raw)
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId }, include: { tenant: true } })
}
