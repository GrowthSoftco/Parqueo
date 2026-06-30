'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { Building2, Tag, LayoutGrid, FileText, User, Users, Minus, Plus, Check, Trash2, UserPlus, Lock } from 'lucide-react'
import { guardarConfig, actualizarPerfil, crearEmpleado, eliminarEmpleado, guardarCategorias, crearCategoria, eliminarCategoria } from '@/app/actions'
import { iconoDe, ICONO_OPCIONES } from '@/lib/vehicleIcons'

const sections = [
  { id: 'general', label: 'General', icon: Building2 },
  { id: 'perfil', label: 'Mi cuenta', icon: User },
  { id: 'empleados', label: 'Empleados', icon: Users },
  { id: 'categorias', label: 'Categorías', icon: Tag },
  { id: 'capacidad', label: 'Capacidad', icon: LayoutGrid },
  { id: 'facturacion', label: 'Facturación', icon: FileText },
] as const

type Empleado = { id: string; nombre: string; email: string }
type SectionId = (typeof sections)[number]['id']
type Modo = 'FRACCION' | 'PLENA'
type CategoriaVM = {
  id: string
  nombre: string
  icono: string
  esDefault: boolean
  modo: Modo
  fraccionMin: string
  fraccionPrecio: string
  plenaPrecio: string
  tolOn: boolean
  toleranciaMin: string
  dia: string
  mes: string
}

const fieldStyle: React.CSSProperties = {
  background: '#0f0f0f', border: '1px solid #232323', borderRadius: '8px',
  color: '#fff', padding: '8px 12px', fontSize: '13px', outline: 'none', width: '230px',
}
const num = (s: string) => parseInt(s.replace(/\D/g, '')) || 0

export default function ConfiguracionView({
  tenant,
  perfil,
  categorias: categoriasInit,
  plan,
  espacios,
  autoRecibo: autoReciboInit,
  empleados,
  seccionInicial = 'general',
}: {
  tenant: { nombre: string; direccion: string; telefono: string; nit: string }
  perfil: { nombre: string; email: string }
  categorias: CategoriaVM[]
  plan: string | null
  espacios: number
  autoRecibo: boolean
  empleados: Empleado[]
  seccionInicial?: SectionId
}) {
  const router = useRouter()
  const esPro = plan === 'PRO' || plan === 'NEGOCIO'
  const [active, setActive] = useState<SectionId>(seccionInicial)
  const [g, setG] = useState(tenant)
  const [cats, setCats] = useState<CategoriaVM[]>(categoriasInit)
  const [cap, setCap] = useState(String(espacios))
  const [autoRecibo, setAutoRecibo] = useState(autoReciboInit)
  const [saving, start] = useTransition()
  const [ok, setOk] = useState(false)

  // Perfil
  const [nombreUsuario, setNombreUsuario] = useState(perfil.nombre)
  const [savingPerfil, startPerfil] = useTransition()
  const [okPerfil, setOkPerfil] = useState(false)

  // Empleados
  const [empNombre, setEmpNombre] = useState('')
  const [empEmail, setEmpEmail] = useState('')
  const [empPass, setEmpPass] = useState('')
  const [empErr, setEmpErr] = useState('')
  const [savingEmp, startEmp] = useTransition()

  // Categorías (alta)
  const [catNombre, setCatNombre] = useState('')
  const [catIcono, setCatIcono] = useState('truck')
  const [catErr, setCatErr] = useState('')
  const [savingCat, startCat] = useTransition()
  const [okCat, setOkCat] = useState(false)

  const agregarEmpleado = () => {
    setEmpErr('')
    startEmp(async () => {
      const res = await crearEmpleado({ nombre: empNombre, email: empEmail, password: empPass })
      if (res.ok) { setEmpNombre(''); setEmpEmail(''); setEmpPass(''); router.refresh() }
      else setEmpErr(res.error ?? 'Error')
    })
  }
  const quitarEmpleado = (id: string) => {
    startEmp(async () => { await eliminarEmpleado(id); router.refresh() })
  }

  const setCat = (i: number, campo: keyof CategoriaVM, val: string) => {
    setCats(prev => prev.map((c, idx) => (idx === i ? { ...c, [campo]: campo === 'modo' ? (val as Modo) : val.replace(/\D/g, '') } : c)))
  }
  const toggleTol = (i: number) => {
    setCats(prev => prev.map((c, idx) => {
      if (idx !== i) return c
      const on = !c.tolOn
      return { ...c, tolOn: on, toleranciaMin: on && (c.toleranciaMin === '0' || c.toleranciaMin === '') ? '10' : c.toleranciaMin }
    }))
  }

  const guardarCats = () => {
    setOkCat(false)
    startCat(async () => {
      await guardarCategorias(cats.map(c => ({
        id: c.id,
        modo: c.modo,
        fraccionMin: Math.max(1, num(c.fraccionMin)),
        fraccionPrecio: num(c.fraccionPrecio),
        plenaPrecio: num(c.plenaPrecio),
        toleranciaMin: c.tolOn ? num(c.toleranciaMin) : 0,
        porDia: num(c.dia),
        porMes: num(c.mes),
      })))
      router.refresh()
      setOkCat(true)
      setTimeout(() => setOkCat(false), 2500)
    })
  }

  const agregarCategoria = () => {
    setCatErr('')
    startCat(async () => {
      const res = await crearCategoria({ nombre: catNombre, icono: catIcono })
      if (res.ok) { setCatNombre(''); setCatIcono('truck'); router.refresh() }
      else setCatErr(res.error ?? 'Error')
    })
  }
  const quitarCategoria = (id: string) => {
    startCat(async () => { const res = await eliminarCategoria(id); if (!res.ok) setCatErr(res.error ?? 'Error'); router.refresh() })
  }

  const guardar = () => {
    setOk(false)
    start(async () => {
      await guardarConfig({
        nombre: g.nombre, direccion: g.direccion, telefono: g.telefono, nit: g.nit,
        espacios: Math.min(9999, num(cap)),
        autoRecibo,
      })
      router.refresh()
      setOk(true)
      setTimeout(() => setOk(false), 2500)
    })
  }

  const guardarNombre = () => {
    setOkPerfil(false)
    startPerfil(async () => {
      await actualizarPerfil(nombreUsuario)
      router.refresh()
      setOkPerfil(true)
      setTimeout(() => setOkPerfil(false), 2500)
    })
  }

  const capN = num(cap)
  const setCapClamp = (v: number) => setCap(String(Math.max(1, Math.min(9999, v))))

  return (
    <div className="px-7 pb-7 pt-5">
      <div className="max-w-5xl mx-auto">
        <PageHeader crumb="Configuración" title="Configuración" subtitle="Datos del parqueadero, cuenta, categorías y capacidad" />

        <div className="flex gap-8">
          <nav className="w-48 shrink-0 flex flex-col gap-0.5">
            {sections.map(s => {
              const on = active === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left"
                  style={{ background: on ? '#1c1c1c' : 'transparent', color: on ? '#fff' : '#777' }}
                  onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.color = '#ccc' }}
                  onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.color = '#777' }}
                >
                  <s.icon size={16} />
                  <span style={{ fontSize: '13.5px', fontWeight: on ? 600 : 450, flex: 1 }}>{s.label}</span>
                  {s.id === 'facturacion' && (
                    <span className="px-1.5 py-0.5 rounded" style={{ background: '#1f1f1f', color: '#888', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em' }}>BETA</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="flex-1 min-w-0">
            {active === 'general' && (
              <Section title="Datos del parqueadero" desc="Esta información aparece en tus tiquetes y reportes.">
                <Card>
                  <Row label="Nombre" desc="Nombre visible del parqueadero">
                    <input value={g.nombre} onChange={e => setG({ ...g, nombre: e.target.value })} style={fieldStyle} />
                  </Row>
                  <Divider />
                  <Row label="Dirección" desc="Ubicación física">
                    <input value={g.direccion} onChange={e => setG({ ...g, direccion: e.target.value })} style={fieldStyle} />
                  </Row>
                  <Divider />
                  <Row label="Teléfono" desc="Contacto del negocio">
                    <input value={g.telefono} onChange={e => setG({ ...g, telefono: e.target.value })} style={fieldStyle} />
                  </Row>
                  <Divider />
                  <Row label="NIT" desc="Para facturación">
                    <input value={g.nit} onChange={e => setG({ ...g, nit: e.target.value })} style={fieldStyle} />
                  </Row>
                  <Divider />
                  <Row label="Imprimir tiquete automáticamente" desc="Al registrar una salida">
                    <Toggle on={autoRecibo} onClick={() => setAutoRecibo(v => !v)} />
                  </Row>
                </Card>
                <SaveBar ok={ok} saving={saving} onClick={guardar} />
              </Section>
            )}

            {active === 'perfil' && (
              <Section title="Mi cuenta" desc="Tu nombre aparece en los turnos y en la caja.">
                <Card>
                  <Row label="Nombre" desc="Tu nombre como operador / dueño">
                    <input value={nombreUsuario} onChange={e => setNombreUsuario(e.target.value)} style={fieldStyle} />
                  </Row>
                  <Divider />
                  <Row label="Correo" desc="No se puede cambiar por ahora">
                    <input value={perfil.email} disabled style={{ ...fieldStyle, color: '#666', cursor: 'not-allowed' }} />
                  </Row>
                </Card>
                <div className="flex justify-end items-center gap-3 mt-6">
                  {okPerfil && <span style={{ color: '#22c55e', fontSize: '13px' }}>Guardado ✓</span>}
                  <button
                    onClick={guardarNombre}
                    disabled={savingPerfil || !nombreUsuario.trim()}
                    className="px-5 py-2.5 rounded-full text-black font-semibold"
                    style={{ background: '#fff', fontSize: '13px', opacity: savingPerfil || !nombreUsuario.trim() ? 0.6 : 1, cursor: 'pointer' }}
                  >
                    {savingPerfil ? 'Guardando…' : 'Guardar nombre'}
                  </button>
                </div>
              </Section>
            )}

            {active === 'empleados' && (
              <Section title="Empleados" desc="Crea cuentas para tus operarios. Solo verán Parqueadero, Caja e Historial.">
                <Card>
                  {empleados.length === 0 ? (
                    <div className="px-5 py-8 text-center" style={{ color: '#555', fontSize: '13px' }}>Aún no tienes empleados</div>
                  ) : (
                    empleados.map((e, i) => (
                      <div key={e.id}>
                        {i > 0 && <Divider />}
                        <div className="flex items-center justify-between px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#1a1a1a', border: '1px solid #262626', color: '#999' }}>
                              <User size={16} />
                            </div>
                            <div>
                              <p className="text-white" style={{ fontSize: '13.5px', fontWeight: 500 }}>{e.nombre}</p>
                              <p style={{ color: '#666', fontSize: '12px' }}>{e.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => quitarEmpleado(e.id)}
                            disabled={savingEmp}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: '#777', cursor: 'pointer' }}
                            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = '#2a0f0f'; (ev.currentTarget as HTMLElement).style.color = '#ef4444' }}
                            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'transparent'; (ev.currentTarget as HTMLElement).style.color = '#777' }}
                            title="Eliminar empleado"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </Card>

                <div className="rounded-2xl mt-4 p-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <UserPlus size={16} color="#888" />
                    <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Nuevo empleado</p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input value={empNombre} onChange={e => setEmpNombre(e.target.value)} placeholder="Nombre" style={{ ...fieldStyle, width: '100%' }} />
                    <input value={empEmail} onChange={e => setEmpEmail(e.target.value)} placeholder="Correo" style={{ ...fieldStyle, width: '100%' }} />
                    <input value={empPass} onChange={e => setEmpPass(e.target.value)} placeholder="Contraseña" style={{ ...fieldStyle, width: '100%' }} />
                  </div>
                  {empErr && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: 10 }}>{empErr}</p>}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={agregarEmpleado}
                      disabled={savingEmp || !empNombre.trim() || !empEmail.trim() || !empPass.trim()}
                      className="px-5 py-2.5 rounded-full text-black font-semibold"
                      style={{ background: '#fff', fontSize: '13px', opacity: savingEmp || !empNombre.trim() || !empEmail.trim() || !empPass.trim() ? 0.6 : 1, cursor: 'pointer' }}
                    >
                      {savingEmp ? 'Creando…' : 'Crear empleado'}
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {active === 'categorias' && (
              <Section title="Categorías y tarifas" desc="Cada categoría de vehículo tiene su propia tarifa. Carro, moto y bici vienen por defecto.">
                <div className="flex flex-col gap-3">
                  {cats.map((c, i) => {
                    const Icon = iconoDe(c.icono)
                    return (
                      <Card key={c.id}>
                        <div className="flex items-center justify-between px-5 pt-4 pb-3">
                          <div className="flex items-center gap-2.5">
                            <Icon size={18} color="#aaa" />
                            <span className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>{c.nombre}</span>
                            {!c.esDefault && <span className="px-1.5 py-0.5 rounded" style={{ background: '#1f1f1f', color: '#888', fontSize: '9.5px', fontWeight: 700 }}>PERSONALIZADA</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex rounded-lg p-0.5" style={{ background: '#0e0e0e', border: '1px solid #232323' }}>
                              {(['FRACCION', 'PLENA'] as const).map(modo => {
                                const on = c.modo === modo
                                return (
                                  <button key={modo} onClick={() => setCat(i, 'modo', modo)} className="px-3 py-1.5 rounded-md transition-colors" style={{ background: on ? '#fff' : 'transparent', color: on ? '#000' : '#888', fontSize: '12px', fontWeight: 600 }}>
                                    {modo === 'FRACCION' ? 'Por fracción' : 'Tarifa plena'}
                                  </button>
                                )
                              })}
                            </div>
                            {!c.esDefault && (
                              <button onClick={() => quitarCategoria(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: '#777', cursor: 'pointer' }}
                                onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = '#2a0f0f'; (ev.currentTarget as HTMLElement).style.color = '#ef4444' }}
                                onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = 'transparent'; (ev.currentTarget as HTMLElement).style.color = '#777' }}
                                title="Eliminar categoría">
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                        <Divider />
                        <div className="px-5 py-4">
                          {c.modo === 'FRACCION' ? (
                            <div className="flex items-center gap-2 flex-wrap" style={{ color: '#aaa', fontSize: '13px' }}>
                              <span>Cada</span>
                              <MiniInput value={c.fraccionMin} onChange={v => setCat(i, 'fraccionMin', v)} suffix="min" w={64} />
                              <span>cuesta</span>
                              <MiniInput value={c.fraccionPrecio} onChange={v => setCat(i, 'fraccionPrecio', v)} prefix="$" w={110} />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-wrap" style={{ color: '#aaa', fontSize: '13px' }}>
                              <span>Precio único por estadía</span>
                              <MiniInput value={c.plenaPrecio} onChange={v => setCat(i, 'plenaPrecio', v)} prefix="$" w={130} />
                            </div>
                          )}

                          {c.modo === 'FRACCION' && (
                            <div className="mt-4">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Toggle on={c.tolOn} onClick={() => toggleTol(i)} />
                                <span style={{ color: '#aaa', fontSize: '13px' }}>Tolerancia</span>
                                {c.tolOn && <MiniInput value={c.toleranciaMin} onChange={v => setCat(i, 'toleranciaMin', v)} suffix="min" w={64} />}
                              </div>
                              <p style={{ color: '#555', fontSize: '12px', marginTop: 6 }}>
                                {c.tolOn
                                  ? `Margen para pasarse de la fracción sin que se cuente la siguiente. Ej: si se pasa ${c.toleranciaMin || '0'} min o menos, no se cobra otra fracción.`
                                  : 'Apenas se pase de la fracción se cobra la siguiente completa.'}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-6 flex-wrap mt-3" style={{ color: '#777', fontSize: '12.5px' }}>
                            <div className="flex items-center gap-2"><span>Día</span><MiniInput value={c.dia} onChange={v => setCat(i, 'dia', v)} prefix="$" w={100} /></div>
                            <div className="flex items-center gap-2"><span>Mes</span><MiniInput value={c.mes} onChange={v => setCat(i, 'mes', v)} prefix="$" w={110} /></div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {/* Agregar categoría */}
                {esPro ? (
                  <div className="rounded-2xl mt-4 p-5" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Plus size={16} color="#888" />
                      <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Nueva categoría</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <input value={catNombre} onChange={e => setCatNombre(e.target.value)} placeholder="Ej: Camión, Buseta…" style={{ ...fieldStyle, width: 200 }} />
                      <div className="flex items-center gap-1.5">
                        {ICONO_OPCIONES.map(op => {
                          const on = catIcono === op.key
                          const Icon = iconoDe(op.key)
                          return (
                            <button key={op.key} onClick={() => setCatIcono(op.key)} title={op.label} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ background: on ? '#1e1e1e' : '#0f0f0f', border: `1px solid ${on ? '#3a3a3a' : '#232323'}`, color: on ? '#fff' : '#888' }}>
                              <Icon size={16} />
                            </button>
                          )
                        })}
                      </div>
                      <button onClick={agregarCategoria} disabled={savingCat || !catNombre.trim()} className="px-4 py-2 rounded-full text-black font-semibold" style={{ background: '#fff', fontSize: '13px', opacity: savingCat || !catNombre.trim() ? 0.5 : 1, cursor: 'pointer' }}>
                        Agregar
                      </button>
                    </div>
                    {catErr && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: 10 }}>{catErr}</p>}
                  </div>
                ) : (
                  <div className="rounded-2xl mt-4 p-5 flex items-center gap-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#1a1a1a', border: '1px solid #262626' }}>
                      <Lock size={17} color="#888" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white" style={{ fontSize: '13.5px', fontWeight: 600 }}>Crea tus propias categorías</p>
                      <p style={{ color: '#777', fontSize: '12.5px', marginTop: 2 }}>Camión, buseta, lo que necesites — con el plan Pro o Negocio.</p>
                    </div>
                    <Link href="/dashboard/plan" className="px-4 py-2 rounded-full text-black font-semibold shrink-0" style={{ background: '#fff', fontSize: '13px' }}>Ver planes</Link>
                  </div>
                )}

                <SaveBar ok={okCat} saving={savingCat} onClick={guardarCats} />
              </Section>
            )}

            {active === 'capacidad' && (
              <Section title="Capacidad" desc="Cantidad total de espacios disponibles en tu parqueadero.">
                <Card>
                  <div className="px-6 py-7 flex items-center justify-between">
                    <div>
                      <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Cupos totales</p>
                      <p style={{ color: '#666', fontSize: '12.5px', marginTop: 2 }}>Se usa para calcular la ocupación del parqueadero</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Stepper onClick={() => setCapClamp(capN - 1)} icon={<Minus size={16} />} />
                      <input
                        value={cap}
                        onChange={e => setCap(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        inputMode="numeric"
                        className="text-white text-center font-bold"
                        style={{ width: 96, fontSize: '34px', background: 'transparent', outline: 'none', border: 'none' }}
                      />
                      <Stepper onClick={() => setCapClamp(capN + 1)} icon={<Plus size={16} />} />
                    </div>
                  </div>
                </Card>
                <SaveBar ok={ok} saving={saving} onClick={guardar} />
              </Section>
            )}

            {active === 'facturacion' && (
              <Section title="Facturación electrónica" desc="Emite facturas válidas ante la DIAN directamente desde Parqueo.">
                <div className="rounded-2xl p-6 flex items-start gap-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#1a1a1a', border: '1px solid #262626' }}>
                    <FileText size={18} color="#888" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white" style={{ fontSize: '14px', fontWeight: 600 }}>Facturación DIAN</p>
                      <span className="px-2 py-0.5 rounded-md" style={{ background: '#1f1f1f', color: '#aaa', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>EN PRUEBAS</span>
                    </div>
                    <p style={{ color: '#888', fontSize: '13px', marginTop: 6, lineHeight: 1.55, maxWidth: 460 }}>
                      Estamos integrando la facturación electrónica con la DIAN. Pronto vas a poder emitir facturas válidas desde aquí. Te avisaremos cuando esté lista.
                    </p>
                  </div>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SaveBar({ ok, saving, onClick }: { ok: boolean; saving: boolean; onClick: () => void }) {
  return (
    <div className="flex justify-end items-center gap-3 mt-6">
      {ok && <span className="flex items-center gap-1" style={{ color: '#22c55e', fontSize: '13px' }}><Check size={14} /> Guardado</span>}
      <button onClick={onClick} disabled={saving} className="px-5 py-2.5 rounded-full text-black font-semibold" style={{ background: '#fff', fontSize: '13px', opacity: saving ? 0.6 : 1, cursor: 'pointer' }}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </div>
  )
}

function MiniInput({ value, onChange, prefix, suffix, w }: { value: string; onChange: (v: string) => void; prefix?: string; suffix?: string; w: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5" style={{ background: '#0f0f0f', border: '1px solid #232323' }}>
      {prefix && <span style={{ color: '#555', fontSize: '13px' }}>{prefix}</span>}
      <input value={value} onChange={e => onChange(e.target.value)} inputMode="numeric" className="bg-transparent text-white outline-none" style={{ width: w, fontSize: '13px', fontWeight: 600 }} />
      {suffix && <span style={{ color: '#666', fontSize: '12px' }}>{suffix}</span>}
    </span>
  )
}

function Stepper({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors" style={{ background: '#0f0f0f', border: '1px solid #2a2a2a', color: '#ccc' }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1a1a1a')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#0f0f0f')}>
      {icon}
    </button>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white" style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h2>
      <p style={{ color: '#666', fontSize: '13px', marginTop: '2px', marginBottom: '16px' }}>{desc}</p>
      {children}
    </div>
  )
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>{children}</div>
}
function Divider() {
  return <div className="h-px mx-5" style={{ background: '#1c1c1c' }} />
}
function Row({ label, desc, children }: { label: React.ReactNode; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <div className="text-white" style={{ fontSize: '13.5px', fontWeight: 500 }}>{label}</div>
        {desc && <p style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>{desc}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full transition-colors" style={{ width: 42, height: 24, background: on ? '#22c55e' : '#2a2a2a', padding: 2, cursor: 'pointer' }}>
      <div className="rounded-full transition-transform" style={{ width: 20, height: 20, background: '#fff', transform: on ? 'translateX(18px)' : 'translateX(0)' }} />
    </button>
  )
}
