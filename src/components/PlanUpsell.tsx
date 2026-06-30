import Link from 'next/link'
import { Lock, type LucideIcon } from 'lucide-react'

const PLAN = {
  PRO: { color: '#a855f7', label: 'PLAN PRO', cta: 'Mejorar a Pro' },
  NEGOCIO: { color: '#f59e0b', label: 'PLAN NEGOCIO', cta: 'Mejorar a Negocio' },
} as const

export default function PlanUpsell({
  modulo,
  descripcion,
  plan,
  icon: Icon = Lock,
  puntos,
}: {
  modulo: string
  descripcion: string
  plan: 'PRO' | 'NEGOCIO'
  icon?: LucideIcon
  puntos?: { t: string; d: string }[]
}) {
  const p = PLAN[plan]
  return (
    <div className="px-7 pb-7 pt-5">
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <div className="inline-flex items-center justify-center mb-6" style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--c-surface3)', border: '1px solid var(--c-border3)' }}>
          <Icon size={26} color="var(--c-text2)" />
        </div>
        <div className="inline-block px-2.5 py-1 rounded-full mb-4" style={{ background: `color-mix(in srgb, ${p.color} 16%, transparent)`, color: p.color, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em' }}>
          {p.label}
        </div>
        <h1 className="text-white font-bold" style={{ fontSize: 26, letterSpacing: '-0.01em' }}>{modulo}</h1>
        <p style={{ color: 'var(--c-text3)', fontSize: 15, lineHeight: 1.6, maxWidth: 460, margin: '10px auto 0' }}>
          {descripcion}
        </p>

        {puntos && puntos.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-8 text-left max-w-md mx-auto">
            {puntos.map(pt => (
              <div key={pt.t} className="flex items-start gap-3.5 rounded-xl px-4 py-3.5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                <span className="shrink-0 mt-1.5" style={{ width: 6, height: 6, borderRadius: 9999, background: p.color }} />
                <div>
                  <p className="text-white" style={{ fontSize: 13.5, fontWeight: 600 }}>{pt.t}</p>
                  <p style={{ color: 'var(--c-text4)', fontSize: 12.5, marginTop: 1 }}>{pt.d}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/planes?from=app"
          className="inline-block rounded-full font-semibold transition-transform hover:scale-[1.02] mt-9"
          style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)', fontSize: 14, padding: '12px 28px' }}
        >
          {p.cta}
        </Link>
      </div>
    </div>
  )
}
