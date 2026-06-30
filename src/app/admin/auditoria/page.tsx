import PageHeader from '@/components/PageHeader'
import { prisma } from '@/lib/prisma'
import { ScrollText } from 'lucide-react'

export const dynamic = 'force-dynamic'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const fmt = (d: Date) => `${d.getDate()} ${MESES[d.getMonth()]} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export default async function AdminAuditoria() {
  const eventos = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })

  return (
    <div className="px-8 pb-8 pt-7">
      <PageHeader crumb="Auditoría" title="Auditoría" subtitle="Registro de todas las acciones de operador" />

      <div className="rounded-2xl p-6 max-w-3xl" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        {eventos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <ScrollText size={28} color="#444" />
            <p style={{ color: '#666', fontSize: '13px' }}>Aún no hay acciones registradas.</p>
            <p style={{ color: '#444', fontSize: '12px' }}>Se registrarán aquí cuando otorgues suscripciones, banees cuentas, etc.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {eventos.map((e, i) => {
              const last = i === eventos.length - 1
              return (
                <div key={e.id} className="flex items-stretch gap-4">
                  <div className="relative w-8 shrink-0 flex justify-center">
                    {!last && <div className="absolute w-px" style={{ background: '#262626', left: '50%', top: '34px', bottom: 0 }} />}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center z-10 mt-2" style={{ background: '#1c1c1c', border: '1px solid #2a2a2a' }}>
                      <ScrollText size={13} color="#8b5cf6" />
                    </div>
                  </div>
                  <div className="flex-1 flex items-start justify-between py-2.5">
                    <div>
                      <p className="text-white" style={{ fontSize: '13.5px', fontWeight: 500 }}>{e.accion}</p>
                      {e.detalle && <p style={{ color: '#777', fontSize: '12px', marginTop: '1px' }}>{e.detalle}</p>}
                      <p style={{ color: '#555', fontSize: '11px', marginTop: '3px' }}>por {e.actor}</p>
                    </div>
                    <span style={{ color: '#555', fontSize: '12px', whiteSpace: 'nowrap' }}>{fmt(e.createdAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
