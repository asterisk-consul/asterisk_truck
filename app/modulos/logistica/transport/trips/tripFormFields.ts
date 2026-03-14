import type { BaseField } from '@/types/form.types'

export const tripsFormFields: BaseField[] = [
  { name: 'id', type: 'hidden' },

  /* ---------------- DATOS DEL VIAJE ---------------- */

  {
    label: 'Referencia',
    name: 'reference_number',
    type: 'text',
    placeholder: 'TRIP-0001'
  },

  {
    label: 'Combinación de vehículo',
    name: 'vehicle_combination_id',
    type: 'select',
    options: [] // Llenar con combinaciones disponibles
  },

  {
    label: 'Origen',
    name: 'origin_location_id',
    type: 'select',
    options: [] // Llenar con ubicaciones de origen
  },

  {
    label: 'Destino',
    name: 'destination_location_id',
    type: 'select',
    options: [] // Llenar con ubicaciones de destino
  },

  {
    label: 'Salida',
    name: 'departure_time',
    type: 'date'
  },

  {
    label: 'Llegada',
    name: 'arrival_time',
    type: 'date'
  },

  {
    label: 'Estado',
    name: 'status',
    type: 'select',
    options: [
      { label: 'Planificado', value: 'PLANNED' },
      { label: 'En progreso', value: 'IN_PROGRESS' },
      { label: 'Completado', value: 'COMPLETED' },
      { label: 'Cancelado', value: 'CANCELLED' }
    ]
  },

  {
    label: 'Kilómetros',
    name: 'kilometers',
    type: 'number',
    placeholder: '320'
  },

  /* ---------------- TARIFAS ---------------- */

  {
    label: 'Tarifa',
    name: 'rate_id',
    type: 'select',
    options: [] // Llenar con transfer rates disponibles
  },
  {
    label: 'Valor Tarifa',
    name: 'rate_value',
    type: 'number'
  }
]
