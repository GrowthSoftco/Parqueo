'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registrarCuenta } from '@/app/auth-actions'

const inputStyle: React.CSSProperties = {
  background: '#161616',
  border: '1px solid #222',
  borderRadius: '8px',
  color: '#fff',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await registrarCuenta(nombre, email, password)
    if (res.ok) {
      router.push('/planes')
      router.refresh()
    } else {
      setError(res.error ?? 'Error')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Left - Form */}
      <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center px-12 lg:px-20">
        <div className="absolute top-11 left-12 lg:left-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Parqueo" width={28} height={28} />
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-white text-3xl font-bold mb-2">Crea tu cuenta</h1>
          <p style={{ color: '#888' }} className="text-sm mb-8">14 días de prueba gratis · sin tarjeta</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label style={{ color: '#888', fontSize: '13px' }}>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan Pérez" required style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label style={{ color: '#888', fontSize: '13px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@parqueadero.com" required style={inputStyle} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label style={{ color: '#888', fontSize: '13px' }}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#fff',
                color: '#000',
                borderRadius: '9999px',
                padding: '11px',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ color: '#555', fontSize: '13px', marginTop: '24px', textAlign: 'center' }}>
            ¿Ya tienes cuenta?{' '}
            <a href="/login" style={{ color: '#fff' }} className="hover:underline">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:block w-1/2 relative p-2.5">
        <div
          className="w-full h-full rounded-2xl relative overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, #1e4ba0 0%, transparent 50%), radial-gradient(circle at 70% 80%, #0a2050 0%, transparent 55%), linear-gradient(135deg, #0a1830 0%, #0d2655 100%)',
          }}
        >
          <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
            <filter id="grain2">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain2)" />
          </svg>
          <div className="absolute bottom-8 left-8">
            <p className="text-white" style={{ fontSize: '15px', fontWeight: 600 }}>Parqueo</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '2px' }}>
              Empieza a gestionar tu parqueadero hoy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
