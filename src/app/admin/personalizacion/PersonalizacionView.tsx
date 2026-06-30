'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/PageHeader'
import { Check, Link as LinkIcon } from 'lucide-react'
import { setLoginBg } from '@/app/admin-actions'

const presets = [
  { id: 'azul', label: 'Azul', css: 'radial-gradient(circle at 30% 20%, #1e4ba0 0%, transparent 50%), radial-gradient(circle at 70% 80%, #0a2050 0%, transparent 55%), linear-gradient(135deg, #0a1830 0%, #0d2655 100%)' },
  { id: 'morado', label: 'Morado', css: 'radial-gradient(circle at 30% 20%, #6d28d9 0%, transparent 55%), linear-gradient(135deg, #1a0a2e 0%, #2e1065 100%)' },
  { id: 'verde', label: 'Esmeralda', css: 'radial-gradient(circle at 30% 20%, #047857 0%, transparent 55%), linear-gradient(135deg, #0a1f17 0%, #064e3b 100%)' },
  { id: 'naranja', label: 'Atardecer', css: 'radial-gradient(circle at 30% 20%, #ea580c 0%, transparent 55%), linear-gradient(135deg, #1f0a05 0%, #7c2d12 100%)' },
  { id: 'rosa', label: 'Magenta', css: 'radial-gradient(circle at 30% 20%, #be185d 0%, transparent 55%), linear-gradient(135deg, #1f0512 0%, #831843 100%)' },
  { id: 'negro', label: 'Negro', css: 'linear-gradient(135deg, #0a0a0a 0%, #1c1c1c 100%)' },
]

const urlToCss = (url: string) => `url('${url.trim()}') center / cover no-repeat`
const isUrl = (v: string) => v.includes('url(')

export default function PersonalizacionView({ inicial }: { inicial: string | null }) {
  const router = useRouter()
  const [value, setValue] = useState(inicial ?? presets[0].css)
  const [url, setUrl] = useState(inicial && isUrl(inicial) ? inicial.replace(/^url\('|'\).*$/g, '') : '')
  const [saving, start] = useTransition()
  const [ok, setOk] = useState(false)

  const guardar = () => {
    setOk(false)
    start(async () => {
      await setLoginBg(value)
      router.refresh()
      setOk(true)
      setTimeout(() => setOk(false), 2500)
    })
  }

  return (
    <div className="px-8 pb-8 pt-7">
      <PageHeader crumb="Personalización" title="Personalización" subtitle="Elige el fondo del login que ven los parqueaderos" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Opciones */}
        <div className="flex flex-col gap-5">
          <div>
            <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>FONDOS</p>
            <div className="grid grid-cols-3 gap-3">
              {presets.map(p => {
                const on = value === p.css
                return (
                  <button key={p.id} onClick={() => setValue(p.css)} className="rounded-xl overflow-hidden relative" style={{ height: 80, background: p.css, border: on ? '2px solid #8b5cf6' : '1px solid #232323' }}>
                    {on && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#8b5cf6' }}>
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </span>
                    )}
                    <span className="absolute bottom-1.5 left-2 text-white" style={{ fontSize: '11px', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{p.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>O UNA IMAGEN (URL)</p>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1 px-3 rounded-lg" style={{ background: '#0f0f0f', border: '1px solid #232323' }}>
                <LinkIcon size={15} color="#555" />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://...imagen.jpg"
                  className="bg-transparent outline-none flex-1 text-white py-2.5"
                  style={{ fontSize: '13px' }}
                />
              </div>
              <button onClick={() => url.trim() && setValue(urlToCss(url))} className="px-4 rounded-lg" style={{ background: '#161616', border: '1px solid #232323', color: '#ccc', fontSize: '13px' }}>
                Usar
              </button>
            </div>
            <p style={{ color: '#555', fontSize: '12px', marginTop: '8px' }}>Pega el enlace de una imagen (ej. de Pinterest, Unsplash) y dale “Usar”.</p>
          </div>

          <div className="flex items-center gap-3">
            {ok && <span style={{ color: '#22c55e', fontSize: '13px' }}>Guardado ✓</span>}
            <button onClick={guardar} disabled={saving} className="px-5 py-2.5 rounded-full text-white font-semibold" style={{ background: '#8b5cf6', fontSize: '13px', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar fondo'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <p style={{ color: '#666', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '10px' }}>VISTA PREVIA DEL LOGIN</p>
          <div className="rounded-2xl overflow-hidden flex" style={{ height: 280, border: '1px solid #1e1e1e' }}>
            <div className="w-1/2 flex flex-col justify-center px-6" style={{ background: '#0a0a0a' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" width={20} height={20} className="mb-4" />
              <p className="text-white font-bold" style={{ fontSize: '18px' }}>Bienvenido</p>
              <div className="mt-3 h-8 rounded-md" style={{ background: '#161616', border: '1px solid #222' }} />
              <div className="mt-2 h-8 rounded-md" style={{ background: '#161616', border: '1px solid #222' }} />
              <div className="mt-3 h-8 rounded-full" style={{ background: '#fff' }} />
            </div>
            <div className="w-1/2" style={{ background: value }} />
          </div>
        </div>
      </div>
    </div>
  )
}
