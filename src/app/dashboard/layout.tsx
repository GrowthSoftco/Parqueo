import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CuentaSuspendida from '@/components/CuentaSuspendida'
import AccountWatcher from '@/components/AccountWatcher'
import BroadcastWatcher from '@/components/BroadcastWatcher'
import LogoutDialog from '@/components/LogoutDialog'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user?.tenant) redirect('/login')
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY ?? ''
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? ''
  if (user.tenant.status === 'SUSPENDED' || user.tenant.status === 'BANNED') {
    return <CuentaSuspendida status={user.tenant.status} tenantId={user.tenant.id} pusherKey={pusherKey} pusherCluster={pusherCluster} />
  }
  const [sub, categorias, registros] = await Promise.all([
    prisma.subscription.findUnique({ where: { tenantId: user.tenant.id } }),
    prisma.category.findMany({ where: { tenantId: user.tenant.id }, orderBy: { orden: 'asc' }, select: { id: true, nombre: true, icono: true } }),
    prisma.parkingRecord.findMany({ where: { tenantId: user.tenant.id }, orderBy: [{ salidaAt: 'desc' }, { entradaAt: 'desc' }], take: 8, select: { placa: true, tipoNombre: true, monto: true, status: true, entradaAt: true, salidaAt: true } }),
  ])
  const plan = sub?.plan ?? null

  const hace = (d: Date) => {
    const min = Math.round((Date.now() - d.getTime()) / 60000)
    if (min < 60) return `Hace ${Math.max(1, min)} min`
    const h = Math.round(min / 60)
    return h < 24 ? `Hace ${h} h` : `Hace ${Math.round(h / 24)} d`
  }
  const actividad = registros.map(r => {
    const salio = r.status === 'SALIO' && r.salidaAt
    return {
      placa: r.placa,
      accion: (salio ? 'Salió' : 'Entró') as 'Entró' | 'Salió',
      detalle: salio && r.monto != null ? `$${r.monto.toLocaleString('es-CO')}` : r.tipoNombre,
      hace: hace(salio ? r.salidaAt! : r.entradaAt),
    }
  })

  return (
    <div className="flex h-screen overflow-hidden p-2.5 gap-2.5" style={{ background: 'var(--c-bg)' }}>
      <AccountWatcher tenantId={user.tenant.id} pusherKey={pusherKey} pusherCluster={pusherCluster} />
      <BroadcastWatcher pusherKey={pusherKey} pusherCluster={pusherCluster} />
      <LogoutDialog />
      <Sidebar role={user.role} />
      <main
        className="flex-1 overflow-hidden rounded-2xl flex flex-col relative"
        style={{
          background: 'var(--c-panel)',
          border: '1px solid var(--c-surface3)',
        }}
      >
        <TopBar
          plan={plan}
          userName={user.nombre}
          userEmail={user.email}
          role={user.role}
          categorias={categorias}
          empresa={{ nombre: user.tenant.nombre, nit: user.tenant.nit ?? undefined, direccion: user.tenant.direccion ?? undefined, telefono: user.tenant.telefono ?? undefined }}
          autoRecibo={user.tenant.autoRecibo}
          actividad={actividad}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
