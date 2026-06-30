'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LogIn, UserPlus, Tag, ListChecks, LayoutDashboard, ShieldCheck, Code2, X } from 'lucide-react'

const screens = [
  { label: 'Login', href: '/login', icon: LogIn },
  { label: 'Register', href: '/register', icon: UserPlus },
  { label: 'Planes', href: '/planes', icon: Tag },
  { label: 'Onboarding', href: '/onboarding', icon: ListChecks },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Operador', href: '/admin', icon: ShieldCheck },
]

export default function DevDock() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999]" style={{ fontFamily: 'system-ui' }}>
      {open ? (
        <div
          className="flex items-center gap-1 p-1.5 rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(20,20,20,0.85)',
            border: '1px solid var(--c-border3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-1 px-1.5">
            <Code2 size={13} color="#f59e0b" />
            <span style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600 }}>DEV</span>
          </div>
          <div className="w-px h-5 mx-0.5" style={{ background: 'var(--c-border3)' }} />
          {screens.map(s => {
            const active = pathname === s.href
            return (
              <button
                key={s.href}
                onClick={() => router.push(s.href)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors"
                style={{
                  background: active ? 'var(--c-text)' : 'transparent',
                  color: active ? 'var(--c-bg)' : 'var(--c-text3)',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--c-border3)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text)'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--c-text3)'
                  }
                }}
              >
                <s.icon size={14} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{s.label}</span>
              </button>
            )
          })}
          <div className="w-px h-5 mx-0.5" style={{ background: 'var(--c-border3)' }} />
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--c-text4)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text4)')}
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl transition-transform hover:scale-105"
          style={{
            background: 'rgba(20,20,20,0.85)',
            border: '1px solid var(--c-border3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Code2 size={14} color="#f59e0b" />
          <span style={{ color: 'var(--c-text2)', fontSize: '12px', fontWeight: 600 }}>Pantallas</span>
        </button>
      )}
    </div>
  )
}
