'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import { isOperador } from '@/app/auth-actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = (pathname ?? '').replace(/\/+$/, '') === '/admin/login'
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (isLogin) {
      setReady(true)
      return
    }
    // Guard real: verifica rol SUPER_ADMIN en el servidor
    isOperador().then(ok => {
      if (!ok) router.replace('/admin/login')
      else setReady(true)
    })
  }, [isLogin, pathname, router])

  // La pantalla de login no usa el sidebar
  if (isLogin) return <>{children}</>

  // Evita el flash mientras verifica / redirige
  if (!ready) return <div className="h-screen" style={{ background: 'var(--c-bg)' }} />

  return (
    <div className="flex h-screen overflow-hidden p-2.5 gap-2.5" style={{ background: 'var(--c-bg)' }}>
      <AdminSidebar />
      <main
        className="flex-1 overflow-hidden rounded-2xl flex flex-col relative"
        style={{ background: 'var(--c-panel)', border: '1px solid var(--c-surface3)' }}
      >
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
