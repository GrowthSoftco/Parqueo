export const dynamic = 'force-dynamic'

// Endpoint TEMPORAL de diagnóstico (sin exponer valores). Borrar después.
export async function GET() {
  const v = (k: string) => {
    const x = process.env[k]
    return x ? `set(len=${x.length})` : 'MISSING'
  }
  return Response.json({
    NEXT_PUBLIC_PUSHER_KEY: v('NEXT_PUBLIC_PUSHER_KEY'),
    NEXT_PUBLIC_PUSHER_CLUSTER: v('NEXT_PUBLIC_PUSHER_CLUSTER'),
    PUSHER_APP_ID: v('PUSHER_APP_ID'),
    PUSHER_SECRET: v('PUSHER_SECRET'),
  })
}
