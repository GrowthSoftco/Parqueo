import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 px-6" style={{ background: '#0a0a0a' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Parqueo" width={36} height={36} style={{ opacity: 0.5 }} />
      <div className="text-center">
        <p className="text-white font-bold" style={{ fontSize: '44px', lineHeight: 1 }}>404</p>
        <p style={{ color: '#888', fontSize: '15px', marginTop: '10px' }}>Esta página aún no existe.</p>
      </div>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
        style={{ background: '#fff', color: '#000', fontSize: '14px', fontWeight: 600 }}
      >
        Volver al inicio
      </Link>
    </div>
  )
}
