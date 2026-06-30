'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import { pushEvent, CH_PUBLIC, CH_BROADCAST, chTenant } from '@/lib/pusher'
import { revalidatePath } from 'next/cache'

async function requireOperator() {
  const user = await getSessionUser()
  return user && user.role === 'SUPER_ADMIN' ? user : null
}

function revalidar() {
  revalidatePath('/admin')
  revalidatePath('/admin/cuentas')
  revalidatePath('/admin/suscripciones')
  revalidatePath('/admin/auditoria')
}

// Empuja en tiempo real al tenant afectado (su app se actualiza sola)
function notificarTenant(tenantId: string) {
  void pushEvent(chTenant(tenantId), 'changed', { changed: true })
}

async function audit(actor: string, accion: string, detalle: string, targetTenant: string) {
  await prisma.auditLog.create({ data: { actor, accion, detalle, targetTenant } })
}

// Mensaje del desarrollador a TODOS los parqueaderos en vivo.
// kind: 'notch' (toast), 'popup' (modal) o 'banner' (barra superior)
export type MensajeKind = 'notch' | 'popup' | 'banner'

export async function enviarMensajeGlobal(mensaje: string, kind: MensajeKind = 'notch') {
  const op = await requireOperator()
  if (!op) return { ok: false, error: 'No autorizado' }
  const msg = mensaje.trim()
  if (!msg) return { ok: false, error: 'Escribe un mensaje' }
  const tipo: MensajeKind = ['notch', 'popup', 'banner'].includes(kind) ? kind : 'notch'
  await pushEvent(CH_BROADCAST, 'message', { message: msg, kind: tipo })
  await audit(op.nombre, `Mensaje global (${tipo})`, msg.slice(0, 140), '')
  return { ok: true }
}

const PRICE: Record<string, number> = { BASICO: 49990, PRO: 99990, NEGOCIO: 179990 }
const fmt = (n: number) => '$' + n.toLocaleString('es-CO')

type Estado = 'ACTIVE' | 'SUSPENDED' | 'BANNED'

export async function marcarPagado(tenantId: string) {
  const op = await requireOperator()
  if (!op) return { ok: false, error: 'No autorizado' }
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, include: { subscription: true } })
  const plan = t?.subscription?.plan
  const monto = plan ? PRICE[plan] : 0
  await prisma.payment.create({
    data: { tenantId, monto, metodo: 'Manual (operador)', status: 'PAGADO', concepto: plan ? `Plan ${plan}` : 'Pago manual' },
  })
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'ACTIVE' } })
  if (t?.subscription) await prisma.subscription.update({ where: { tenantId }, data: { status: 'ACTIVE' } })
  notificarTenant(tenantId)
  await audit(op.nombre,'Pago registrado', `${t?.nombre} · ${fmt(monto)}`, tenantId)
  revalidar()
  return { ok: true }
}

export async function cambiarEstadoCuenta(tenantId: string, estado: Estado) {
  const op = await requireOperator()
  if (!op) return { ok: false, error: 'No autorizado' }
  const t = await prisma.tenant.update({ where: { id: tenantId }, data: { status: estado } })
  const accion = estado === 'BANNED' ? 'Cuenta baneada' : estado === 'SUSPENDED' ? 'Cuenta suspendida' : 'Cuenta reactivada'
  notificarTenant(tenantId)
  await audit(op.nombre,accion, t.nombre, tenantId)
  revalidar()
  return { ok: true }
}

export async function cambiarPlan(tenantId: string, plan: 'BASICO' | 'PRO' | 'NEGOCIO') {
  const op = await requireOperator()
  if (!op) return { ok: false, error: 'No autorizado' }
  const t = await prisma.tenant.findUnique({ where: { id: tenantId } })
  await prisma.subscription.upsert({
    where: { tenantId },
    create: { tenantId, plan, status: 'ACTIVE', cycle: 'MENSUAL' },
    update: { plan, status: 'ACTIVE' },
  })
  await prisma.tenant.update({ where: { id: tenantId }, data: { status: 'ACTIVE' } })
  notificarTenant(tenantId)
  await audit(op.nombre,'Suscripción asignada', `${t?.nombre} · Plan ${plan}`, tenantId)
  revalidar()
  return { ok: true }
}

export async function setLoginBg(value: string) {
  const op = await requireOperator()
  if (!op) return { ok: false, error: 'No autorizado' }
  await prisma.setting.upsert({
    where: { key: 'loginBg' },
    create: { key: 'loginBg', value },
    update: { value },
  })
  await audit(op.nombre, 'Fondo del login actualizado', value.slice(0, 50), '')
  await pushEvent(CH_PUBLIC, 'login-bg', { value }) // push en tiempo real a los logins conectados
  revalidatePath('/login')
  revalidatePath('/register')
  return { ok: true }
}

export async function resetearPassword(tenantId: string) {
  const op = await requireOperator()
  if (!op) return { ok: false, error: 'No autorizado' }
  const user = await prisma.user.findFirst({ where: { tenantId, role: 'OWNER' } })
  if (!user) return { ok: false, error: 'Sin usuario dueño' }
  const temp = 'Pq' + Math.random().toString(36).slice(2, 8)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(temp, 10) } })
  notificarTenant(tenantId)
  await audit(op.nombre,'Contraseña reseteada', user.email, tenantId)
  revalidar()
  return { ok: true, temp }
}

export async function quitarSuscripcion(tenantId: string) {
  const op = await requireOperator()
  if (!op) return { ok: false, error: 'No autorizado' }
  const t = await prisma.tenant.findUnique({ where: { id: tenantId } })
  await prisma.subscription.updateMany({ where: { tenantId }, data: { plan: null, status: 'CANCELED' } })
  notificarTenant(tenantId)
  await audit(op.nombre,'Suscripción cancelada', t?.nombre ?? '', tenantId)
  revalidar()
  return { ok: true }
}
