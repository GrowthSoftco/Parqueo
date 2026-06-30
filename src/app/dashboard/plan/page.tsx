import PageHeader from '@/components/PageHeader'
import { prisma } from '@/lib/prisma'
import { getCurrentTenant } from '@/lib/tenant'
import { requireOwner } from '@/lib/guard'
import { Check, Download, FileText } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const fecha = (d: Date) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })

const PLANES: Record<string, { nombre: string; precio: number; incluye: string[] }> = {
  BASICO: {
    nombre: 'Básico',
    precio: 49900,
    incluye: ['Cobro a tus clientes en efectivo', 'Entradas y salidas ilimitadas', 'Caja y cierre de turnos', 'Reportes en PDF y Excel'],
  },
  PRO: {
    nombre: 'Pro',
    precio: 99900,
    incluye: ['Todo lo del plan Básico', 'Cóbrale a tus clientes con Nequi y Daviplata', 'Mensualidades de clientes', 'Personalización del recibo'],
  },
  NEGOCIO: {
    nombre: 'Negocio',
    precio: 179900,
    incluye: ['Todo lo del plan Pro', 'Cóbrale a tus clientes con tarjeta', 'Facturación electrónica DIAN (pronto)', 'Soporte prioritario'],
  },
}

const ESTADO: Record<string, { label: string; color: string; bg: string }> = {
  TRIAL: { label: 'En prueba', color: '#3b82f6', bg: '#0f1d2e' },
  ACTIVE: { label: 'Activo', color: '#22c55e', bg: '#0f2a1a' },
  PAST_DUE: { label: 'Pago pendiente', color: '#f59e0b', bg: '#2a210d' },
  CANCELED: { label: 'Cancelado', color: '#888', bg: '#1a1a1a' },
}

const PAGO_ESTADO: Record<string, { label: string; color: string; bg: string }> = {
  PAGADO: { label: 'Pagado', color: '#22c55e', bg: '#0f2a1a' },
  PENDIENTE: { label: 'Pendiente', color: '#f59e0b', bg: '#2a210d' },
  FALLIDO: { label: 'Fallido', color: '#ef4444', bg: '#2a0f0f' },
}

export default async function PlanPage() {
  await requireOwner()
  const tenant = await getCurrentTenant()
  const [sub, pagos] = await Promise.all([
    prisma.subscription.findUnique({ where: { tenantId: tenant.id } }),
    prisma.payment.findMany({ where: { tenantId: tenant.id }, orderBy: { paidAt: 'desc' }, take: 50 }),
  ])

  const planKey = sub?.plan ?? null
  const planInfo = planKey ? PLANES[planKey] : null
  const estado = ESTADO[sub?.status ?? 'TRIAL'] ?? ESTADO.TRIAL

  const trialEnds = sub?.trialEndsAt
  const periodEnd = sub?.periodEnd
  const diasPrueba = trialEnds ? Math.ceil((trialEnds.getTime() - Date.now()) / 86400000) : null

  return (
    <div className="px-7 pb-7 pt-4">
      <PageHeader crumb="Mi plan" title="Mi plan" subtitle="Tu suscripción a Parqueo y tus facturas de pago" />

      {/* Tarjeta del plan */}
      <div className="rounded-2xl mb-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <div className="flex items-start justify-between gap-4 p-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-white" style={{ fontSize: '17px', fontWeight: 600 }}>{planInfo ? `Plan ${planInfo.nombre}` : 'Sin plan'}</span>
              <span className="flex items-center gap-1.5" style={{ color: estado.color, fontSize: '12px', fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: 9999, background: estado.color }} />
                {estado.label}
              </span>
            </div>

            {planInfo && (
              <div className="flex items-baseline gap-1.5 mt-3">
                <span className="text-white font-bold" style={{ fontSize: '32px', letterSpacing: '-0.01em' }}>{fmt(planInfo.precio)}</span>
                <span style={{ color: '#666', fontSize: '13px' }}>/mes</span>
              </div>
            )}

            <p style={{ color: '#777', fontSize: '13px', marginTop: 8 }}>
              {sub?.status === 'TRIAL' && diasPrueba != null
                ? `Te quedan ${Math.max(0, diasPrueba)} días de prueba gratis`
                : periodEnd
                  ? `Se renueva el ${fecha(periodEnd)}`
                  : 'Suscripción mensual'}
            </p>
          </div>

          <Link
            href="/planes?from=app"
            className="px-4 py-2.5 rounded-full text-black font-semibold shrink-0"
            style={{ background: '#fff', fontSize: '13px' }}
          >
            {planInfo ? 'Cambiar plan' : 'Elegir plan'}
          </Link>
        </div>

        {planInfo && (
          <div className="px-6 py-5" style={{ borderTop: '1px solid #1e1e1e' }}>
            <p style={{ color: '#666', fontSize: '12px', marginBottom: 12 }}>Incluido en tu plan</p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {planInfo.incluye.map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <Check size={14} color="#777" strokeWidth={2.4} />
                  <span style={{ color: '#bbb', fontSize: '13px' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Facturas */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e1e' }}>
          <div className="flex items-center gap-2">
            <FileText size={15} color="#888" />
            <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Facturas</p>
          </div>
          <span style={{ color: '#555', fontSize: '12px' }}>{pagos.length} en total</span>
        </div>

        {pagos.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#1a1a1a', border: '1px solid #262626' }}>
              <FileText size={18} color="#666" />
            </div>
            <p style={{ color: '#aaa', fontSize: '13.5px' }}>Todavía no tienes facturas</p>
            <p style={{ color: '#555', fontSize: '12.5px', marginTop: 4 }}>Aquí aparecerán tus pagos del plan cuando se generen.</p>
          </div>
        ) : (
          <div>
            <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto', color: '#555', fontSize: '12px', borderBottom: '1px solid #181818' }}>
              <span>Concepto</span><span>Fecha</span><span>Método</span><span>Estado</span><span className="text-right">Monto</span>
            </div>
            {pagos.map((p, i) => {
              const pe = PAGO_ESTADO[p.status] ?? PAGO_ESTADO.PAGADO
              return (
                <div key={p.id} className="grid items-center px-5 py-3.5" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto', borderBottom: i < pagos.length - 1 ? '1px solid #181818' : 'none' }}>
                  <span className="text-white" style={{ fontSize: '13px' }}>{p.concepto ?? 'Pago de plan'}</span>
                  <span style={{ color: '#888', fontSize: '12.5px' }}>{fecha(p.paidAt)}</span>
                  <span style={{ color: '#888', fontSize: '12.5px' }}>{p.metodo}</span>
                  <span><span className="px-2 py-0.5 rounded-md" style={{ background: pe.bg, color: pe.color, fontSize: '11px', fontWeight: 600 }}>{pe.label}</span></span>
                  <span className="text-white text-right flex items-center justify-end gap-3" style={{ fontSize: '13px', fontWeight: 600 }}>
                    {fmt(p.monto)}
                    <Download size={14} color="#555" />
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
