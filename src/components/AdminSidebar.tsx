'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Building2, CreditCard, ScrollText, ArrowUpRight, LogOut, Palette, Megaphone } from 'lucide-react'
import { logout as logoutAction } from '@/app/auth-actions'

const nav = [
  { label: 'Resumen', href: '/admin', icon: LayoutDashboard },
  { label: 'Cuentas', href: '/admin/cuentas', icon: Building2 },
  { label: 'Suscripciones', href: '/admin/suscripciones', icon: CreditCard },
  { label: 'Mensajes', href: '/admin/mensajes', icon: Megaphone },
  { label: 'Auditoría', href: '/admin/auditoria', icon: ScrollText },
  { label: 'Personalización', href: '/admin/personalizacion', icon: Palette },
]

function Tooltip({ label }: { label: string }) {
  return (
    <div
      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none z-[100] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
      style={{ background: 'var(--c-border)', border: '1px solid var(--c-border3)', color: 'var(--c-text)', fontSize: '12.5px', fontWeight: 500, boxShadow: '0 6px 20px rgba(0,0,0,0.5)' }}
    >
      {label}
    </div>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await logoutAction()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col items-center shrink-0 h-full w-[64px] pb-3">
      {/* Franja superior arrastrable (semáforo macOS) */}
      <div className="w-full h-[52px] shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Logo + marca OPERADOR */}
      <div className="relative group flex items-center justify-center mb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Parqueo" width={28} height={28} />
        <span className="absolute -bottom-2.5 px-1 rounded" style={{ background: 'var(--c-surface3)', border: '1px solid var(--c-border3)', color: 'var(--c-text3)', fontSize: '7.5px', fontWeight: 800, letterSpacing: '0.04em' }}>OP</span>
        <Tooltip label="Consola de operador" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 mt-2">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <div key={href} className="relative group">
              <Link
                href={href}
                className="flex items-center justify-center rounded-xl transition-all"
                style={{ background: active ? 'var(--c-border)' : 'transparent', color: active ? 'var(--c-text)' : 'var(--c-text4)', width: 44, height: 44 }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--c-text)' } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--c-text4)' } }}
              >
                <Icon size={18} strokeWidth={2} />
              </Link>
              <Tooltip label={label} />
            </div>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1">
        <div className="relative group">
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--c-text4)', width: 44, height: 44 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--c-text)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--c-text4)' }}
          >
            <ArrowUpRight size={18} />
          </Link>
          <Tooltip label="Ver la app" />
        </div>
        <div className="relative group">
          <button
            onClick={logout}
            className="flex items-center justify-center rounded-xl transition-colors"
            style={{ color: 'var(--c-text4)', width: 44, height: 44, cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--c-surface2)'; (e.currentTarget as HTMLElement).style.color = '#ef4444' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--c-text4)' }}
          >
            <LogOut size={18} />
          </button>
          <Tooltip label="Cerrar sesión · Radix LLC" />
        </div>
      </div>
    </aside>
  )
}
