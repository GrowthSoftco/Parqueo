'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, X, Check, ArrowUp, ArrowDown } from 'lucide-react'
import { cerrarTurno } from '@/app/actions'
import { toast } from '@/lib/toast'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')

export default function CerrarTurnoButton({ esperado, base, ingresos }: { esperado: number; base: number; ingresos: number }) {
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()

  const contado = raw === '' ? null : Number(raw)
  const dif = contado === null ? null : contado - esperado
  const cuadra = dif === 0
  const sobra = dif !== null && dif > 0
  const falta = dif !== null && dif < 0

  const cerrar = () => {
    setOpen(false)
    setRaw('')
  }

  const confirmar = () => {
    start(async () => {
      const res = await cerrarTurno(contado ?? undefined)
      if (res?.ok === false) { toast(res.error ?? 'No se pudo cerrar el turno', 'error'); return }
      toast('Turno cerrado', 'success')
      cerrar()
      router.refresh()
    })
  }

  // Estado del comparador
  const estado = dif === null
    ? { color: '#666', bg: '#1a1a1a', label: 'Escribe el efectivo contado', icon: null }
    : cuadra
      ? { color: '#22c55e', bg: '#0f2a1a', label: 'Caja cuadrada', icon: <Check size={14} strokeWidth={2.5} /> }
      : sobra
        ? { color: '#f59e0b', bg: '#2a210d', label: `Sobrante ${fmt(Math.abs(dif!))}`, icon: <ArrowUp size={14} strokeWidth={2.5} /> }
        : { color: '#ef4444', bg: '#2a0f0f', label: `Faltante ${fmt(Math.abs(dif!))}`, icon: <ArrowDown size={14} strokeWidth={2.5} /> }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-black font-semibold" style={{ background: '#fff', fontSize: '13px' }}>
        Cerrar turno y arquear <ArrowRight size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={cerrar}>
          <div className="rounded-2xl w-full max-w-md p-6" style={{ background: '#141414', border: '1px solid #262626' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>Cerrar turno y arquear</p>
                <p style={{ color: '#666', fontSize: '12px', marginTop: 2 }}>Cuenta el efectivo y compáralo con lo esperado</p>
              </div>
              <button onClick={cerrar} style={{ color: '#666' }}><X size={18} /></button>
            </div>

            {/* Desglose esperado */}
            <div className="rounded-xl p-4 mb-4" style={{ background: '#0e0e0e', border: '1px solid #1e1e1e' }}>
              <div className="flex justify-between" style={{ padding: '3px 0' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Base inicial</span>
                <span className="text-white" style={{ fontSize: '13px' }}>{fmt(base)}</span>
              </div>
              <div className="flex justify-between" style={{ padding: '3px 0' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>Ingresos del turno</span>
                <span className="text-white" style={{ fontSize: '13px' }}>{fmt(ingresos)}</span>
              </div>
              <div style={{ height: 1, background: '#1e1e1e', margin: '8px 0' }} />
              <div className="flex justify-between items-baseline">
                <span className="text-white" style={{ fontSize: '13px', fontWeight: 600 }}>Esperado en caja</span>
                <span className="text-white font-bold" style={{ fontSize: '20px' }}>{fmt(esperado)}</span>
              </div>
            </div>

            {/* Conteo real */}
            <label style={{ color: '#888', fontSize: '13px' }}>¿Cuánto hay en caja?</label>
            <div className="flex items-center mt-2 rounded-xl overflow-hidden" style={{ background: '#0e0e0e', border: '1px solid #2a2a2a' }}>
              <span className="text-white pl-4" style={{ fontSize: '20px', fontWeight: 600 }}>$</span>
              <input
                autoFocus
                inputMode="numeric"
                value={raw}
                onChange={e => setRaw(e.target.value.replace(/[^\d]/g, ''))}
                placeholder="0"
                className="flex-1 bg-transparent text-white outline-none px-2 py-3"
                style={{ fontSize: '20px', fontWeight: 600 }}
              />
            </div>

            {/* Comparador */}
            <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl" style={{ background: estado.bg }}>
              {estado.icon && <span style={{ color: estado.color }}>{estado.icon}</span>}
              <span style={{ color: estado.color, fontSize: '13px', fontWeight: 600 }}>{estado.label}</span>
              {dif !== null && !cuadra && (
                <span className="ml-auto" style={{ color: estado.color, fontSize: '13px', fontWeight: 700 }}>
                  {sobra ? '+' : '−'}{fmt(Math.abs(dif!))}
                </span>
              )}
            </div>

            <button
              onClick={confirmar}
              disabled={pending}
              className="w-full rounded-full py-3 text-black font-semibold mt-5"
              style={{ background: '#fff', fontSize: '14px', opacity: pending ? 0.6 : 1, cursor: pending ? 'default' : 'pointer' }}
            >
              {pending ? 'Cerrando…' : contado === null ? 'Cerrar sin arqueo' : 'Confirmar cierre'}
            </button>
            <p className="text-center" style={{ color: '#555', fontSize: '11px', marginTop: 10 }}>El turno quedará cerrado. Para seguir operando abre uno nuevo.</p>
          </div>
        </div>
      )}
    </>
  )
}
