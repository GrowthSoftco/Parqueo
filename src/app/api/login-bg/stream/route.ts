import { prisma } from '@/lib/prisma'
import { bus } from '@/lib/bus'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (value: string | null) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ value })}\n\n`))
        } catch {}
      }

      // Valor inicial
      const s = await prisma.setting.findUnique({ where: { key: 'loginBg' } })
      send(s?.value ?? null)

      // Escucha cambios y los empuja (sin polling)
      const handler = (value: string) => send(value)
      bus.on('loginBg', handler)

      // Keep-alive para que la conexión no se cierre
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {}
      }, 20000)

      // Limpieza al desconectar el cliente
      request.signal.addEventListener('abort', () => {
        clearInterval(ping)
        bus.off('loginBg', handler)
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
