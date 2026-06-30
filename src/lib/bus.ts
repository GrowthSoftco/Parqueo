import { EventEmitter } from 'events'

// Bus de eventos en memoria (singleton dentro del mismo proceso).
// Sirve para push en tiempo real (SSE) sin polling, en servidor único.
const g = globalThis as unknown as { _bus?: EventEmitter }
export const bus = g._bus ?? new EventEmitter()
bus.setMaxListeners(0)
g._bus = bus
