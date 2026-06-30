import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export type StatCardProps = {
  label: string
  value: string
  change?: string
  tone?: 'up' | 'down' | 'warn' | 'neutral'
  note?: string
  spark?: number[]
}

const toneColor: Record<NonNullable<StatCardProps['tone']>, string> = {
  up: '#22c55e',
  down: '#ef4444',
  warn: '#f59e0b',
  neutral: '#888888',
}

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const w = 100
  const h = 32
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((d - min) / range) * (h - 4) - 2
    return `${x.toFixed(2)},${y.toFixed(2)}`
  })
  const line = pts.join(' ')
  const area = `0,${h} ${line} ${w},${h}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height: 38, marginTop: 14, display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StatCard({ label, value, change, tone = 'neutral', note, spark }: StatCardProps) {
  const color = toneColor[tone]
  const sparkId = `spark-${label.replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <div className="rounded-2xl p-5 overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
      <p style={{ color: '#777', fontSize: '13px' }}>{label}</p>
      <p className="text-white font-bold" style={{ fontSize: '28px', marginTop: '6px' }}>{value}</p>
      {(change || note) && (
        <div className="flex items-center gap-2" style={{ marginTop: '10px' }}>
          {change && (
            <span
              className="flex items-center gap-0.5 rounded-md"
              style={{ background: `${color}1f`, color, fontSize: '11px', fontWeight: 600, padding: '2px 6px' }}
            >
              {tone === 'up' && <ArrowUpRight size={11} strokeWidth={2.5} />}
              {tone === 'down' && <ArrowDownRight size={11} strokeWidth={2.5} />}
              {change}
            </span>
          )}
          {note && <span style={{ color: '#666', fontSize: '12px' }}>{note}</span>}
        </div>
      )}
      {spark && <Sparkline data={spark} color={color} id={sparkId} />}
    </div>
  )
}
