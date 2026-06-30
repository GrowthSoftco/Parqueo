'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { loginOperador } from '@/app/auth-actions'

const inputStyle: React.CSSProperties = {
  background: 'var(--c-surface)',
  border: '1px solid var(--c-border2)',
  borderRadius: '8px',
  color: 'var(--c-text)',
  padding: '10px 14px',
  fontSize: '14px',
  outline: 'none',
}

export default function OperadorLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await loginOperador(email, password)
    if (res.ok) {
      router.replace('/admin')
      router.refresh()
    } else {
      setError(res.error ?? 'Error')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center px-6" style={{ background: 'var(--c-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Parqueo" width={24} height={24} />
          <div className="flex flex-col">
            <span className="text-white" style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.1 }}>Parqueo</span>
            <span style={{ color: '#8b5cf6', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>OPERADOR</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck size={18} color="#8b5cf6" />
          <h1 className="text-white" style={{ fontSize: '22px', fontWeight: 700 }}>Acceso de operador</h1>
        </div>
        <p style={{ color: 'var(--c-text4)', fontSize: '13px', marginBottom: '28px' }}>Área restringida · solo personal autorizado</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="operador@parqueo.com" required style={inputStyle} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ background: '#8b5cf6', color: 'var(--c-text)', borderRadius: '9999px', padding: '11px', fontWeight: 600, fontSize: '14px', border: 'none', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
