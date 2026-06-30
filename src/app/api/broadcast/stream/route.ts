import { getSessionUser } from '@/lib/auth'
import { bus } from '@/lib/bus'

export const dynamic = 'force-dynamic'

// SSE global: cualquier usuario logueado recibe los mensajes del desarrollador.
export async function GET(request: Request) {
  const user = await getSessionUser()
  if (!user) return new Response('no auth', { status: 401 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const handler = (payload: { message: string; kind?: string }) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message: payload.message, kind: payload.kind ?? 'notch' })}\n\n`))
        } catch {}
      }
      bus.on('broadcast', handler)

      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {}
      }, 20000)

      request.signal.addEventListener('abort', () => {
        clearInterval(ping)
        bus.off('broadcast', handler)
        try {
          controller.close()
        } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
    },
  })
}
