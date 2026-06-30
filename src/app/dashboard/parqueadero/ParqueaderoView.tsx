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
      <div className="rounded-2xl p-5 mb-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p style={{ color: '#777', fontSize: '13px' }}>Ocupación ahora</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-white font-bold" style={{ fontSize: '34px', letterSpacing: '-0.01em' }}>{ocupados}</span>
              <span style={{ color: '#666', fontSize: '16px' }}>/ {total}</span>
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
                  <Icon size={15} color="#777" />
                  <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>{c.count}</span>
                  <span style={{ color: '#666', fontSize: '12.5px' }}>{c.nombre.toLowerCase()}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="w-full rounded-full overflow-hidden mt-4" style={{ height: 8, background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: libres === 0 ? '#ef4444' : '#fff' }} />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['todos', ...resumen.map(c => c.nombre)].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-full transition-colors"
            style={{ background: filter === f ? '#fff' : '#161616', color: filter === f ? '#000' : '#888', border: '1px solid #232323', fontSize: '13px', fontWeight: 500 }}
          >
            {f === 'todos' ? 'Todos' : f}
          </button>
        ))}
      </div>

      {/* Vehículos adentro */}
      {visible.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center text-center" style={{ background: '#141414', border: '1px solid #1e1e1e', padding: '56px 0', color: '#555' }}>
          <Car size={28} strokeWidth={1.5} />
          <p style={{ fontSize: '13.5px', marginTop: 12 }}>{ocupados === 0 ? 'No hay vehículos adentro' : 'Ninguno de esta categoría'}</p>
          <p style={{ fontSize: '12.5px', color: '#444', marginTop: 4 }}>Las entradas aparecerán aquí en tiempo real</p>
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
                style={{ background: '#161616', border: '1px solid #232323' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1c1c1c')}
                onMouseLeave={e => (e.currentTarget.style.background = '#161616')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5" style={{ color: '#888' }}>
                    <Icon size={14} />
                    <span style={{ fontSize: '11.5px' }}>{v.tipoNombre}</span>
                  </div>
                  <span style={{ color: '#555', fontSize: '11.5px' }}>{v.hace}</span>
                </div>
                <p className="text-white font-mono" style={{ fontSize: '16px', letterSpacing: '0.05em', fontWeight: 600 }}>{v.placa}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span style={{ color: '#555', fontSize: '11px' }}>Desde {v.desde}</span>
                  <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>
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
