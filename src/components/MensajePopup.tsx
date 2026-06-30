'use client'

import { X } from 'lucide-react'

// Popup premium para los mensajes del desarrollador. Compartido por
// BroadcastWatcher (real) y Toaster (al expandir un notch).
export default function MensajePopup({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[710] flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(5px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden"
        style={{ borderRadius: 22, background: 'var(--c-surface)', border: '1px solid var(--c-border2)', boxShadow: '0 30px 90px rgba(0,0,0,0.6)', animation: 'pop-in 180ms cubic-bezier(0.16,1,0.3,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: 'var(--c-text5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text5)')}
        >
          <X size={17} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center px-7 pt-8 pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Parqueo" width={30} height={30} style={{ marginBottom: 14 }} />
          <div className="flex items-center gap-2">
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: '#eab308' }} />
            <span style={{ color: 'var(--c-text3)', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
              Mensaje de Parqueo
            </span>
          </div>
        </div>

        <div className="h-px mx-7" style={{ background: 'var(--c-border)' }} />

        {/* Cuerpo */}
        <div className="px-7 py-7">
          <p className="text-center" style={{ color: 'var(--c-text)', fontSize: 15.5, lineHeight: 1.6, fontWeight: 450 }}>
            {message}
          </p>
        </div>

        {/* Acción */}
        <div className="px-5 pb-6">
          <button
            onClick={onClose}
            className="w-full rounded-full font-semibold transition-transform hover:scale-[1.01]"
            style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)', fontSize: 14, padding: '12px' }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
