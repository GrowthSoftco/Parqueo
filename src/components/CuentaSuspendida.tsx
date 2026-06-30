'use client'

import { useRouter } from 'next/navigation'
import { Ban } from 'lucide-react'
import AccountWatcher from '@/components/AccountWatcher'

export default function CuentaSuspendida({ status }: { status: string }) {
  const router = useRouter()
  const banned = status === 'BANNED'

  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center px-6 text-center overflow-hidden" style={{ background: '#000000' }}>
      <AccountWatcher />
      {/* Resplandor rojo de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 42%, rgba(239,68,68,0.10), transparent 55%)' }}
      />

      <div className="relative flex flex-col items-center">
        {/* Ícono prohibido con anillos pulsantes en tiempo real */}
        <div className="relative mb-10" style={{ width: 104, height: 104 }}>
          <span className="ring-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '9999px', border: '1.5px solid rgba(239,68,68,0.55)' }} />
          <span className="ring-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '9999px', border: '1.5px solid rgba(239,68,68,0.55)', animationDelay: '1.3s' }} />
          <div
            className="core-glow"
            style={{ position: 'absolute', inset: 0, borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#150909', border: '1.5px solid rgba(239,68,68,0.45)' }}
          >
            <Ban size={46} color="#ef4444" strokeWidth={2} />
          </div>
        </div>

        <h1 className="text-white font-bold" style={{ fontSize: '28px', letterSpacing: '-0.01em' }}>
          {banned ? 'Cuenta bloqueada' : 'Cuenta suspendida'}
        </h1>
        <p style={{ color: '#888', fontSize: '15px', marginTop: '12px', maxWidth: '420px', lineHeight: 1.55 }}>
          {banned
            ? 'El acceso a tu parqueadero fue bloqueado. Contáctanos para resolverlo.'
            : 'Tienes un pago pendiente. Ponte al día para volver a operar tu parqueadero.'}
        </p>

        <div className="mt-7 px-5 py-3 rounded-xl flex items-center gap-3" style={{ background: '#0d0d0d', border: '1px solid #1c1c1c' }}>
          <span style={{ color: '#555', fontSize: '12px' }}>Soporte</span>
          <span style={{ width: 1, height: 14, background: '#222' }} />
          <span className="text-white" style={{ fontSize: '13px' }}>soporte@parqueo.com</span>
          <span style={{ width: 1, height: 14, background: '#222' }} />
          <span className="text-white" style={{ fontSize: '13px' }}>WhatsApp 300 000 0000</span>
        </div>

        {!banned && (
          <button
            onClick={() => router.push('/planes')}
            className="mt-9 px-8 py-3 rounded-full text-black font-semibold transition-transform hover:scale-[1.03]"
            style={{ background: '#fff', fontSize: '14.5px' }}
          >
            Pagar ahora
          </button>
        )}
      </div>
    </div>
  )
}
