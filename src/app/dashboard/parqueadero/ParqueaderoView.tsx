'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { Car, LogOut } from 'lucide-react'
import { iconoDe } from '@/lib/vehicleIcons'

export type Vehiculo = { recordId: string; placa: string; tipoNombre: string; icono: string; desde: string; hace: string }
export type ResumenCat = { nombre: string; icono: string; count: number }

export default function ParqueaderoView({
  vehiculos, total, ocupados, libres, resumen,
}: {
  vehiculos: Vehiculo[]
  total: number
  ocupados: number
  libres: number
  resumen: ResumenCat[]
}) {
  const [filter, setFilter] = useState<string>('todos')
  const visible = vehiculos.filter(v => filter === 'todos' || v.tipoNombre === filter)
  const pct = total > 0 ? Math.min(100, Math.round((ocupados / total) * 100)) : 0

  const darSalida = (placa: string) => window.dispatchEvent(new CustomEvent('parqueo:salida', { detail: { placa } }))

  return (
    <div className="px-7 pb-7 pt-5">
      <PageHeader crumb="Parqueadero" title="Parqueadero en tiempo real" subtitle={`${ocupados} ocupados · ${libres} libres`} />

      {/* Ocupación */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p style={{ color: 'var(--c-text4)', fontSize: '13px' }}>Ocupación ahora</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-white font-bold" style={{ fontSize: '34px', letterSpacing: '-0.01em' }}>{ocupados}</span>
              <span style={{ color: 'var(--c-text4)', fontSize: '16px' }}>/ {total}</span>
              <span style={{ color: libres === 0 ? '#ef4444' : '#22c55e', fontSize: '13px', fontWeight: 600, marginLeft: 8 }}>
                {libres === 0 ? 'Lleno' : `${libres} libres`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            {resumen.map(c => {
              const Icon = iconoDe(c.icono)
              return (
                <div key={c.nombre} className="flex items-center gap-2">
                  <Icon size={15} color="var(--c-text4)" />
                  <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>{c.count}</span>
                  <span style={{ color: 'var(--c-text4)', fontSize: '12.5px' }}>{c.nombre.toLowerCase()}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="w-full rounded-full overflow-hidden mt-4" style={{ height: 8, background: 'var(--c-border)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: libres === 0 ? '#ef4444' : 'var(--c-text)' }} />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['todos', ...resumen.map(c => c.nombre)].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-full transition-colors"
            style={{ background: filter === f ? 'var(--c-text)' : 'var(--c-surface2)', color: filter === f ? 'var(--c-bg)' : 'var(--c-text3)', border: '1px solid var(--c-border2)', fontSize: '13px', fontWeight: 500 }}
          >
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* Vehículos adentro */}
      {visible.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center text-center" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', padding: '56px 0', color: 'var(--c-text5)' }}>
          <Car size={28} strokeWidth={1.5} />
          <p style={{ fontSize: '13.5px', marginTop: 12 }}>{ocupados === 0 ? 'No hay vehículos adentro' : 'Ninguno de esta categoría'}</p>
          <p style={{ fontSize: '12.5px', color: 'var(--c-text5)', marginTop: 4 }}>Las entradas aparecerán aquí en tiempo real</p>
        </div>
      ) : (
        <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
          {visible.map(v => {
            const Icon = iconoDe(v.icono)
            return (
              <button
                key={v.recordId}
                onClick={() => darSalida(v.placa)}
                title="Dar salida"
                className="group rounded-xl p-3.5 text-left transition-colors"
                style={{ background: 'var(--c-surface2)', border: '1px solid var(--c-border2)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-surface2)')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5" style={{ color: 'var(--c-text3)' }}>
                    <Icon size={14} />
                    <span style={{ fontSize: '11.5px' }}>{v.tipoNombre}</span>
                  </div>
                  <span style={{ color: 'var(--c-text5)', fontSize: '11.5px' }}>{v.hace}</span>
                </div>
                <p className="text-white font-mono" style={{ fontSize: '16px', letterSpacing: '0.05em', fontWeight: 600 }}>{v.placa}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span style={{ color: 'var(--c-text5)', fontSize: '11px' }}>Desde {v.desde}</span>
                  <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--c-text)', fontSize: '11px', fontWeight: 600 }}>
                    Salida <LogOut size={11} />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
