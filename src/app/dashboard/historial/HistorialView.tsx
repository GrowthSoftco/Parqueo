'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { Search, Calendar, Download, LogIn, LogOut, Trash2 } from 'lucide-react'
import { anularMovimiento } from '@/app/actions'
import { toast } from '@/lib/toast'

export type Evento = {
  recordId: string
  placa: string
  tipo: string
  hora: string
  accion: 'Entró' | 'Salió'
  monto?: string
  tiempo?: string
  enCurso?: boolean
}

export default function HistorialView({ eventos, fecha, esOwner }: { eventos: Evento[]; fecha: string; esOwner: boolean }) {
  const [q, setQ] = useState('')
  const [pending, start] = useTransition()
  const router = useRouter()
  const visibles = eventos.filter(e => e.placa.toLowerCase().includes(q.toLowerCase()))

  const anular = (recordId: string, placa: string) => {
    if (!confirm(`¿Anular el movimiento de ${placa}? Esto borra el registro y revierte el cobro en caja.`)) return
    start(async () => {
      const res = await anularMovimiento(recordId)
      if (res.ok) { toast('Movimiento anulado', 'success'); router.refresh() }
      else toast(res.error ?? 'No se pudo anular', 'error')
    })
  }

  return (
    <div className="px-7 pb-7 pt-5">
      <PageHeader crumb="Historial" title="Historial de movimientos" subtitle="Todas las entradas y salidas registradas" />

      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg flex-1 max-w-xs" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border2)' }}>
          <Search size={15} color="var(--c-text5)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por placa..." className="bg-transparent outline-none flex-1 text-white" style={{ fontSize: '13px' }} />
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border2)', color: 'var(--c-text2)', fontSize: '13px' }}>
          <Calendar size={15} /> Hoy
        </button>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg ml-auto" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border2)', color: 'var(--c-text2)', fontSize: '13px' }}>
          <Download size={15} /> Exportar
        </button>
      </div>

      <div className="rounded-2xl p-6" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <p style={{ color: 'var(--c-text4)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px' }}>{fecha.toUpperCase()}</p>

        <div className="flex flex-col">
          {visibles.map((e, i) => {
            const entrada = e.accion === 'Entró'
            const Icon = entrada ? LogIn : LogOut
            const color = entrada ? '#22c55e' : '#9ca3af'
            const first = i === 0
            const last = i === visibles.length - 1
            return (
              <div key={i} className="flex items-stretch gap-4">
                <div className="w-12 shrink-0 flex justify-end pt-4">
                  <span className="font-mono" style={{ color: 'var(--c-text4)', fontSize: '12px' }}>{e.hora}</span>
                </div>
                <div className="relative w-8 shrink-0 flex justify-center">
                  <div className="absolute w-px" style={{ background: 'var(--c-border3)', left: '50%', top: first ? '18px' : 0, bottom: last ? 'auto' : 0, height: last ? '18px' : 'auto' }} />
                  <div className="w-8 h-8 rounded-full flex items-center justify-center z-10 mt-2" style={{ background: entrada ? '#0f2a1a' : 'var(--c-surface3)', border: `1px solid ${color}33` }}>
                    <Icon size={14} color={color} />
                  </div>
                </div>
                <div
                  className="group flex-1 flex items-center justify-between my-1.5 px-4 py-2.5 rounded-xl transition-colors"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = 'var(--c-surface3)'; (ev.currentTarget as HTMLElement).style.borderColor = 'var(--c-border2)' }}
                  onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'transparent'; (ev.currentTarget as HTMLElement).style.borderColor = 'transparent' }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono" style={{ fontSize: '14px' }}>{e.placa}</span>
                      <span className="px-1.5 py-0.5 rounded-md" style={{ background: `${color}1f`, color, fontSize: '11px', fontWeight: 600 }}>{e.accion}</span>
                    </div>
                    <p style={{ color: 'var(--c-text5)', fontSize: '12px', marginTop: '2px' }}>{e.tipo}{e.tiempo ? ` · ${e.tiempo}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {e.enCurso ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#0f2a1a', color: '#22c55e', border: '1px solid #1a4a2a' }}>Adentro</span>
                    ) : e.monto ? (
                      <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>{e.monto}</p>
                    ) : null}
                    {esOwner && (
                      <button
                        onClick={() => anular(e.recordId, e.placa)}
                        disabled={pending}
                        title="Anular movimiento"
                        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        style={{ color: 'var(--c-text4)', cursor: 'pointer' }}
                        onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = '#2a0f0f'; (ev.currentTarget as HTMLElement).style.color = '#ef4444' }}
                        onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'transparent'; (ev.currentTarget as HTMLElement).style.color = 'var(--c-text4)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {visibles.length === 0 && (
            <p style={{ color: 'var(--c-text5)', fontSize: '13px', padding: '12px 0' }}>No hay movimientos{q ? ' para esa placa' : ''}.</p>
          )}
        </div>
      </div>
    </div>
  )
}
