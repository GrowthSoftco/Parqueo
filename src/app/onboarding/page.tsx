'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { guardarOnboarding } from '@/app/actions'
import {
  ArrowLeft,
  Check,
  Building2,
  Store,
  Warehouse,
  Car,
  Bike,
  Motorbike,
} from 'lucide-react'

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [, start] = useTransition()

  // step 1
  const [tipo, setTipo] = useState<string | null>(null)
  // step 2
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  // step 3
  const [vehiculos, setVehiculos] = useState<string[]>(['carro'])
  // step 4
  const [espacios, setEspacios] = useState('')

  const next = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      return
    }
    start(async () => {
      await guardarOnboarding({ nombre, espacios: parseInt(espacios) || 50 })
      router.push('/dashboard')
      router.refresh()
    })
  }
  const back = () => {
    if (step > 1) setStep(step - 1)
    else router.push('/login')
  }

  const toggleVehiculo = (v: string) => {
    setVehiculos(prev => (prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]))
  }

  const canContinue =
    (step === 1 && tipo) ||
    (step === 2 && nombre.trim()) ||
    (step === 3 && vehiculos.length > 0) ||
    (step === 4 && espacios.trim())

  return (
    <div className="flex flex-col h-screen w-full" style={{ background: 'var(--c-bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-10 pb-6">
        <button
          onClick={back}
          className="flex items-center gap-2 transition-colors"
          style={{ color: 'var(--c-text3)', fontSize: '14px' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--c-text3)')}
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--c-text3)', fontSize: '14px' }}>Paso {step}/{TOTAL_STEPS}</span>
          <div className="relative w-6 h-6">
            <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="var(--c-border2)" strokeWidth="2.5" />
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="var(--c-text)"
                strokeWidth="2.5"
                strokeDasharray={`${(step / TOTAL_STEPS) * 62.8} 62.8`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Content centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          {/* STEP 1 - tipo */}
          {step === 1 && (
            <Step
              title="Cuéntanos sobre tu negocio"
              subtitle="¿Qué tipo de parqueadero administras?"
            >
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'barrio', label: 'De barrio', desc: 'Pequeño, residencial', icon: Store, color: '#4ade80' },
                  { id: 'comercial', label: 'Comercial', desc: 'Zona de oficinas o centro', icon: Building2, color: '#60a5fa' },
                  { id: 'grande', label: 'Cubierto grande', desc: 'Alta rotación', icon: Warehouse, color: '#a78bfa' },
                ].map(opt => (
                  <SelectCard
                    key={opt.id}
                    selected={tipo === opt.id}
                    onClick={() => setTipo(opt.id)}
                    icon={opt.icon}
                    label={opt.label}
                    desc={opt.desc}
                    color={opt.color}
                  />
                ))}
              </div>
            </Step>
          )}

          {/* STEP 2 - datos */}
          {step === 2 && (
            <Step title="Datos del parqueadero" subtitle="Esto aparecerá en tus tiquetes y reportes">
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <Field label="Nombre del parqueadero">
                  <input
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Ej. Parqueadero El Centro"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Dirección (opcional)">
                  <input
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    placeholder="Ej. Calle 10 #5-20"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </Step>
          )}

          {/* STEP 3 - vehiculos */}
          {step === 3 && (
            <Step title="¿Qué vehículos recibes?" subtitle="Selecciona todos los que apliquen">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'carro', label: 'Carros', desc: 'Automóviles y camionetas', icon: Car, color: '#60a5fa' },
                  { id: 'moto', label: 'Motos', desc: 'Motocicletas', icon: Motorbike, color: '#a78bfa' },
                  { id: 'bici', label: 'Bicicletas', desc: 'Bicis y patinetas', icon: Bike, color: '#4ade80' },
                ].map(opt => (
                  <SelectCard
                    key={opt.id}
                    selected={vehiculos.includes(opt.id)}
                    onClick={() => toggleVehiculo(opt.id)}
                    icon={opt.icon}
                    label={opt.label}
                    desc={opt.desc}
                    color={opt.color}
                  />
                ))}
              </div>
            </Step>
          )}

          {/* STEP 4 - capacidad */}
          {step === 4 && (
            <Step title="¿Cuántos espacios tienes?" subtitle="Lo puedes ajustar después en cualquier momento">
              <div className="max-w-xs mx-auto">
                <Field label="Capacidad total">
                  <input
                    value={espacios}
                    onChange={e => setEspacios(e.target.value.replace(/\D/g, ''))}
                    placeholder="50"
                    inputMode="numeric"
                    style={{ ...inputStyle, textAlign: 'center', fontSize: '24px', fontWeight: 600 }}
                  />
                </Field>
                <p style={{ color: 'var(--c-text5)', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
                  espacios disponibles
                </p>
              </div>
            </Step>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div className="flex justify-center pb-12">
        <button
          onClick={next}
          disabled={!canContinue}
          className="px-12 py-3 rounded-full font-semibold transition-opacity"
          style={{
            background: 'var(--c-accent)',
            color: 'var(--c-on-accent)',
            fontSize: '15px',
            opacity: canContinue ? 1 : 0.3,
            cursor: canContinue ? 'pointer' : 'not-allowed',
          }}
        >
          {step === TOTAL_STEPS ? 'Finalizar' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid var(--c-border2)',
  borderRadius: '10px',
  color: 'var(--c-text)',
  padding: '12px 16px',
  fontSize: '15px',
  outline: 'none',
  width: '100%',
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className="text-white text-center font-bold mb-2" style={{ fontSize: '30px' }}>
        {title}
      </h1>
      <p className="text-center mb-10" style={{ color: 'var(--c-text3)', fontSize: '15px' }}>
        {subtitle}
      </p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label style={{ color: 'var(--c-text3)', fontSize: '13px' }}>{label}</label>
      {children}
    </div>
  )
}

function SelectCard({
  selected,
  onClick,
  icon: Icon,
  label,
  desc,
  color = '#818cf8',
}: {
  selected: boolean
  onClick: () => void
  icon: typeof Car
  label: string
  desc?: string
  color?: string
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl transition-all flex flex-col justify-between"
      style={{
        background: 'var(--c-surface)',
        border: selected ? '1.5px dashed #6366f1' : '1.5px solid transparent',
        padding: '18px',
        minHeight: '150px',
      }}
    >
      <div className="flex items-start justify-between">
        <Icon size={28} color={color} strokeWidth={2} />
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{
            background: selected ? 'var(--c-text)' : 'var(--c-border3)',
          }}
        >
          {selected && <Check size={12} color="#000" strokeWidth={3} />}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>{label}</p>
        {desc && (
          <p style={{ color: 'var(--c-text4)', fontSize: '13px', marginTop: '4px', lineHeight: 1.4 }}>{desc}</p>
        )}
      </div>
    </button>
  )
}
