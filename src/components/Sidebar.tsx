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
  PieChart,
  Wallet,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'

// tier = plan mínimo del módulo (1 Básico · 2 Pro · 3 Negocio). Solo informativo:
// todos se muestran, el gate real (pantalla de upsell) está en cada página.
const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, tier: 1 },
  { label: 'Parqueadero', href: '/dashboard/parqueadero', icon: Car, tier: 1 },
  { label: 'Caja', href: '/dashboard/caja', icon: DollarSign, tier: 1 },
  { label: 'Suscripciones', href: '/dashboard/suscripciones', icon: CreditCard, tier: 2 },
  { label: 'Historial', href: '/dashboard/historial', icon: FileText, tier: 2 },
  { label: 'Contabilidad', href: '/dashboard/contabilidad', icon: BarChart3, tier: 2 },
  { label: 'Reportes', href: '/dashboard/reportes', icon: PieChart, tier: 3 },
  { label: 'Finanzas', href: '/dashboard/finanzas', icon: Wallet, tier: 3 },
]

const secondaryNav = [
  { label: 'Clientes', href: '/dashboard/clientes', icon: Users, tier: 2 },
]

function Tooltip({ label }: { label: string }) {
  return (
    <div
      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none z-[100] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
      style={{
        background: 'var(--c-border)',
        border: '1px solid var(--c-border3)',
        color: 'var(--c-text)',
        fontSize: '12.5px',
        fontWeight: 500,
        boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
      }}
    >
      {label}
    </div>
  )
}

// Lo que puede ver un empleado (EMPLEADO)
const OPERATOR_HREFS = ['/dashboard/parqueadero', '/dashboard/caja', '/dashboard/historial']

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()
  const esOperador = role === 'EMPLEADO'
  // Se muestran todos los módulos; los de plan superior abren la pantalla
  // de "mejorar a X plan" al entrar. El empleado sí ve un subconjunto.
  const principal = esOperador ? mainNav.filter(i => OPERATOR_HREFS.includes(i.href)) : mainNav
  const secundario = esOperador ? [] : secondaryNav

  const NavLink = ({ label, href, icon: Icon }: { label: string; href: string; icon: typeof Car }) => {
    const active = pathname === href
    return (
      <div className="relative group">
        <Link
          href={href}
          className="flex items-center justify-center rounded-xl transition-all"
          style={{
            background: active ? 'var(--c-border)' : 'transparent',
            color: active ? 'var(--c-text)' : 'var(--c-text4)',
            width: 44,
            height: 44,
          }}
          onMouseEnter={e => {
            if (!active) {
              ;(e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text)'
            }
          }}
          onMouseLeave={e => {
            if (!active) {
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text4)'
            }
          }}
        >
          <Icon size={18} strokeWidth={2} />
        </Link>
        <Tooltip label={label} />
      </div>
    )
  }

  return (
    <aside className="flex flex-col items-center shrink-0 h-full w-[64px] pb-3">
      {/* Franja superior arrastrable: deja espacio para el semáforo de macOS */}
      <div className="w-full h-[52px] shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Logo */}
      <div className="flex items-center justify-center mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Parqueo" width={28} height={28} />
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1">
        {principal.map(item => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {secundario.length > 0 && (
        <>
          <div className="my-3 h-px w-7" style={{ background: 'var(--c-surface3)' }} />
          <nav className="flex flex-col gap-1">
            {secundario.map(item => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
        </>
      )}

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1">
        {!esOperador && <NavLink label="Configuración" href="/dashboard/configuracion" icon={Settings} />}
        <div className="relative group">
          <button
            onClick={() => window.dispatchEvent(new Event('parqueo:logout'))}
            className="flex items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--c-text4)', width: 44, height: 44, cursor: 'pointer' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)'
              ;(e.currentTarget as HTMLElement).style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text4)'
            }}
          >
            <LogOut size={18} />
          </button>
          <Tooltip label="Cerrar sesión" />
        </div>
      </div>
    </aside>
  )
}
