'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/app/auth-actions'
import { getLoginBg, getPusherConfig } from '@/app/actions'
import { getPusher, CH_PUBLIC } from '@/lib/pusherClient'
import type Pusher from 'pusher-js'
import type { Channel } from 'pusher-js'

const DEFAULT_BG =
  'radial-gradient(circle at 30% 20%, #1e4ba0 0%, transparent 50%), radial-gradient(circle at 70% 80%, #0a2050 0%, transparent 55%), linear-gradient(135deg, #0a1830 0%, #0d2655 100%)'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [bg, setBg] = useState<string>(DEFAULT_BG)

  useEffect(() => {
    // Carga el fondo guardado y se suscribe a cambios en vivo (Pusher)
    getLoginBg().then(v => { if (v) setBg(v) }).catch(() => {})
    let pusher: Pusher | null = null
    let ch: Channel | null = null
    getPusherConfig().then(({ key, cluster }) => {
      pusher = getPusher(key, cluster)
      if (!pusher) return
      ch = pusher.subscribe(CH_PUBLIC)
      ch.bind('login-bg', (d: { value?: string }) => { if (d?.value) setBg(d.value) })
    }).catch(() => {})
    return () => { if (ch) ch.unbind('login-bg'); if (pusher) pusher.unsubscribe(CH_PUBLIC) }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, password)
    if (res.ok) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setError(res.error ?? 'Error')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: 'var(--c-bg)' }}>
      {/* Left - Form */}
      <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center px-12 lg:px-20">
        <div className="absolute top-11 left-12 lg:left-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Parqueo" width={28} height={28} />
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-white text-3xl font-bold mb-2">Bienvenido</h1>
          <p style={{ color: 'var(--c-text3)' }} className="text-sm mb-8">Accede a tu panel de gestión</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@parqueadero.com"
                required
                style={{
                  background: 'var(--c-surface2)',
                  border: '1px solid var(--c-border2)',
                  borderRadius: '8px',
                  color: 'var(--c-text)',
                  padding: '10px 14px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--c-text5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--c-border2)')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  background: 'var(--c-surface2)',
                  border: '1px solid var(--c-border2)',
                  borderRadius: '8px',
                  color: 'var(--c-text)',
                  padding: '10px 14px',
                  fontSize: '14px',
                  outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--c-text5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--c-border2)')}
              />
            </div>

            <div className="flex justify-end">
              <a href="#" style={{ color: 'var(--c-text3)', fontSize: '13px' }} className="hover:text-white transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '-8px' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--c-accent)',
                color: 'var(--c-on-accent)',
                borderRadius: '9999px',
                padding: '11px',
                fontWeight: '600',
                fontSize: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ color: 'var(--c-text5)', fontSize: '13px', marginTop: '24px', textAlign: 'center' }}>
            ¿No tienes cuenta?{' '}
            <a href="/register" style={{ color: 'var(--c-text)' }} className="hover:underline">
              Pruébalo gratis 14 días
            </a>
          </p>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:block w-1/2 relative p-2.5">
        <div
          className="w-full h-full rounded-2xl relative overflow-hidden"
          style={{ background: bg }}
        >
          {/* Grain texture */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>

          {/* Brand mark */}
          <div className="absolute bottom-8 left-8">
            <p className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>Parqueo</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '2px' }}>
              Gestión de parqueaderos en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
