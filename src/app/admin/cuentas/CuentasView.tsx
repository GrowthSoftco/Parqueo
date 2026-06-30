'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { cambiarEstadoCuenta, cambiarPlan, quitarSuscripcion, resetearPassword } from '@/app/admin-actions'
import {
  Search, X, Mail, Phone, MapPin, Car, Calendar, CreditCard,
  LogIn, KeyRound, Ban, CheckCircle2, Clock, Building2,
} from 'lucide-react'

type Estado = 'Activo' | 'Prueba' | 'Suspendido' | 'Baneado'
export type Cuenta = {
  id: string
  nombre: string
  dueño: string
  email: string
  tel: string
  ciudad: string
  plan: 'Básico' | 'Pro' | 'Negocio' | '—'
  estado: Estado
  registro: string
  ultima: string
  espacios: number
  vehiculosMes: number
  pagos: { fecha: string; monto: string; estado: string }[]
}

const filtros: (Estado | 'Todos')[] = ['Todos', 'Activo', 'Prueba', 'Suspendido', 'Baneado']

const estadoStyle: Record<Estado, React.CSSProperties> = {
  Activo: { background: 'color-mix(in srgb, #22c55e 16%, transparent)', color: '#22c55e', border: '1px solid color-mix(in srgb, #22c55e 32%, transparent)' },
  Prueba: { background: 'color-mix(in srgb, #3b82f6 16%, transparent)', color: '#3b82f6', border: '1px solid color-mix(in srgb, #3b82f6 32%, transparent)' },
  Suspendido: { background: 'color-mix(in srgb, #f59e0b 16%, transparent)', color: '#f59e0b', border: '1px solid color-mix(in srgb, #f59e0b 32%, transparent)' },
  Baneado: { background: 'color-mix(in srgb, #ef4444 16%, transparent)', color: '#ef4444', border: '1px solid color-mix(in srgb, #ef4444 32%, transparent)' },
}

export default function CuentasView({ cuentas }: { cuentas: Cuenta[] }) {
  const [open, setOpen] = useState(false)
  const [cuenta, setCuenta] = useState<Cuenta | null>(null)
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>('Todos')
  const [q, setQ] = useState('')

  const visibles = cuentas.filter(
    c =>
      (filtro === 'Todos' || c.estado === filtro) &&
      (c.nombre.toLowerCase().includes(q.toLowerCase()) || c.dueño.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()))
  )

  const openDrawer = (c: Cuenta) => {
    setCuenta(c)
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
  }
  const closeDrawer = () => {
    setOpen(false)
    setTimeout(() => setCuenta(null), 300)
  }

  return (
    <div className="px-8 pb-8 pt-7">
      <PageHeader crumb="Cuentas" title="Cuentas" subtitle="Todos los parqueaderos registrados en la plataforma" />

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg flex-1 max-w-xs" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border2)' }}>
          <Search size={15} color="var(--c-text5)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar cuenta, dueño o email..." className="bg-transparent outline-none flex-1 text-white" style={{ fontSize: '13px' }} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {filtros.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className="px-3 py-1.5 rounded-full transition-colors"
              style={{ background: filtro === f ? 'var(--c-text)' : 'var(--c-surface2)', color: filtro === f ? 'var(--c-bg)' : 'var(--c-text3)', border: '1px solid var(--c-border2)', fontSize: '12.5px', fontWeight: 500 }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ color: 'var(--c-text5)', fontSize: '12px', background: 'var(--c-panel)' }}>
              <th className="text-left font-medium px-5 py-3">Parqueadero</th>
              <th className="text-left font-medium px-5 py-3">Plan</th>
              <th className="text-left font-medium px-5 py-3">Ciudad</th>
              <th className="text-left font-medium px-5 py-3">Registro</th>
              <th className="text-left font-medium px-5 py-3">Última actividad</th>
              <th className="text-right font-medium px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map(c => (
              <tr
                key={c.id}
                onClick={() => openDrawer(c)}
                className="border-t cursor-pointer transition-colors"
                style={{ borderColor: 'var(--c-surface3)' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--c-surface3)' }}>
                      <span className="text-white" style={{ fontSize: '12px', fontWeight: 700 }}>{c.nombre.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white" style={{ fontSize: '13px', fontWeight: 500 }}>{c.nombre}</p>
                      <p style={{ color: 'var(--c-text5)', fontSize: '11px' }}>{c.dueño}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text2)', fontSize: '13px' }}>{c.plan}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{c.ciudad}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{c.registro}</td>
                <td className="px-5 py-3.5" style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{c.ultima}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[c.estado]}>{c.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {cuenta && (
        <>
          <div onClick={closeDrawer} className="fixed inset-0 z-[60] transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', opacity: open ? 1 : 0 }} />
          <div
            className="fixed top-0 right-0 bottom-0 z-[70] overflow-y-auto"
            style={{ width: 440, maxWidth: '92vw', background: 'var(--c-panel)', borderLeft: '1px solid var(--c-border)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <CuentaDetail cuenta={cuenta} onClose={closeDrawer} />
          </div>
        </>
      )}
    </div>
  )
}

const planes = [
  { nombre: 'Básico', precio: '$49.900' },
  { nombre: 'Pro', precio: '$99.900' },
  { nombre: 'Negocio', precio: '$179.900' },
]

function CuentaDetail({ cuenta, onClose }: { cuenta: Cuenta; onClose: () => void }) {
  const [plan, setPlan] = useState<string>(cuenta.plan === '—' ? 'Pro' : cuenta.plan)
  const precioActual = planes.find(p => p.nombre === cuenta.plan)?.precio
  const router = useRouter()
  const [, start] = useTransition()
  const planEnum: Record<string, 'BASICO' | 'PRO' | 'NEGOCIO'> = { Básico: 'BASICO', Pro: 'PRO', Negocio: 'NEGOCIO' }
  const act = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn()
      router.refresh()
      onClose()
    })
  const [tempPass, setTempPass] = useState('')
  const reset = () =>
    start(async () => {
      const res = await resetearPassword(cuenta.id)
      if (res.ok && res.temp) setTempPass(res.temp)
    })
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: 'var(--c-surface3)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#8b5cf6', fontSize: '17px', fontWeight: 700, color: 'var(--c-text)' }}>
            {cuenta.nombre.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>{cuenta.nombre}</p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={estadoStyle[cuenta.estado]}>{cuenta.estado}</span>
            </div>
            <p style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{cuenta.dueño}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--c-text4)' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text)')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text4)')}>
          <X size={18} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Contacto */}
        <Block title="CONTACTO">
          <InfoRow icon={Mail} value={cuenta.email} />
          <InfoRow icon={Phone} value={cuenta.tel} />
          <InfoRow icon={MapPin} value={cuenta.ciudad} />
        </Block>

        {/* Uso */}
        <Block title="USO DE LA CUENTA">
          <div className="grid grid-cols-2 gap-3">
            <Mini icon={Car} label="Espacios" value={String(cuenta.espacios)} />
            <Mini icon={Calendar} label="Vehículos/mes" value={cuenta.vehiculosMes.toLocaleString('es-CO')} />
            <Mini icon={Building2} label="Registro" value={cuenta.registro} />
            <Mini icon={Clock} label="Última act." value={cuenta.ultima} />
          </div>
        </Block>

        {/* Suscripción */}
        <Block title="SUSCRIPCIÓN">
          {/* Estado actual */}
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(139,92,246,0.12)' }}>
              <CreditCard size={16} color="#8b5cf6" />
            </div>
            <div className="flex-1">
              <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                {cuenta.plan === '—' ? 'Sin suscripción' : `Plan ${cuenta.plan}`}
              </p>
              <p style={{ color: 'var(--c-text4)', fontSize: '12px' }}>
                {cuenta.estado === 'Prueba' ? 'En periodo de prueba' : cuenta.plan === '—' ? 'No asignado' : 'Renueva cada mes'}
              </p>
            </div>
            {precioActual && (
              <span className="text-white" style={{ fontSize: '14px', fontWeight: 700 }}>
                {precioActual}
                <span style={{ color: 'var(--c-text4)', fontWeight: 400, fontSize: '12px' }}>/mes</span>
              </span>
            )}
          </div>

          {/* Selector de plan */}
          <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>ASIGNAR PLAN</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {planes.map(p => {
              const on = plan === p.nombre
              return (
                <button
                  key={p.nombre}
                  onClick={() => setPlan(p.nombre)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{ background: on ? 'rgba(139,92,246,0.1)' : 'var(--c-surface)', border: on ? '1px solid #8b5cf6' : '1px solid var(--c-border)' }}
                >
                  <p style={{ color: on ? 'var(--c-text)' : 'var(--c-text2)', fontSize: '13px', fontWeight: 600 }}>{p.nombre}</p>
                  <p style={{ color: 'var(--c-text4)', fontSize: '11px', marginTop: '2px' }}>{p.precio}</p>
                </button>
              )
            })}
          </div>

          {/* Acción principal + secundarias */}
          <button
            onClick={() => act(() => cambiarPlan(cuenta.id, planEnum[plan]))}
            className="w-full rounded-full py-2.5 mb-3"
            style={{ background: '#8b5cf6', color: 'var(--c-text)', fontSize: '13px', fontWeight: 600 }}
          >
            {cuenta.plan === '—' ? 'Activar suscripción' : 'Guardar cambios'}
          </button>
          <div className="flex items-center justify-center">
            <button
              onClick={() => act(() => quitarSuscripcion(cuenta.id))}
              style={{ color: '#ef4444', fontSize: '12.5px' }}
              className="hover:opacity-80 transition-opacity"
            >
              Quitar suscripción
            </button>
          </div>
        </Block>

        {/* Pagos */}
        <Block title="HISTORIAL DE PAGOS">
          {cuenta.pagos.length === 0 ? (
            <p style={{ color: 'var(--c-text5)', fontSize: '13px' }}>Sin pagos registrados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {cuenta.pagos.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: p.estado === 'Pagado' ? 'color-mix(in srgb, #22c55e 16%, transparent)' : 'color-mix(in srgb, #ef4444 16%, transparent)' }}>
                    <CheckCircle2 size={14} color={p.estado === 'Pagado' ? '#22c55e' : '#ef4444'} />
                  </div>
                  <span className="text-white flex-1" style={{ fontSize: '13px', fontWeight: 500 }}>{p.monto}</span>
                  <span style={{ color: 'var(--c-text5)', fontSize: '12px' }}>{p.fecha} · {p.estado}</span>
                </div>
              ))}
            </div>
          )}
        </Block>

        {/* Acciones de soporte */}
        <Block title="SOPORTE Y SEGURIDAD">
          <div className="flex flex-col gap-2">
            <WideAction icon={KeyRound} label="Resetear contraseña" onClick={reset} />
            {tempPass && (
              <p className="px-3.5 py-2 rounded-lg" style={{ background: 'color-mix(in srgb, #22c55e 16%, transparent)', border: '1px solid color-mix(in srgb, #22c55e 32%, transparent)', color: '#22c55e', fontSize: '12.5px' }}>
                Clave temporal: <span className="font-mono font-bold">{tempPass}</span> — compártela con el dueño.
              </p>
            )}
            {cuenta.estado === 'Baneado' ? (
              <WideAction icon={CheckCircle2} label="Reactivar cuenta" tone="ok" onClick={() => act(() => cambiarEstadoCuenta(cuenta.id, 'ACTIVE'))} />
            ) : cuenta.estado === 'Suspendido' ? (
              <WideAction icon={CheckCircle2} label="Reactivar cuenta" tone="ok" onClick={() => act(() => cambiarEstadoCuenta(cuenta.id, 'ACTIVE'))} />
            ) : (
              <WideAction icon={Ban} label="Banear cuenta" tone="danger" onClick={() => act(() => cambiarEstadoCuenta(cuenta.id, 'BANNED'))} />
            )}
          </div>
        </Block>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '12px' }}>{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, value }: { icon: typeof Mail; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <Icon size={14} color="var(--c-text4)" />
      <span style={{ color: 'var(--c-text2)', fontSize: '13px' }}>{value}</span>
    </div>
  )
}

function Mini({ icon: Icon, label, value }: { icon: typeof Car; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={13} color="var(--c-text4)" />
        <span style={{ color: 'var(--c-text4)', fontSize: '11px' }}>{label}</span>
      </div>
      <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>{value}</p>
    </div>
  )
}

function WideAction({ icon: Icon, label, tone, onClick }: { icon: typeof LogIn; label: string; tone?: 'danger' | 'ok'; onClick?: () => void }) {
  const color = tone === 'danger' ? '#ef4444' : tone === 'ok' ? '#22c55e' : 'var(--c-text2)'
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors w-full text-left"
      style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', color }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface3)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--c-surface)')}
    >
      <Icon size={15} />
      <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
    </button>
  )
}
