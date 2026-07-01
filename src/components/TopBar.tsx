'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, CreditCard, Settings, LogOut, Zap } from 'lucide-react'
import EntryButton from '@/components/EntryButton'
import ExitButton, { type ConvenioVM } from '@/components/ExitButton'
import CommandSearch from '@/components/CommandSearch'
import Scanner from '@/components/Scanner'
import NotificationsBell, { type Actividad } from '@/components/NotificationsBell'

export type TicketCfg = { codigo: string; campos: Record<string, boolean> }
const menu = [
  { label: 'Mi cuenta', icon: User, href: '/dashboard/configuracion?s=perfil' },
  { label: 'Mi plan', icon: CreditCard, href: '/dashboard/plan' },
  { label: 'Configuración', icon: Settings, href: '/dashboard/configuracion' },
]

const menuBottom = [
  { label: 'Cerrar sesión', icon: LogOut, href: '/login' },
]

const PLAN_COLOR: Record<string, string> = { BASICO: '#3b82f6', PRO: '#a855f7', NEGOCIO: '#f59e0b' }
const PLAN_LABEL: Record<string, string> = { BASICO: 'BÁSICO', PRO: 'PRO', NEGOCIO: 'NEGOCIO' }
const AVATAR = '/avatar.jpg'

export default function TopBar({ plan, userName, userEmail, role, categorias, empresa, autoRecibo, actividad, preguntarEstadia, tarifaPerdido, ticketCfg, convenios }: { plan?: string | null; userName?: string; userEmail?: string; role?: string; categorias: { id: string; nombre: string; icono: string }[]; empresa: { nombre: string; nit?: string; direccion?: string; telefono?: string }; autoRecibo: boolean; actividad: Actividad[]; preguntarEstadia?: boolean; tarifaPerdido?: number; ticketCfg?: TicketCfg; convenios?: ConvenioVM[] }) {
  const esOperador = role === 'EMPLEADO'
  const menuItems = esOperador ? [] : menu
  const ringColor = plan ? PLAN_COLOR[plan] ?? '#3b82f6' : 'var(--c-text4)'
  const planBadge = plan ? PLAN_LABEL[plan] : null
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="absolute top-3.5 right-7 z-40 flex items-center gap-2.5">
      {/* Buscador global ⌘K */}
      <CommandSearch role={role} />

      {/* Escáner láser/QR: código del tiquete → abre salida con la placa */}
      <Scanner />

      {/* Registrar entrada / salida (funcional) */}
      <EntryButton categorias={categorias} empresa={empresa} autoRecibo={autoRecibo} plan={plan} preguntarEstadia={preguntarEstadia} ticketCfg={ticketCfg} />
      <ExitButton plan={plan} empresa={empresa} autoRecibo={autoRecibo} tarifaPerdido={tarifaPerdido} ticketCfg={ticketCfg} convenios={convenios} />

      {/* Notifications */}
      <NotificationsBell items={actividad} />

      {/* Avatar + dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          className="rounded-full p-0.5 transition-transform hover:scale-105"
          style={{ background: ringColor }}
          title={plan ? `Plan ${PLAN_LABEL[plan]}` : 'En prueba'}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={AVATAR} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        </button>

        <div
          className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-50"
          style={{
            width: 240,
            background: 'var(--c-surface2)',
            border: '1px solid var(--c-border3)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            transformOrigin: 'top right',
            opacity: open ? 1 : 0,
            transform: open ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(-6px)',
            pointerEvents: open ? 'auto' : 'none',
            transition: 'opacity 160ms ease-out, transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
            {/* User header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-border2)' }}>
              <p className="text-white" style={{ fontSize: '13px', fontWeight: 600 }}>{userName ?? 'Usuario'}</p>
              <p style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{userEmail ?? ''}</p>
            </div>

            {/* Main items */}
            {menuItems.length > 0 && (
            <div className="p-1.5">
              {menuItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    router.push(item.href)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                  style={{ color: 'var(--c-text2)' }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--c-border)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text2)'
                  }}
                >
                  <item.icon size={16} />
                  <span style={{ fontSize: '13.5px', flex: 1, textAlign: 'left' }}>{item.label}</span>
                  {item.label === 'Mi plan' && planBadge && (
                    <span
                      className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md"
                      style={{ background: `${ringColor}26`, color: ringColor, fontSize: '10px', fontWeight: 700 }}
                    >
                      <Zap size={9} fill={ringColor} /> {planBadge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            )}

            {menuItems.length > 0 && <div className="h-px mx-1.5" style={{ background: 'var(--c-border2)' }} />}

            {/* Bottom items */}
            <div className="p-1.5">
              {menuBottom.map(item => (
                <button
                  key={item.label}
                  onClick={() => {
                    setOpen(false)
                    if (item.label === 'Cerrar sesión') {
                      window.dispatchEvent(new Event('parqueo:logout'))
                    } else {
                      router.push(item.href)
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                  style={{ color: 'var(--c-text2)' }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--c-border)'
                    ;(e.currentTarget as HTMLElement).style.color = item.label === 'Cerrar sesión' ? '#ef4444' : 'var(--c-text)'
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text2)'
                  }}
                >
                  <item.icon size={16} />
                  <span style={{ fontSize: '13.5px', textAlign: 'left' }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}
