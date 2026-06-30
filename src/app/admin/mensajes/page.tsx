import MensajeComposer from '@/components/MensajeComposer'

export const dynamic = 'force-dynamic'

export default function MensajesPage() {
  return (
    <div className="px-8 pt-9 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-7">
          <h1 className="text-white font-bold" style={{ fontSize: '24px', letterSpacing: '-0.01em' }}>Mensajes</h1>
          <p style={{ color: '#666', fontSize: '13.5px', marginTop: 3 }}>Envía un comunicado a todos los parqueaderos y elige cómo se ve.</p>
        </div>
        <MensajeComposer />
      </div>
    </div>
  )
}
