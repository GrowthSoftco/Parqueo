import Link from 'next/link'
import { LogIn, UserPlus, ListChecks, LayoutDashboard, ArrowUpRight } from 'lucide-react'

const screens = [
  {
    group: 'Autenticación',
    items: [
      { label: 'Login', href: '/login', desc: 'Inicio de sesión', icon: LogIn },
      { label: 'Register', href: '/register', desc: 'Crear cuenta nueva', icon: UserPlus },
    ],
  },
  {
    group: 'Configuración inicial',
    items: [
      { label: 'Onboarding', href: '/onboarding', desc: 'Flujo paso a paso (4 pasos)', icon: ListChecks },
    ],
  },
  {
    group: 'App',
    items: [
      { label: 'Dashboard', href: '/dashboard', desc: 'Panel principal', icon: LayoutDashboard },
    ],
  },
]

export default function DevPage() {
  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: 'var(--c-bg)' }}>
      <div className="w-full max-w-2xl px-8 py-16">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-md"
            style={{ background: 'var(--c-surface3)', color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}
          >
            DEV
          </span>
          <span style={{ color: 'var(--c-text5)', fontSize: '12px' }}>Solo visible en desarrollo</span>
        </div>
        <h1 className="text-white font-bold mb-1" style={{ fontSize: '28px' }}>
          Pantallas
        </h1>
        <p style={{ color: 'var(--c-text4)', fontSize: '14px', marginBottom: '40px' }}>
          Navega cualquier pantalla del sistema sin tener que seguir el flujo completo.
        </p>

        <div className="flex flex-col gap-8">
          {screens.map(section => (
            <div key={section.group}>
              <p
                style={{
                  color: 'var(--c-text5)',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  marginBottom: '12px',
                }}
              >
                {section.group.toUpperCase()}
              </p>
              <div className="flex flex-col gap-2">
                {section.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-4 p-4 rounded-xl transition-colors group"
                    style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'var(--c-surface3)' }}
                    >
                      <item.icon size={18} color="var(--c-text2)" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {item.label}
                      </p>
                      <p style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{item.desc}</p>
                    </div>
                    <code style={{ color: 'var(--c-text5)', fontSize: '12px' }}>{item.href}</code>
                    <ArrowUpRight size={16} color="var(--c-text5)" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
