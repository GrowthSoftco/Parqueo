'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Power } from 'lucide-react'
import { logout } from '@/app/auth-actions'

// Escucha el evento global 'parqueo:logout' (lo disparan TopBar y Sidebar),
// pide confirmación y al confirmar hace un fundido a negro muy suave antes de salir.
export default function LogoutDialog() {
  const router = useRouter()
  const [phase, setPhase] = useState<'idle' | 'confirm' | 'fading'>('idle')

  useEffect(() => {
    const open = () => setPhase('confirm')
    window.addEventListener('parqueo:logout', open)
    return () => window.removeEventListener('parqueo:logout', open)
  }, [])

  const confirmar = () => {
    setPhase('fading')
    // Espera a que el fundido a negro termine y luego cierra sesión
    window.setTimeout(async () => {
      await logout()
      router.push('/login')
      router.refresh()
    }, 700)
  }

  return (
    <>
      {/* Modal de confirmación */}
      {phase === 'confirm' && (
        <div
          className="fixed inset-0 z-[400] flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPhase('idle')}
        >
          <div
            className="rounded-2xl w-full max-w-sm p-6 text-center"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border3)', animation: 'pop-in 180ms cubic-bezier(0.16,1,0.3,1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'color-mix(in srgb, #ef4444 16%, transparent)', border: '1px solid color-mix(in srgb, #ef4444 32%, transparent)' }}>
              <Power size={22} color="#ef4444" strokeWidth={2.2} />
            </div>
            <p className="text-white" style={{ fontSize: '17px', fontWeight: 600 }}>¿Cerrar sesión?</p>
            <p style={{ color: 'var(--c-text3)', fontSize: '13px', marginTop: 8, lineHeight: 1.5 }}>
              Vas a salir de tu cuenta. Tendrás que volver a iniciar sesión para entrar.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPhase('idle')}
                className="flex-1 rounded-full py-2.5 font-semibold transition-colors"
                style={{ background: 'var(--c-border)', border: '1px solid var(--c-border3)', color: 'var(--c-text2)', fontSize: '13.5px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmar}
                className="flex-1 rounded-full py-2.5 font-semibold transition-transform hover:scale-[1.02]"
                style={{ background: '#ef4444', color: 'var(--c-text)', fontSize: '13.5px', cursor: 'pointer' }}
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fundido a negro */}
      <div
        className="fixed inset-0"
        style={{
          background: 'var(--c-bg)',
          zIndex: 600,
          opacity: phase === 'fading' ? 1 : 0,
          pointerEvents: phase === 'fading' ? 'auto' : 'none',
          transition: 'opacity 650ms ease-in-out',
        }}
      />
    </>
  )
}
