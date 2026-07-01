'use client'

import { useEffect, useRef } from 'react'
import { buscarPorCodigo } from '@/app/actions'
import { toast } from '@/lib/toast'

// Escucha el escaneo de una pistola láser (o lector USB): teclea muy rápido
// y termina en Enter. Resuelve el código → placa y abre la salida.
// Ignora si el foco está en un campo de texto (para no interferir al escribir).
export default function Scanner() {
  const buf = useRef('')
  const last = useRef(0)

  useEffect(() => {
    const enCampo = () => {
      const el = document.activeElement as HTMLElement | null
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
    }

    const onKey = (e: KeyboardEvent) => {
      if (enCampo()) return
      const now = Date.now()
      if (now - last.current > 60) buf.current = '' // gap largo → nuevo escaneo
      last.current = now

      if (e.key === 'Enter') {
        const code = buf.current.trim()
        buf.current = ''
        if (code.length < 5) return // muy corto, no es un escaneo
        e.preventDefault()
        buscarPorCodigo(code).then(res => {
          if (res.ok) {
            toast(`Tiquete ${code} · ${res.placa}`, 'info')
            window.dispatchEvent(new CustomEvent('parqueo:salida', { detail: { placa: res.placa } }))
          } else {
            toast(res.error ?? 'Código no encontrado', 'error')
          }
        })
        return
      }
      if (e.key.length === 1) buf.current += e.key
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return null
}
