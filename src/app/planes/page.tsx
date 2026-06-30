'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { elegirPlan } from '@/app/actions'

const PLAN_ENUM: Record<string, 'BASICO' | 'PRO' | 'NEGOCIO'> = { basico: 'BASICO', pro: 'PRO', negocio: 'NEGOCIO' }

type Plan = {
  id: string
  nombre: string
  desc: string
  mensual: number
  anual: number
  recomendado?: boolean
  features: string[]
}

const planes: Plan[] = [
  {
    id: 'basico',
    nombre: 'Básico',
    desc: 'Para parqueaderos pequeños que están arrancando.',
    mensual: 49900,
    anual: 499000,
    features: [
      '1 sede · hasta 80 espacios',
      '2 usuarios',
      'Carro, moto y bici',
      'Caja por turno',
      'Suscripciones mensuales',
      'Impresión de tiquete',
      'Hasta 1.500 registros/mes',
    ],
  },
  {
    id: 'pro',
    nombre: 'Pro',
    desc: 'El más elegido. Sin límites y con contabilidad.',
    mensual: 99900,
    anual: 999000,
    recomendado: true,
    features: [
      'Todo lo del Básico, y además:',
      'Espacios y registros ilimitados',
      '5 usuarios',
      'Contabilidad y reportes',
      'Historial por placa',
      'Exportar a PDF',
      'Modo offline',
    ],
  },
  {
    id: 'negocio',
    nombre: 'Negocio',
    desc: 'Para varias sedes y facturación electrónica.',
    mensual: 179900,
    anual: 1799000,
    features: [
      'Todo lo del Pro, y además:',
      'Hasta 3 sedes',
      '10 usuarios',
      'Facturación electrónica DIAN',
      'Pagos Nequi / Daviplata',
      'Exportar a Excel',
      'Panel multi-sede',
    ],
  },
]

const fmt = (n: number) => '$' + n.toLocaleString('es-CO')
const ACCENT = '#3b82f6'

export default function PlanesPage() {
  const router = useRouter()
  const [anual, setAnual] = useState(false)
  const [fromApp, setFromApp] = useState(false)
  const [, start] = useTransition()

  // Si vienes desde la app (Cambiar plan) no es un registro nuevo
  useEffect(() => {
    setFromApp(new URLSearchParams(window.location.search).get('from') === 'app')
  }, [])

  const elegir = (id: string) =>
    start(async () => {
      await elegirPlan(PLAN_ENUM[id])
      router.push(fromApp ? '/dashboard/plan' : '/onboarding')
      router.refresh()
    })

  return (
    <div className="min-h-screen w-full flex flex-col items-center" style={{ background: 'var(--c-bg)' }}>
      {/* Top */}
      <div className="w-full flex items-center justify-between px-10 pt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Parqueo" width={26} height={26} />
        {fromApp ? (
          <a href="/dashboard/plan" style={{ color: 'var(--c-text3)', fontSize: '13px' }} className="hover:text-white transition-colors">
            ← Volver a Mi plan
          </a>
        ) : (
          <a href="/login" style={{ color: 'var(--c-text3)', fontSize: '13px' }} className="hover:text-white transition-colors">
            ¿Ya tienes cuenta? Inicia sesión
          </a>
        )}
      </div>

      {/* Header */}
      <div className="text-center mt-10 mb-8 px-6">
        <h1 className="text-white font-bold" style={{ fontSize: '32px' }}>Elige tu plan</h1>
        <p style={{ color: 'var(--c-text4)', fontSize: '15px', marginTop: '8px' }}>
          14 días de prueba gratis · sin tarjeta de crédito
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-3 mt-7">
          <div className="flex p-1 rounded-full" style={{ background: 'var(--c-surface2)', border: '1px solid var(--c-border2)' }}>
            {[
              { k: false, l: 'Mensual' },
              { k: true, l: 'Anual' },
            ].map(opt => (
              <button
                key={opt.l}
                onClick={() => setAnual(opt.k)}
                className="px-5 py-1.5 rounded-full transition-colors"
                style={{
                  background: anual === opt.k ? 'var(--c-text)' : 'transparent',
                  color: anual === opt.k ? 'var(--c-bg)' : 'var(--c-text3)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {opt.l}
              </button>
            ))}
          </div>
          <span
            className="px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', fontSize: '12px', fontWeight: 600 }}
          >
            2 meses gratis
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-6 pb-16 w-full" style={{ maxWidth: '1040px' }}>
        {planes.map(plan => {
          const rec = plan.recomendado
          return (
            <div
              key={plan.id}
              className="rounded-2xl p-6 flex flex-col relative"
              style={{
                background: rec ? 'var(--c-surface2)' : 'var(--c-panel)',
                border: rec ? `1.5px solid ${ACCENT}` : '1px solid var(--c-border)',
              }}
            >
              {rec && (
                <span
                  className="absolute -top-3 left-6 px-2.5 py-1 rounded-full"
                  style={{ background: ACCENT, color: 'var(--c-text)', fontSize: '11px', fontWeight: 700 }}
                >
                  Recomendado
                </span>
              )}

              <p className="text-white" style={{ fontSize: '17px', fontWeight: 700 }}>{plan.nombre}</p>
              <p style={{ color: 'var(--c-text4)', fontSize: '13px', marginTop: '4px', minHeight: '36px' }}>{plan.desc}</p>

              <div className="flex items-baseline gap-1.5 mt-4 mb-1">
                <span className="text-white font-bold" style={{ fontSize: '30px' }}>
                  {fmt(anual ? plan.anual : plan.mensual)}
                </span>
                <span style={{ color: 'var(--c-text4)', fontSize: '13px' }}>/{anual ? 'año' : 'mes'}</span>
              </div>
              <p style={{ color: 'var(--c-text5)', fontSize: '12px', minHeight: '18px' }}>
                {anual ? `Equivale a ${fmt(Math.round(plan.anual / 12))}/mes` : 'COP, facturado mensual'}
              </p>

              <button
                onClick={() => elegir(plan.id)}
                className="rounded-full py-2.5 mt-5 mb-6 transition-opacity hover:opacity-90"
                style={
                  rec
                    ? { background: 'var(--c-accent)', color: 'var(--c-on-accent)', fontSize: '14px', fontWeight: 600 }
                    : { background: 'var(--c-surface3)', border: '1px solid var(--c-border3)', color: 'var(--c-text)', fontSize: '14px', fontWeight: 600 }
                }
              >
                {fromApp ? 'Cambiar a este plan' : 'Empezar prueba gratis'}
              </button>

              <div className="flex flex-col gap-2.5">
                {plan.features.map((f, i) => {
                  const heading = f.endsWith(':')
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      {heading ? (
                        <span style={{ color: 'var(--c-text3)', fontSize: '12.5px', fontWeight: 600 }}>{f}</span>
                      ) : (
                        <>
                          <Check size={15} color={rec ? ACCENT : 'var(--c-text4)'} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                          <span style={{ color: 'var(--c-text2)', fontSize: '13px' }}>{f}</span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p style={{ color: 'var(--c-text5)', fontSize: '13px', paddingBottom: '40px' }}>
        ¿Necesitas más sedes o algo a la medida?{' '}
        <a href="#" style={{ color: 'var(--c-text)' }} className="hover:underline">Contáctanos</a>
      </p>
    </div>
  )
}
