'use client'

import { useRouter } from 'next/navigation'
import { Download, FileText } from 'lucide-react'

const FILTROS: { key: string; label: string }[] = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
  { key: 'anio', label: 'Este año' },
  { key: 'todo', label: 'Todo' },
]

export default function ContabilidadToolbar({ periodo }: { periodo: string }) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between mb-4 no-print">
      <div className="flex items-center gap-2">
        {FILTROS.map(f => {
          const activo = f.key === periodo
          return (
            <button
              key={f.key}
              onClick={() => router.push(`/dashboard/contabilidad?periodo=${f.key}`)}
              className="px-3.5 py-1.5 rounded-full transition-colors"
              style={{
                background: activo ? 'var(--c-text)' : 'var(--c-surface2)',
                color: activo ? 'var(--c-bg)' : 'var(--c-text3)',
                border: '1px solid var(--c-border2)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      <div className="flex gap-2">
        <a
          href={`/api/contabilidad/pdf?periodo=${periodo}`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[var(--c-surface3)]"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border2)', color: 'var(--c-text2)', fontSize: '13px' }}
        >
          <FileText size={15} /> PDF
        </a>
        <a
          href={`/api/contabilidad/export?periodo=${periodo}`}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[var(--c-surface3)]"
          style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border2)', color: 'var(--c-text2)', fontSize: '13px' }}
        >
          <Download size={15} /> Excel
        </a>
      </div>
    </div>
  )
}
