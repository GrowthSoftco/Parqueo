import { Home, ChevronRight } from 'lucide-react'

export default function PageHeader({
  title,
  subtitle,
  crumb,
}: {
  title: string
  subtitle?: string
  crumb: string
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--c-text5)', fontSize: '13px' }}>
        <Home size={14} />
        <ChevronRight size={13} />
        <span
          className="px-2 py-0.5 rounded-md"
          style={{ background: 'var(--c-surface3)', color: 'var(--c-text2)', fontSize: '12px' }}
        >
          {crumb}
        </span>
      </div>
      <h1 className="text-white font-bold" style={{ fontSize: '26px' }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: 'var(--c-text5)', fontSize: '13px', marginTop: '2px' }}>{subtitle}</p>
      )}
    </div>
  )
}
