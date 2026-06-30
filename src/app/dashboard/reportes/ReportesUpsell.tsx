import Link from 'next/link'
import { PieChart, Users, BarChart3, FileSpreadsheet } from 'lucide-react'

const puntos = [
  { icon: Users, t: 'Control de empleados y caja', d: 'Cuánto recaudó cada turno y si la caja cuadró.' },
  { icon: BarChart3, t: 'Analítica del negocio', d: 'Horas pico, ingresos por categoría y comparativas.' },
  { icon: FileSpreadsheet, t: 'Exportar a Excel', d: 'Lleva tus reportes a Excel con un clic.' },
]

export default function ReportesUpsell() {
  return (
    <div className="px-7 pb-7 pt-5">
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <div className="inline-flex items-center justify-center mb-6" style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--c-surface3)', border: '1px solid var(--c-border3)' }}>
          <PieChart size={26} color="var(--c-text2)" />
        </div>
        <div className="inline-block px-2.5 py-1 rounded-full mb-4" style={{ background: 'color-mix(in srgb, #f59e0b 16%, transparent)', color: '#f59e0b', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em' }}>
          PLAN NEGOCIO
        </div>
        <h1 className="text-white font-bold" style={{ fontSize: 26, letterSpacing: '-0.01em' }}>Reportes y control</h1>
        <p style={{ color: 'var(--c-text3)', fontSize: 15, marginTop: 10, lineHeight: 1.6, maxWidth: 460, margin: '10px auto 0' }}>
          Mira el rendimiento de cada empleado, controla los descuadres de caja y entiende tu negocio a fondo. Disponible en el plan Negocio.
        </p>

        <div className="flex flex-col gap-2.5 mt-8 mb-9 text-left max-w-md mx-auto">
          {puntos.map(p => (
            <div key={p.t} className="flex items-start gap-3.5 rounded-xl px-4 py-3.5" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
              <div className="flex items-center justify-center shrink-0 mt-0.5" style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--c-surface3)', border: '1px solid var(--c-border3)' }}>
                <p.icon size={16} color="var(--c-text2)" />
              </div>
              <div>
                <p className="text-white" style={{ fontSize: 13.5, fontWeight: 600 }}>{p.t}</p>
                <p style={{ color: 'var(--c-text4)', fontSize: 12.5, marginTop: 1 }}>{p.d}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/planes?from=app"
          className="inline-block rounded-full font-semibold transition-transform hover:scale-[1.02]"
          style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)', fontSize: 14, padding: '12px 28px' }}
        >
          Mejorar a Negocio
        </Link>
      </div>
    </div>
  )
}
