export const dynamic = 'force-dynamic'

// Endpoint TEMPORAL de diagnóstico: dice si las variables existen en el servidor
// y su longitud (no expone valores). Borrar después.
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
    DATABASE_URL: v('DATABASE_URL'),
    AUTH_SECRET: v('AUTH_SECRET'),
  })
}
