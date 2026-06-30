'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Car,
  DollarSign,
  CreditCard,
  FileText,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'

type Item = { label: string; href: string; icon: typeof Car }

const principalNav: Item[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Parqueadero', href: '/dashboard/parqueadero', icon: Car },
  { label: 'Caja', href: '/dashboard/caja', icon: DollarSign },
  { label: 'Suscripciones', href: '/dashboard/suscripciones', icon: CreditCard },
  { label: 'Historial', href: '/dashboard/historial', icon: FileText },
  { label: 'Contabilidad', href: '/dashboard/contabilidad', icon: BarChart3 },
]

const gestionNav: Item[] = [
  { label: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { label: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
]

// Lo que puede ver un empleado (EMPLEADO)
const OPERATOR_HREFS = ['/dashboard/parqueadero', '/dashboard/caja', '/dashboard/historial']

const PLAN_LABEL: Record<string, string> = { BASICO: 'Plan Básico', PRO: 'Plan Pro', NEGOCIO: 'Plan Negocio' }

function NavRow({ item, active }: { item: Item; active: boolean }) {
  const { label, href, icon: Icon } = item
  return (
    <Link
      href={href}
      className="relative flex items-center gap-3 rounded-lg h-9 px-2.5 transition-colors"
      style={{ background: active ? '#1a1a1a' : 'transparent', color: active ? '#fff' : '#6e6e6e' }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#141414'; e.currentTarget.style.color = '#d4d4d4' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6e6e6e' } }}
    >
      {active && <span style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: 9999, background: '#fff' }} />}
      <Icon size={17} strokeWidth={2} />
      <span style={{ fontSize: 13.5, fontWeight: active ? 600 : 500 }}>{label}</span>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 mb-1.5 mt-5 first:mt-0" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: '#4a4a4a', textTransform: 'uppercase' }}>
      {children}
    </p>
  )
}

export default function Sidebar({ role, nombre, plan }: { role?: string; nombre?: string; plan?: string | null }) {
  const pathname = usePathname()
  const esOperador = role === 'EMPLEADO'
  const principal = esOperador ? principalNav.filter(i => OPERATOR_HREFS.includes(i.href)) : principalNav
  const gestion = esOperador ? [] : gestionNav

  const nombreLot = nombre?.trim() || 'Parqueadero'
  const iniciales = nombreLot.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase()
  const planLabel = plan ? PLAN_LABEL[plan] ?? 'Plan activo' : 'Prueba gratis'

  return (
    <aside className="flex flex-col shrink-0 h-full w-[212px] pb-3 px-2.5">
      {/* Franja superior arrastrable: deja espacio para el semáforo de macOS */}
      <div className="w-full h-[40px] shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Logo + wordmark */}
      <div className="flex items-center gap-2.5 px-2.5 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Parqueo" width={24} height={24} />
        <span className="text-white" style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-0.01em' }}>Parqueo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto">
        <SectionLabel>Principal</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {principal.map(item => <NavRow key={item.href} item={item} active={pathname === item.href} />)}
        </div>

        {gestion.length > 0 && (
          <>
            <SectionLabel>Gestión</SectionLabel>
            <div className="flex flex-col gap-0.5">
              {gestion.map(item => <NavRow key={item.href} item={item} active={pathname === item.href} />)}
            </div>
          </>
        )}
      </nav>

      {/* Footer: parqueadero + salir */}
      <div className="mt-3">
        <div className="h-px w-full mb-2.5" style={{ background: '#181818' }} />
        <div className="flex items-center gap-2.5 px-1.5 mb-1">
          <div className="flex items-center justify-center shrink-0" style={{ width: 32, height: 32, borderRadius: 9, background: '#1a1a1a', border: '1px solid #262626', color: '#cfcfcf', fontSize: 11.5, fontWeight: 700 }}>
            {iniciales}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white truncate" style={{ fontSize: 12.5, fontWeight: 600 }}>{nombreLot}</p>
            <p className="truncate" style={{ fontSize: 11, color: '#666' }}>{planLabel}</p>
          </div>
        </div>
        <button
          onClick={() => window.dispatchEvent(new Event('parqueo:logout'))}
          className="flex items-center gap-3 rounded-lg h-9 px-2.5 w-full transition-colors"
          style={{ background: 'transparent', color: '#6e6e6e', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#160c0c'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6e6e6e' }}
        >
          <LogOut size={17} strokeWidth={2} />
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
