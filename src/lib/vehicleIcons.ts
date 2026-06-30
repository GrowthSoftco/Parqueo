import { Car, Motorbike, Bike, Truck, Bus } from 'lucide-react'

// Íconos disponibles para las categorías de vehículo
export const ICONOS: Record<string, React.ElementType> = {
  car: Car,
  motorbike: Motorbike,
  bike: Bike,
  truck: Truck,
  bus: Bus,
}

export const ICONO_OPCIONES = [
  { key: 'car', label: 'Carro' },
  { key: 'motorbike', label: 'Moto' },
  { key: 'bike', label: 'Bici' },
  { key: 'truck', label: 'Camión' },
  { key: 'bus', label: 'Bus' },
]

export function iconoDe(key?: string): React.ElementType {
  return ICONOS[key ?? 'car'] ?? Car
}
