'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { abrirTurno } from '@/app/actions'
import { toast } from '@/lib/toast'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')

export default function AbrirTurnoButton() {
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const base = raw === '' ? 0 : Number(raw)

  const confirmar = () => {
    start(async () => {
      const res = await abrirTurno(base)
      if (res?.ok === false) { toast(res.error ?? 'No se pudo abrir el turno', 'error'); return }
      toast(base > 0 ? `Turno abierto · base ${fmt(base)}` : 'Turno abierto', 'success')
      setOpen(false)
      setRaw('')
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-full text-black font-semibold transition-transform hover:scale-[1.02]"
        style={{ background: '#fff', fontSize: '14px', cursor: 'pointer' }}
      >
        Abrir turno
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)}>
          <div className="rounded-2xl w-full max-w-sm p-6" style={{ background: '#141414', border: '1px solid #262626' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>Abrir turno</p>
              <button onClick={() => setOpen(false)} style={{ color: '#666' }}><X size={18} /></button>
            </div>
            <p style={{ color: '#666', fontSize: '12.5px', marginBottom: 18 }}>¿Con cuánto efectivo arrancas la caja?</p>

            <label style={{ color: '#888', fontSize: '13px' }}>Base inicial</label>
            <div className="flex items-center mt-2 rounded-xl overflow-hidden" style={{ background: '#0e0e0e', border: '1px solid #2a2a2a' }}>
              <span className="text-white pl-4" style={{ fontSize: '20px', fontWeight: 600 }}>$</span>
              <input
                autoFocus
                inputMode="numeric"
                value={raw}
                onChange={e => setRaw(e.target.value.replace(/[^\d]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') confirmar() }}
                placeholder="0"
                className="flex-1 bg-transparent text-white outline-none px-2 py-3"
                style={{ fontSize: '20px', fontWeight: 600 }}
              />
            </div>
            {base > 0 && <p style={{ color: '#666', fontSize: 12, marginTop: 8 }}>La caja arranca con {fmt(base)}</p>}

            <button onClick={confirmar} disabled={pending} className="w-full rounded-full py-3 text-black font-semibold mt-5" style={{ background: '#fff', fontSize: '14px', opacity: pending ? 0.6 : 1, cursor: pending ? 'default' : 'pointer' }}>
              {pending ? 'Abriendo…' : 'Abrir turno'}
            </button>
            <p className="text-center" style={{ color: '#555', fontSize: 11, marginTop: 10 }}>Sin un turno abierto no puedes registrar entradas ni salidas</p>
          </div>
        </div>
      )}
    </>
  )
}
