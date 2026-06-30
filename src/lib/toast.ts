export type ToastType = 'error' | 'success' | 'info' | 'dev'

// Dispara un toast tipo notch desde cualquier componente cliente.
export function toast(message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('parqueo:toast', { detail: { message, type } }))
}
