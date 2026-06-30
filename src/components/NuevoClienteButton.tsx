'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { crearCliente } from '@/app/actions'

const inputStyle: React.CSSProperties = {
  background: '#0f0f0f', border: '1px solid #232323', borderRadius: '8px',
  color: '#fff', padding: '10px 14px', fontSize: '14px', outline: 'none', width: '100%',
}

export default function NuevoClienteButton() {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const close = () => { setOpen(false); setNombre(''); setTel(''); setEmail(''); setError('') }
  const submit = () => {
    if (!nombre.trim()) { setError('Escribe el nombre'); return }
    start(async () => {
      const res = await crearCliente(nombre, tel, email)
      if (res.ok) { close(); router.refresh() } else setError(res.error ?? 'Error')
    })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-black font-semibold" style={{ background: '#fff', fontSize: '13px' }}>
        <Plus size={15} strokeWidth={2.5} /> Nuevo cliente
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={close}>
          <div className="rounded-2xl w-full max-w-sm p-6" style={{ background: '#141414', border: '1px solid #262626' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>Nuevo cliente</p>
              <button onClick={close} style={{ color: '#666' }}><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label style={{ color: '#888', fontSize: '13px' }}>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Juan Pérez" autoFocus style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: '#888', fontSize: '13px' }}>Teléfono</label>
                <input value={tel} onChange={e => setTel(e.target.value)} placeholder="300 123 4567" style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: '#888', fontSize: '13px' }}>Email (opcional)</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" style={inputStyle} />
              </div>
              {error && <p style={{ color: '#ef4444', fontSize: '13px' }}>{error}</p>}
              <button onClick={submit} disabled={pending} className="w-full rounded-full py-2.5 mt-2 text-black font-semibold" style={{ background: '#fff', fontSize: '14px', opacity: pending ? 0.6 : 1 }}>
                {pending ? 'Guardando...' : 'Crear cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
