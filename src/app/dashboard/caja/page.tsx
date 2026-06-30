import PageHeader from '@/components/PageHeader'
import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { Clock, Lock } from 'lucide-react'
import CerrarTurnoButton from '@/components/CerrarTurnoButton'
import AbrirTurnoButton from '@/components/AbrirTurnoButton'

export const dynamic = 'force-dynamic'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export default async function CajaPage() {
  const tenant = await getCurrentTenant()
  const turnos = await prisma.shift.findMany({ where: { tenantId: tenant.id }, orderBy: { abiertoAt: 'desc' }, take: 10 })
  const actual = turnos.find(t => t.status === 'ABIERTO')

  const total = actual?.total ?? 0
  const base = actual?.base ?? 0

  return (
    <div className="px-7 pb-7 pt-5">
      <PageHeader
        crumb="Caja"
        title="Caja y arqueo"
        subtitle={actual ? `Turno abierto por ${actual.operario} desde las ${hhmm(actual.abiertoAt)}` : 'No hay un turno abierto'}
      />

      {actual ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: '#777', fontSize: '13px' }}>Total recaudado en el turno</p>
                <p className="text-white font-bold" style={{ fontSize: '32px', marginTop: '2px' }}>{fmt(total)}</p>
              </div>
              <CerrarTurnoButton esperado={base + total} base={base} ingresos={total} />
            </div>
          </div>

          <div className="rounded-2xl p-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <p className="text-white mb-4" style={{ fontSize: '14px', fontWeight: 600 }}>Resumen del turno</p>
            {[
              { l: 'Base inicial', v: fmt(base) },
              { l: 'Ingresos', v: fmt(total) },
              { l: 'Esperado en caja', v: fmt(base + total), bold: true },
            ].map(row => (
              <div key={row.l} className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: '#1c1c1c' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>{row.l}</span>
                <span className="text-white" style={{ fontSize: '13px', fontWeight: row.bold ? 700 : 500 }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-8 mb-4 flex flex-col items-center text-center" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: '#1a1a1a', border: '1px solid #262626' }}>
            <Lock size={20} color="#888" />
          </div>
          <p className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>No hay un turno abierto</p>
          <p style={{ color: '#777', fontSize: '13px', marginTop: 6, marginBottom: 18, maxWidth: 380, lineHeight: 1.5 }}>
            Para registrar entradas y salidas primero abre un turno e indica con cuánto efectivo arranca la caja.
          </p>
          <AbrirTurnoButton />
        </div>
      )}

      <div className="rounded-2xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: '#1e1e1e' }}>
          <Clock size={15} color="#666" />
          <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Turnos recientes</p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ color: '#555', fontSize: '12px' }}>
              <th className="text-left font-medium px-5 py-2.5">Operario</th>
              <th className="text-left font-medium px-5 py-2.5">Apertura</th>
              <th className="text-left font-medium px-5 py-2.5">Cierre</th>
              <th className="text-left font-medium px-5 py-2.5">Esperado</th>
              <th className="text-left font-medium px-5 py-2.5">Contado</th>
              <th className="text-left font-medium px-5 py-2.5">Diferencia</th>
              <th className="text-right font-medium px-5 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody>
            {turnos.length === 0 && (
              <tr className="border-t" style={{ borderColor: '#1a1a1a' }}>
                <td colSpan={7} className="px-5 py-8 text-center" style={{ color: '#555', fontSize: '13px' }}>Aún no hay turnos.</td>
              </tr>
            )}
            {turnos.map(t => {
              const esperado = t.base + t.total
              const dif = t.contado != null ? t.contado - esperado : null
              const difColor = dif == null ? '#555' : dif === 0 ? '#22c55e' : dif > 0 ? '#f59e0b' : '#ef4444'
              const difTxt = dif == null ? '—' : dif === 0 ? 'Cuadra' : `${dif > 0 ? '+' : '−'}${fmt(Math.abs(dif))}`
              return (
              <tr key={t.id} className="border-t" style={{ borderColor: '#1a1a1a' }}>
                <td className="px-5 py-3 text-white" style={{ fontSize: '13px' }}>{t.operario}</td>
                <td className="px-5 py-3" style={{ color: '#888', fontSize: '13px' }}>{hhmm(t.abiertoAt)}</td>
                <td className="px-5 py-3" style={{ color: '#888', fontSize: '13px' }}>{t.cerradoAt ? hhmm(t.cerradoAt) : '—'}</td>
                <td className="px-5 py-3 text-white" style={{ fontSize: '13px', fontWeight: 600 }}>{fmt(esperado)}</td>
                <td className="px-5 py-3" style={{ color: t.contado != null ? '#fff' : '#555', fontSize: '13px' }}>{t.contado != null ? fmt(t.contado) : '—'}</td>
                <td className="px-5 py-3" style={{ color: difColor, fontSize: '13px', fontWeight: 600 }}>{difTxt}</td>
                <td className="px-5 py-3 text-right">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={t.status === 'ABIERTO' ? { background: '#0f2a1a', color: '#22c55e', border: '1px solid #1a4a2a' } : { background: '#1a1a1a', color: '#888', border: '1px solid #262626' }}
                  >
                    {t.status === 'ABIERTO' ? 'Abierto' : 'Cerrado'}
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  )
}
