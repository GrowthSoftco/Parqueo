'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Building2, CreditCard, ScrollText, ArrowUpRight, LogOut, Palette, Megaphone } from 'lucide-react'
import { logout as logoutAction } from '@/app/auth-actions'

type Item = { label: string; href: string; icon: typeof Building2 }

const general: Item[] = [
  { label: 'Resumen', href: '/admin', icon: LayoutDashboard },
  { label: 'Cuentas', href: '/admin/cuentas', icon: Building2 },
  { label: 'Suscripciones', href: '/admin/suscripciones', icon: CreditCard },
]

const comunicacion: Item[] = [
  { label: 'Mensajes', href: '/admin/mensajes', icon: Megaphone },
  { label: 'Auditoría', href: '/admin/auditoria', icon: ScrollText },
  { label: 'Personalización', href: '/admin/personalizacion', icon: Palette },
]

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

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await logoutAction()
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col shrink-0 h-full w-[212px] pb-3 px-2.5">
      {/* Franja superior arrastrable (semáforo macOS) */}
      <div className="w-full h-[40px] shrink-0" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Logo + wordmark + marca OPERADOR */}
      <div className="flex items-center gap-2.5 px-2.5 mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Parqueo" width={24} height={24} />
        <span className="text-white" style={{ fontSize: 16, fontWeight: 650, letterSpacing: '-0.01em' }}>Parqueo</span>
        <span className="px-1.5 py-0.5 rounded" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#999', fontSize: 8.5, fontWeight: 800, letterSpacing: '0.06em' }}>OP</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto">
        <SectionLabel>General</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {general.map(item => <NavRow key={item.href} item={item} active={pathname === item.href} />)}
        </div>
        <SectionLabel>Comunicación</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {comunicacion.map(item => <NavRow key={item.href} item={item} active={pathname === item.href} />)}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-3">
        <div className="h-px w-full mb-2.5" style={{ background: '#181818' }} />
        <div className="flex items-center gap-2.5 px-1.5 mb-1">
          <div className="flex items-center justify-center shrink-0" style={{ width: 32, height: 32, borderRadius: 9, background: '#1a1a1a', border: '1px solid #262626', color: '#cfcfcf', fontSize: 11.5, fontWeight: 700 }}>
            OP
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white truncate" style={{ fontSize: 12.5, fontWeight: 600 }}>Operador</p>
            <p className="truncate" style={{ fontSize: 11, color: '#666' }}>Radix LLC</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg h-9 px-2.5 w-full transition-colors"
          style={{ color: '#6e6e6e' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.color = '#d4d4d4' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6e6e6e' }}
        >
          <ArrowUpRight size={17} strokeWidth={2} />
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>Ver la app</span>
        </Link>
        <button
          onClick={logout}
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
