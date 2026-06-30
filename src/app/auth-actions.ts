'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession, destroySession, getSessionUser } from '@/lib/auth'

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user) return { ok: false, error: 'Correo o contraseña incorrectos' }
  const valido = await bcrypt.compare(password, user.passwordHash)
  if (!valido) return { ok: false, error: 'Correo o contraseña incorrectos' }
  await createSession(user.id)
  return { ok: true }
}

export async function logout() {
  await destroySession()
}

export async function registrarCuenta(nombre: string, email: string, password: string) {
  const limpio = email.trim().toLowerCase()
  if (!nombre.trim() || !limpio || password.length < 4) return { ok: false, error: 'Completa todos los campos' }
  const existe = await prisma.user.findUnique({ where: { email: limpio } })
  if (existe) return { ok: false, error: 'Ese correo ya está registrado' }

  const hash = await bcrypt.hash(password, 10)
  const tenant = await prisma.tenant.create({
    data: {
      nombre: 'Mi Parqueadero',
      status: 'TRIAL',
      espacios: 50,
      users: { create: { email: limpio, passwordHash: hash, nombre: nombre.trim(), role: 'OWNER' } },
      subscription: { create: { status: 'TRIAL', cycle: 'MENSUAL', trialEndsAt: new Date(Date.now() + 14 * 86400000) } },
      categories: {
        create: [
          { nombre: 'Carro', icono: 'car', orden: 0, esDefault: true, modo: 'FRACCION', fraccionMin: 15, fraccionPrecio: 1500, plenaPrecio: 5000, toleranciaMin: 10, porDia: 18000, porMes: 180000 },
          { nombre: 'Moto', icono: 'motorbike', orden: 1, esDefault: true, modo: 'FRACCION', fraccionMin: 15, fraccionPrecio: 800, plenaPrecio: 3000, toleranciaMin: 10, porDia: 10000, porMes: 90000 },
          { nombre: 'Bici', icono: 'bike', orden: 2, esDefault: true, modo: 'FRACCION', fraccionMin: 30, fraccionPrecio: 500, plenaPrecio: 1500, toleranciaMin: 15, porDia: 4000, porMes: 40000 },
        ],
      },
      shifts: { create: { operario: nombre.trim(), base: 0, total: 0, status: 'ABIERTO' } },
    },
    include: { users: true },
  })
  await createSession(tenant.users[0].id)
  return { ok: true }
}

export async function loginOperador(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user || user.role !== 'SUPER_ADMIN') return { ok: false, error: 'Acceso no autorizado' }
  const valido = await bcrypt.compare(password, user.passwordHash)
  if (!valido) return { ok: false, error: 'Credenciales incorrectas' }
  await createSession(user.id)
  return { ok: true }
}

export async function isOperador() {
  const user = await getSessionUser()
  return !!user && user.role === 'SUPER_ADMIN'
}
