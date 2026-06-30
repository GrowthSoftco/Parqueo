'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { getSessionUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

type TarifaCobro = {
  modo: 'FRACCION' | 'PLENA'
  fraccionMin: number
  fraccionPrecio: number
  plenaPrecio: number
  toleranciaMin: number
} | null

// Cobro según el modo de la tarifa.
// Tarifa plena: precio único por la estadía.
// Por fracción: se cobra por bloques de tiempo; la tolerancia es el margen
// que se permite pasarse antes de contar la SIGUIENTE fracción (no es gratis).
function calcularCobro(tarifa: TarifaCobro, entradaAt: Date) {
  const minutos = Math.max(1, Math.ceil((Date.now() - entradaAt.getTime()) / 60000))
  if (!tarifa) return { minutos, monto: 0 }
  if (tarifa.modo === 'PLENA') return { minutos, monto: tarifa.plenaPrecio }
  const fraccionMin = Math.max(1, tarifa.fraccionMin)
  // Resta la tolerancia: si te pasas de la fracción por menos de ese margen, no cuenta la siguiente.
  const fracciones = Math.max(1, Math.ceil((minutos - tarifa.toleranciaMin) / fraccionMin))
  return { minutos, monto: fracciones * tarifa.fraccionPrecio }
}

function revalidar() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/parqueadero')
  revalidatePath('/dashboard/historial')
  revalidatePath('/dashboard/caja')
}

// Sin turno abierto no se registra ningún movimiento de operario
async function turnoAbierto(tenantId: string) {
  return prisma.shift.findFirst({ where: { tenantId, status: 'ABIERTO' } })
}
const SIN_TURNO = { ok: false as const, error: 'Abre un turno para registrar movimientos' }

// Límites por plan. null = sin límite (prueba sin plan elegido).
const LIMITES: Record<string, { espacios: number; usuarios: number; registrosMes: number }> = {
  BASICO: { espacios: 80, usuarios: 2, registrosMes: 1500 },
  PRO: { espacios: 100000, usuarios: 5, registrosMes: Infinity },
  NEGOCIO: { espacios: 100000, usuarios: 10, registrosMes: Infinity },
}
async function planTenant(tenantId: string) {
  const sub = await prisma.subscription.findUnique({ where: { tenantId } })
  return sub?.plan ?? null
}
function limitesDe(plan: string | null) {
  return plan && LIMITES[plan] ? LIMITES[plan] : null
}

export async function registrarEntrada(placa: string, categoryId: string) {
  const tenant = await getCurrentTenant()
  if (!(await turnoAbierto(tenant.id))) return SIN_TURNO
  const limpia = placa.trim().toUpperCase()
  if (!limpia) return { ok: false, error: 'Placa requerida' }

  // Límite de registros/mes según el plan
  const lim = limitesDe(await planTenant(tenant.id))
  if (lim && lim.registrosMes !== Infinity) {
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const count = await prisma.parkingRecord.count({ where: { tenantId: tenant.id, entradaAt: { gte: inicioMes } } })
    if (count >= lim.registrosMes) {
      return { ok: false, error: `Llegaste al límite de ${lim.registrosMes.toLocaleString('es-CO')} registros/mes del plan Básico. Sube de plan para seguir.` }
    }
  }

  const cat = await prisma.category.findFirst({ where: { id: categoryId, tenantId: tenant.id } })
  if (!cat) return { ok: false, error: 'Selecciona una categoría' }

  // Evitar doble entrada de la misma placa
  const dentro = await prisma.parkingRecord.findFirst({
    where: { tenantId: tenant.id, placa: limpia, status: 'ADENTRO' },
  })
  if (dentro) return { ok: false, error: 'Ese vehículo ya está adentro' }

  await prisma.parkingRecord.create({
    data: { tenantId: tenant.id, placa: limpia, categoryId: cat.id, tipoNombre: cat.nombre, icono: cat.icono, status: 'ADENTRO' },
  })
  revalidar()
  return { ok: true }
}

export async function registrarSalida(recordId: string) {
  const tenant = await getCurrentTenant()
  const turno = await turnoAbierto(tenant.id)
  if (!turno) return SIN_TURNO
  const rec = await prisma.parkingRecord.findUnique({ where: { id: recordId } })
  if (!rec || rec.tenantId !== tenant.id || rec.status !== 'ADENTRO') {
    return { ok: false, error: 'Registro no válido' }
  }

  const cat = rec.categoryId ? await prisma.category.findUnique({ where: { id: rec.categoryId } }) : null
  const { minutos, monto } = calcularCobro(cat, rec.entradaAt)

  await prisma.parkingRecord.update({
    where: { id: recordId },
    data: { salidaAt: new Date(), monto, status: 'SALIO' },
  })

  // Sumar al turno abierto (caja)
  await prisma.shift.update({ where: { id: turno.id }, data: { total: turno.total + monto } })

  revalidar()
  return { ok: true, monto, minutos, placa: rec.placa }
}

export async function crearCliente(nombre: string, telefono: string, email: string) {
  const tenant = await getCurrentTenant()
  if (!nombre.trim()) return { ok: false, error: 'El nombre es requerido' }
  await prisma.customer.create({
    data: { tenantId: tenant.id, nombre: nombre.trim(), telefono: telefono.trim() || null, email: email.trim() || null },
  })
  revalidatePath('/dashboard/clientes')
  return { ok: true }
}

export async function crearSuscripcion(data: {
  placa: string
  cliente: string
  tel: string
  plan: 'MENSUAL' | 'SEMANAL' | 'DIARIA' | 'NOCTURNA'
  monto: number
}) {
  const tenant = await getCurrentTenant()
  if (!data.placa.trim() || !data.cliente.trim()) return { ok: false, error: 'Placa y cliente requeridos' }
  const customer = await prisma.customer.create({
    data: { tenantId: tenant.id, nombre: data.cliente.trim(), telefono: data.tel.trim() || null },
  })
  const dias = data.plan === 'SEMANAL' ? 7 : data.plan === 'DIARIA' ? 1 : 30
  await prisma.clientSubscription.create({
    data: {
      tenantId: tenant.id,
      customerId: customer.id,
      placa: data.placa.trim().toUpperCase(),
      plan: data.plan,
      monto: data.monto,
      venceAt: new Date(Date.now() + dias * 86400000),
      status: 'ACTIVA',
    },
  })
  revalidatePath('/dashboard/suscripciones')
  revalidatePath('/dashboard/clientes')
  return { ok: true }
}

export async function cerrarTurno(contado?: number) {
  const tenant = await getCurrentTenant()
  const abierto = await prisma.shift.findFirst({ where: { tenantId: tenant.id, status: 'ABIERTO' } })
  if (!abierto) return { ok: false, error: 'No hay un turno abierto' }
  // Cierra el turno. NO abre uno nuevo: el operario debe abrirlo con su base.
  await prisma.shift.update({
    where: { id: abierto.id },
    data: {
      status: 'CERRADO',
      cerradoAt: new Date(),
      contado: typeof contado === 'number' && !Number.isNaN(contado) ? Math.round(contado) : null,
    },
  })
  revalidatePath('/dashboard/caja')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function abrirTurno(base?: number) {
  const tenant = await getCurrentTenant()
  const user = await getSessionUser()
  const yaAbierto = await prisma.shift.findFirst({ where: { tenantId: tenant.id, status: 'ABIERTO' } })
  if (yaAbierto) return { ok: false, error: 'Ya hay un turno abierto' }
  const baseInicial = typeof base === 'number' && base > 0 ? Math.round(base) : 0
  await prisma.shift.create({
    data: { tenantId: tenant.id, operario: user?.nombre ?? 'Operario', base: baseInicial, total: 0, status: 'ABIERTO' },
  })
  revalidatePath('/dashboard/caja')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function getLoginBg() {
  const s = await prisma.setting.findUnique({ where: { key: 'loginBg' } })
  return s?.value ?? null
}

export async function elegirPlan(plan: 'BASICO' | 'PRO' | 'NEGOCIO') {
  const tenant = await getCurrentTenant()
  // Solo cambia el plan; conserva el estado actual (no reinicia la prueba)
  await prisma.subscription.update({
    where: { tenantId: tenant.id },
    data: { plan },
  })
  revalidatePath('/dashboard/plan')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function guardarOnboarding(data: { nombre: string; espacios: number }) {
  const tenant = await getCurrentTenant()
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { nombre: data.nombre.trim() || 'Mi Parqueadero', espacios: Math.min(9999, Math.max(1, data.espacios)) },
  })
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function guardarConfig(data: {
  nombre: string
  direccion: string
  telefono: string
  nit: string
  espacios: number
  autoRecibo: boolean
}) {
  const tenant = await getCurrentTenant()
  // Límite de espacios según el plan (Básico hasta 80)
  const lim = limitesDe(await planTenant(tenant.id))
  const espacios = lim ? Math.min(data.espacios, lim.espacios) : data.espacios
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      nombre: data.nombre,
      direccion: data.direccion,
      telefono: data.telefono,
      nit: data.nit,
      espacios,
      autoRecibo: data.autoRecibo,
    },
  })
  revalidatePath('/dashboard/configuracion')
  revalidatePath('/dashboard/parqueadero')
  revalidatePath('/dashboard')
  return { ok: true, espaciosAplicados: espacios }
}

// ---- Categorías de vehículo (tarifas) ----

async function getPlan(tenantId: string) {
  const sub = await prisma.subscription.findUnique({ where: { tenantId } })
  return sub?.plan ?? null
}

type CategoriaInput = {
  id: string
  modo: 'FRACCION' | 'PLENA'
  fraccionMin: number
  fraccionPrecio: number
  plenaPrecio: number
  toleranciaMin: number
  porDia: number
  porMes: number
}

// Guardar precios de las categorías existentes (todos los planes)
export async function guardarCategorias(cats: CategoriaInput[]) {
  const owner = await requireOwnerUser()
  if (!owner?.tenant) return { ok: false, error: 'No autorizado' }
  for (const c of cats) {
    await prisma.category.updateMany({
      where: { id: c.id, tenantId: owner.tenant.id },
      data: {
        modo: c.modo,
        fraccionMin: Math.max(1, c.fraccionMin),
        fraccionPrecio: c.fraccionPrecio,
        plenaPrecio: c.plenaPrecio,
        toleranciaMin: c.toleranciaMin,
        porDia: c.porDia,
        porMes: c.porMes,
      },
    })
  }
  revalidatePath('/dashboard/configuracion')
  revalidatePath('/dashboard/parqueadero')
  revalidatePath('/dashboard')
  return { ok: true }
}

// Crear categoría personalizada (solo Pro / Negocio)
export async function crearCategoria(data: { nombre: string; icono: string }) {
  const owner = await requireOwnerUser()
  if (!owner?.tenant) return { ok: false, error: 'No autorizado' }
  const plan = await getPlan(owner.tenant.id)
  if (plan !== 'PRO' && plan !== 'NEGOCIO') {
    return { ok: false, error: 'Las categorías personalizadas son del plan Pro o Negocio' }
  }
  const nombre = data.nombre.trim()
  if (!nombre) return { ok: false, error: 'Escribe un nombre' }
  const orden = await prisma.category.count({ where: { tenantId: owner.tenant.id } })
  await prisma.category.create({
    data: { tenantId: owner.tenant.id, nombre, icono: data.icono || 'truck', orden, esDefault: false },
  })
  revalidatePath('/dashboard/configuracion')
  revalidatePath('/dashboard/parqueadero')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function eliminarCategoria(id: string) {
  const owner = await requireOwnerUser()
  if (!owner?.tenant) return { ok: false, error: 'No autorizado' }
  const cat = await prisma.category.findFirst({ where: { id, tenantId: owner.tenant.id } })
  if (!cat) return { ok: false, error: 'Categoría no válida' }
  if (cat.esDefault) return { ok: false, error: 'No puedes eliminar las categorías base' }
  await prisma.category.delete({ where: { id } })
  revalidatePath('/dashboard/configuracion')
  revalidatePath('/dashboard/parqueadero')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ---- Buscador global (⌘K) ----
export async function buscarGlobal(q: string) {
  const tenant = await getCurrentTenant()
  const user = await getSessionUser()
  const esEmpleado = user?.role === 'EMPLEADO'
  const placa = q.trim().toUpperCase()
  const texto = q.trim()
  if (texto.length < 1) return { vehiculos: [], clientes: [], suscripciones: [] }

  const vehiculos = await prisma.parkingRecord.findMany({
    where: { tenantId: tenant.id, status: 'ADENTRO', placa: { contains: placa } },
    orderBy: { entradaAt: 'desc' },
    take: 6,
    select: { id: true, placa: true, tipoNombre: true, icono: true, entradaAt: true },
  })

  // El empleado solo busca placas/vehículos
  if (esEmpleado) return { vehiculos, clientes: [], suscripciones: [] }

  const [clientes, suscripciones] = await Promise.all([
    prisma.customer.findMany({
      where: { tenantId: tenant.id, nombre: { contains: texto, mode: 'insensitive' } },
      take: 5,
      select: { id: true, nombre: true, telefono: true },
    }),
    prisma.clientSubscription.findMany({
      where: { tenantId: tenant.id, placa: { contains: placa } },
      take: 5,
      select: { id: true, placa: true, plan: true, status: true },
    }),
  ])
  return { vehiculos, clientes, suscripciones }
}

// ---- Empleados (solo dueño/admin) ----

async function requireOwnerUser() {
  const user = await getSessionUser()
  if (!user?.tenant) return null
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') return null
  return user
}

export async function crearEmpleado(data: { nombre: string; email: string; password: string }) {
  const owner = await requireOwnerUser()
  if (!owner?.tenant) return { ok: false, error: 'No autorizado' }
  const email = data.email.trim().toLowerCase()
  const nombre = data.nombre.trim()
  if (!nombre || !email) return { ok: false, error: 'Nombre y correo requeridos' }
  if (data.password.length < 4) return { ok: false, error: 'La contraseña debe tener al menos 4 caracteres' }
  const lim = limitesDe(await planTenant(owner.tenant.id))
  if (lim) {
    const total = await prisma.user.count({ where: { tenantId: owner.tenant.id } })
    if (total >= lim.usuarios) return { ok: false, error: `Tu plan permite ${lim.usuarios} usuarios. Sube de plan para agregar más.` }
  }
  const existe = await prisma.user.findUnique({ where: { email } })
  if (existe) return { ok: false, error: 'Ya existe una cuenta con ese correo' }
  await prisma.user.create({
    data: {
      nombre,
      email,
      passwordHash: await bcrypt.hash(data.password, 10),
      role: 'EMPLEADO',
      tenantId: owner.tenant.id,
    },
  })
  revalidatePath('/dashboard/configuracion')
  return { ok: true }
}

export async function eliminarEmpleado(userId: string) {
  const owner = await requireOwnerUser()
  if (!owner?.tenant) return { ok: false, error: 'No autorizado' }
  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target || target.tenantId !== owner.tenant.id || target.role !== 'EMPLEADO') {
    return { ok: false, error: 'Empleado no válido' }
  }
  await prisma.user.delete({ where: { id: userId } })
  revalidatePath('/dashboard/configuracion')
  return { ok: true }
}

// Anular/corregir un movimiento (solo dueño). Si ya se cobró, revierte la caja.
export async function anularMovimiento(recordId: string) {
  const owner = await requireOwnerUser()
  if (!owner?.tenant) return { ok: false, error: 'No autorizado' }
  const rec = await prisma.parkingRecord.findFirst({ where: { id: recordId, tenantId: owner.tenant.id } })
  if (!rec) return { ok: false, error: 'Registro no válido' }
  if (rec.status === 'SALIO' && rec.monto) {
    const turno = await prisma.shift.findFirst({ where: { tenantId: owner.tenant.id, status: 'ABIERTO' } })
    if (turno) await prisma.shift.update({ where: { id: turno.id }, data: { total: Math.max(0, turno.total - rec.monto) } })
  }
  await prisma.parkingRecord.delete({ where: { id: rec.id } })
  revalidar()
  return { ok: true }
}

// Editar el nombre del usuario (perfil) — #1
export async function actualizarPerfil(nombre: string) {
  const user = await getSessionUser()
  if (!user) return { ok: false, error: 'No autenticado' }
  const limpio = nombre.trim()
  if (!limpio) return { ok: false, error: 'El nombre es requerido' }
  await prisma.user.update({ where: { id: user.id }, data: { nombre: limpio } })
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/configuracion')
  return { ok: true }
}

export async function registrarSalidaPorPlaca(placa: string) {
  const tenant = await getCurrentTenant()
  const turno = await turnoAbierto(tenant.id)
  if (!turno) return SIN_TURNO
  const limpia = placa.trim().toUpperCase()
  if (!limpia) return { ok: false, error: 'Escribe la placa' }

  const rec = await prisma.parkingRecord.findFirst({
    where: { tenantId: tenant.id, placa: limpia, status: 'ADENTRO' },
    orderBy: { entradaAt: 'desc' },
  })
  if (!rec) return { ok: false, error: 'No hay un vehículo adentro con esa placa' }

  const cat = rec.categoryId ? await prisma.category.findUnique({ where: { id: rec.categoryId } }) : null
  const { minutos, monto } = calcularCobro(cat, rec.entradaAt)
  const salida = new Date()

  await prisma.parkingRecord.update({
    where: { id: rec.id },
    data: { salidaAt: salida, monto, status: 'SALIO' },
  })

  await prisma.shift.update({ where: { id: turno.id }, data: { total: turno.total + monto } })

  revalidar()
  return {
    ok: true,
    monto,
    minutos,
    placa: rec.placa,
    tipoNombre: rec.tipoNombre,
    entradaAt: rec.entradaAt.toISOString(),
    salidaAt: salida.toISOString(),
  }
}
