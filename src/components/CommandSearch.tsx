'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Car, LogOut, LogIn, User, CreditCard, CornerDownLeft } from 'lucide-react'
import { buscarGlobal } from '@/app/actions'

type Vehiculo = { id: string; placa: string; tipoNombre: string; icono: string; entradaAt: string | Date }
type Cliente = { id: string; nombre: string; telefono: string | null }
type Suscripcion = { id: string; placa: string; plan: string; status: string }
type Resultados = { vehiculos: Vehiculo[]; clientes: Cliente[]; suscripciones: Suscripcion[] }

type Item = { key: string; label: string; sub?: string; icon: React.ElementType; group: string; run: () => void }

const vacio: Resultados = { vehiculos: [], clientes: [], suscripciones: [] }

export default function CommandSearch({ role }: { role?: string }) {
  const router = useRouter()
  const esEmpleado = role === 'EMPLEADO'
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<Resultados>(vacio)
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Abrir con ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 40)
    else { setQ(''); setRes(vacio); setSel(0) }
  }, [open])

  // Búsqueda con debounce
  useEffect(() => {
    if (!open) return
    if (!q.trim()) { setRes(vacio); return }
    const t = setTimeout(async () => {
      try { setRes(await buscarGlobal(q)) } catch { setRes(vacio) }
    }, 160)
    return () => clearTimeout(t)
  }, [q, open])

  const placa = q.trim().toUpperCase()
  const esPlacaLike = /^[A-Z0-9]{3,10}$/.test(placa)

  const cerrar = () => setOpen(false)
  const emitir = (evento: string, detalle: unknown) => { window.dispatchEvent(new CustomEvent(evento, { detail: detalle })); cerrar() }

  // Construye la lista plana (para navegación con teclado)
  const items: Item[] = []
  for (const v of res.vehiculos) {
    items.push({
      key: 'v' + v.id, group: 'Vehículos adentro', icon: Car,
      label: v.placa, sub: `${v.tipoNombre} · dar salida`,
      run: () => emitir('parqueo:salida', { placa: v.placa }),
    })
  }
  for (const c of res.clientes) {
    items.push({
      key: 'c' + c.id, group: 'Clientes', icon: User,
      label: c.nombre, sub: c.telefono ?? 'cliente',
      run: () => { router.push('/dashboard/clientes'); cerrar() },
    })
  }
  for (const s of res.suscripciones) {
    items.push({
      key: 's' + s.id, group: 'Suscripciones', icon: CreditCard,
      label: s.placa, sub: `${s.plan.toLowerCase()} · ${s.status.toLowerCase()}`,
      run: () => { router.push('/dashboard/suscripciones'); cerrar() },
    })
  }
  // Acciones rápidas a partir de la placa escrita
  if (esPlacaLike) {
    items.push({
      key: 'act-entrada', group: 'Acciones', icon: LogIn,
      label: `Registrar entrada con ${placa}`, sub: 'abre el registro de entrada',
      run: () => emitir('parqueo:entrada', { placa }),
    })
    const hayVehiculo = res.vehiculos.some(v => v.placa === placa)
    if (hayVehiculo) {
      items.push({
        key: 'act-salida', group: 'Acciones', icon: LogOut,
        label: `Dar salida a ${placa}`, sub: 'calcula el cobro',
        run: () => emitir('parqueo:salida', { placa }),
      })
    }
    if (!esEmpleado) {
      items.push({
        key: 'act-susc', group: 'Acciones', icon: CreditCard,
        label: `Crear suscripción con ${placa}`, sub: 'mensualidad para esta placa',
        run: () => { router.push('/dashboard/suscripciones'); cerrar() },
      })
    }
  }

  useEffect(() => { setSel(0) }, [q])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); items[sel]?.run() }
    else if (e.key === 'Escape') { e.preventDefault(); cerrar() }
  }, [items, sel])

  // Agrupa para render manteniendo el índice plano
  let idx = -1
  const grupos = ['Vehículos adentro', 'Clientes', 'Suscripciones', 'Acciones'].filter(g => items.some(i => i.group === g))

  return (
    <>
      {/* Trigger en el header */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full transition-colors"
        style={{ background: 'var(--c-surface2)', border: '1px solid var(--c-border2)', color: 'var(--c-text3)', fontSize: '13px', padding: '8px 12px', minWidth: 180 }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-surface2)')}
      >
        <Search size={15} />
        <span style={{ flex: 1, textAlign: 'left' }}>Buscar</span>
        <kbd style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border3)', borderRadius: 6, padding: '1px 6px', fontSize: 11, color: 'var(--c-text4)' }}>⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-start justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', paddingTop: '12vh' }}
          onClick={cerrar}
        >
          <div
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border3)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'pop-in 160ms cubic-bezier(0.16,1,0.3,1)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4" style={{ borderBottom: '1px solid var(--c-border)', height: 56 }}>
              <Search size={18} color="var(--c-text4)" />
              <input
                ref={inputRef}
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Buscar placa, cliente o suscripción…"
                className="flex-1 bg-transparent outline-none text-white"
                style={{ fontSize: 15 }}
              />
              <kbd style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border3)', borderRadius: 6, padding: '2px 7px', fontSize: 11, color: 'var(--c-text4)' }}>Esc</kbd>
            </div>

            {/* Resultados */}
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
              {!q.trim() ? (
                <p className="text-center" style={{ color: 'var(--c-text5)', fontSize: 13, padding: '28px 0' }}>
                  Escribe una placa{esEmpleado ? '' : ', nombre de cliente'} para empezar
                </p>
              ) : items.length === 0 ? (
                <p className="text-center" style={{ color: 'var(--c-text5)', fontSize: 13, padding: '28px 0' }}>Sin resultados para “{q.trim()}”</p>
              ) : (
                grupos.map(g => (
                  <div key={g} className="mb-1">
                    <p style={{ color: 'var(--c-text5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', padding: '8px 10px 4px', textTransform: 'uppercase' }}>{g}</p>
                    {items.filter(i => i.group === g).map(item => {
                      idx++
                      const activo = idx === sel
                      const myIdx = idx
                      return (
                        <button
                          key={item.key}
                          onClick={item.run}
                          onMouseMove={() => setSel(myIdx)}
                          className="w-full flex items-center gap-3 rounded-lg text-left"
                          style={{ background: activo ? 'var(--c-border)' : 'transparent', padding: '9px 10px' }}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--c-panel)', border: '1px solid var(--c-border2)', color: activo ? 'var(--c-text)' : 'var(--c-text3)' }}>
                            <item.icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-mono" style={{ fontSize: 13.5, letterSpacing: '0.03em' }}>{item.label}</p>
                            {item.sub && <p style={{ color: 'var(--c-text4)', fontSize: 12 }}>{item.sub}</p>}
                          </div>
                          {activo && <CornerDownLeft size={14} color="var(--c-text4)" />}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
