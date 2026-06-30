import { getSessionUser } from '@/lib/auth'
import { bus } from '@/lib/bus'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const user = await getSessionUser()
  const tenantId = user?.tenant?.id
  if (!tenantId) return new Response('no auth', { status: 401 })

  const encoder = new TextEncoder()
  const evento = `tenant:${tenantId}`

  const stream = new ReadableStream({
    start(controller) {
      const handler = () => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ changed: true })}\n\n`))
        } catch {}
      }
      bus.on(evento, handler)

      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {}
      }, 20000)

      request.signal.addEventListener('abort', () => {
        clearInterval(ping)
        bus.off(evento, handler)
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
