'use client'

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { FileSpreadsheet, TrendingUp, Car, Receipt, Clock } from 'lucide-react'

type Turno = { id: string; operario: string; fecha: string; base: number; recaudado: number; esperado: number; contado: number | null; dif: number | null }
type Rank = { operario: string; turnos: number; recaudado: number; descuadre: number; cuadrados: number }
type Cat = { nombre: string; monto: number; pct: number }
type Mes = { label: string; monto: number }

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')

export default function ReportesView({
  turnos, ranking, porCategoria, porHora, horaPico, porMes, stats, empresa,
}: {
  turnos: Turno[]; ranking: Rank[]; porCategoria: Cat[]; porHora: number[]; horaPico: number; porMes: Mes[]
  stats: { totalIngresos: number; vehiculos: number; ticketProm: number }; empresa: string
}) {
  const [tab, setTab] = useState<'turnos' | 'analitica'>('turnos')

  const exportar = () => {
    const sep = ';'
    const lines: string[] = []
    lines.push(`Reporte Parqueo${sep}${empresa}`)
    lines.push('')
    lines.push('TURNOS Y CAJA')
    lines.push(['Operario', 'Fecha', 'Base', 'Recaudado', 'Esperado', 'Contado', 'Diferencia'].join(sep))
    turnos.forEach(t => lines.push([t.operario, t.fecha, t.base, t.recaudado, t.esperado, t.contado ?? '', t.dif ?? ''].join(sep)))
    lines.push('')
    lines.push('RANKING POR EMPLEADO')
    lines.push(['Operario', 'Turnos', 'Recaudado', 'Descuadre acumulado'].join(sep))
    ranking.forEach(r => lines.push([r.operario, r.turnos, r.recaudado, r.descuadre].join(sep)))
    lines.push('')
    lines.push('INGRESOS POR CATEGORIA (6 meses)')
    lines.push(['Categoria', 'Monto', '%'].join(sep))
    porCategoria.forEach(c => lines.push([c.nombre, c.monto, c.pct].join(sep)))
    const csv = '﻿' + lines.join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `reportes-${empresa.toLowerCase().replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const difChip = (dif: number | null) => {
    if (dif == null) return <span style={{ color: 'var(--c-text5)', fontSize: 12.5 }}>—</span>
    if (dif === 0) return <span style={{ color: '#22c55e', fontSize: 12.5, fontWeight: 600 }}>Cuadró</span>
    const falta = dif < 0
    return <span style={{ color: falta ? '#ef4444' : '#f59e0b', fontSize: 12.5, fontWeight: 600 }}>{falta ? 'Falta ' : 'Sobra '}{fmt(Math.abs(dif))}</span>
  }

  const maxMes = Math.max(...porMes.map(m => m.monto), 1)
  const maxHora = Math.max(...porHora, 1)

  return (
    <div className="px-7 pb-7 pt-5">
      <PageHeader crumb="Reportes" title="Reportes" subtitle="Control de empleados, caja y analítica del negocio" />

      {/* Tabs + exportar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          {([['turnos', 'Turnos y caja'], ['analitica', 'Analítica']] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-1.5 rounded-full transition-colors"
              style={{ background: tab === id ? 'var(--c-text)' : 'var(--c-surface2)', color: tab === id ? 'var(--c-bg)' : 'var(--c-text3)', border: '1px solid var(--c-border2)', fontSize: 13, fontWeight: 500 }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={exportar}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors shrink-0"
          style={{ background: 'var(--c-surface2)', border: '1px solid var(--c-border3)', color: 'var(--c-text2)', fontSize: 13 }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-border)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-surface2)')}
        >
          <FileSpreadsheet size={15} /> Exportar a Excel
        </button>
      </div>

      {tab === 'turnos' && (
        <div className="flex flex-col gap-5">
          {/* Ranking por empleado */}
          <div>
            <p style={{ color: 'var(--c-text4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 10 }}>RANKING POR EMPLEADO</p>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {ranking.length === 0 && <p style={{ color: 'var(--c-text5)', fontSize: 13 }}>Aún no hay turnos cerrados.</p>}
              {ranking.map((r, i) => (
                <div key={r.operario} className="rounded-xl p-4" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex items-center justify-center shrink-0" style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--c-surface3)', border: '1px solid var(--c-border3)', color: 'var(--c-text2)', fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                    <span className="text-white truncate" style={{ fontSize: 13.5, fontWeight: 600 }}>{r.operario}</span>
                  </div>
                  <p className="text-white" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{fmt(r.recaudado)}</p>
                  <div className="flex items-center justify-between mt-2" style={{ fontSize: 12 }}>
                    <span style={{ color: 'var(--c-text4)' }}>{r.turnos} turno{r.turnos !== 1 ? 's' : ''} · {r.cuadrados} cuadr.</span>
                    <span style={{ color: r.descuadre === 0 ? '#22c55e' : r.descuadre < 0 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                      {r.descuadre === 0 ? 'OK' : (r.descuadre < 0 ? '−' : '+') + fmt(Math.abs(r.descuadre)).replace('$', '$')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de turnos */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ color: 'var(--c-text5)', fontSize: 11.5, background: 'var(--c-panel)' }}>
                  <th className="text-left font-medium px-5 py-3">Operario</th>
                  <th className="text-left font-medium px-5 py-3">Fecha</th>
                  <th className="text-right font-medium px-5 py-3">Base</th>
                  <th className="text-right font-medium px-5 py-3">Recaudado</th>
                  <th className="text-right font-medium px-5 py-3">Esperado</th>
                  <th className="text-right font-medium px-5 py-3">Contado</th>
                  <th className="text-right font-medium px-5 py-3">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {turnos.length === 0 && (
                  <tr className="border-t" style={{ borderColor: 'var(--c-surface3)' }}>
                    <td colSpan={7} className="px-5 py-8 text-center" style={{ color: 'var(--c-text5)', fontSize: 13 }}>No hay turnos cerrados todavía.</td>
                  </tr>
                )}
                {turnos.map(t => (
                  <tr key={t.id} className="border-t" style={{ borderColor: 'var(--c-surface3)' }}>
                    <td className="px-5 py-3 text-white" style={{ fontSize: 13 }}>{t.operario}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--c-text3)', fontSize: 13 }}>{t.fecha}</td>
                    <td className="px-5 py-3 text-right" style={{ color: 'var(--c-text3)', fontSize: 13 }}>{fmt(t.base)}</td>
                    <td className="px-5 py-3 text-right text-white" style={{ fontSize: 13 }}>{fmt(t.recaudado)}</td>
                    <td className="px-5 py-3 text-right" style={{ color: 'var(--c-text3)', fontSize: 13 }}>{fmt(t.esperado)}</td>
                    <td className="px-5 py-3 text-right text-white" style={{ fontSize: 13 }}>{t.contado != null ? fmt(t.contado) : '—'}</td>
                    <td className="px-5 py-3 text-right">{difChip(t.dif)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'analitica' && (
        <div className="flex flex-col gap-5">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: TrendingUp, label: 'Ingresos · 6 meses', value: fmt(stats.totalIngresos) },
              { icon: Car, label: 'Vehículos atendidos', value: stats.vehiculos.toLocaleString('es-CO') },
              { icon: Receipt, label: 'Ticket promedio', value: fmt(stats.ticketProm) },
              { icon: Clock, label: 'Hora pico', value: `${String(horaPico).padStart(2, '0')}:00` },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <div className="flex items-center gap-2 mb-2.5" style={{ color: 'var(--c-text4)' }}>
                  <s.icon size={14} />
                  <span style={{ fontSize: 12 }}>{s.label}</span>
                </div>
                <p className="text-white" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ingresos por categoría */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <p className="text-white" style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Ingresos por categoría</p>
              <div className="flex flex-col gap-3.5">
                {porCategoria.length === 0 && <p style={{ color: 'var(--c-text5)', fontSize: 13 }}>Sin datos.</p>}
                {porCategoria.map(c => (
                  <div key={c.nombre}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white" style={{ fontSize: 13 }}>{c.nombre}</span>
                      <span style={{ color: 'var(--c-text2)', fontSize: 13 }}>{fmt(c.monto)} <span style={{ color: 'var(--c-text5)' }}>· {c.pct}%</span></span>
                    </div>
                    <div className="w-full rounded-full" style={{ height: 6, background: 'var(--c-surface3)' }}>
                      <div className="rounded-full" style={{ height: 6, width: `${c.pct}%`, background: 'var(--c-text2)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ingresos por mes */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <p className="text-white" style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Ingresos por mes</p>
              <div className="flex items-end justify-between gap-2" style={{ height: 150 }}>
                {porMes.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2" style={{ height: '100%' }}>
                    <span style={{ color: 'var(--c-text4)', fontSize: 10.5 }}>{m.monto > 0 ? '$' + Math.round(m.monto / 1000) + 'k' : ''}</span>
                    <div className="w-full rounded-t-md" style={{ height: `${(m.monto / maxMes) * 100}%`, minHeight: m.monto > 0 ? 4 : 0, background: i === porMes.length - 1 ? 'var(--c-text)' : 'var(--c-border3)' }} />
                    <span style={{ color: 'var(--c-text5)', fontSize: 11 }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Entradas por hora */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white" style={{ fontSize: 14, fontWeight: 600 }}>Entradas por hora del día</p>
              <span style={{ color: 'var(--c-text4)', fontSize: 12 }}>Pico: {String(horaPico).padStart(2, '0')}:00</span>
            </div>
            <div className="flex items-end gap-1" style={{ height: 90 }}>
              {porHora.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: '100%' }} title={`${String(i).padStart(2, '0')}:00 · ${h}`}>
                  <div className="w-full rounded-sm" style={{ height: `${(h / maxHora) * 100}%`, minHeight: h > 0 ? 3 : 0, background: i === horaPico ? '#f59e0b' : 'var(--c-border3)' }} />
                  {i % 3 === 0 && <span style={{ color: 'var(--c-text5)', fontSize: 9 }}>{i}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
