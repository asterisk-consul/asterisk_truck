import { parseDate, CalendarDate } from '@internationalized/date'
import type { Vehicle } from '~/modulos/logistica/transport/vehicles/vehicles.types'

function toCalendarDate(value?: string | null): CalendarDate | null {
  if (!value) return null
  try {
    return parseDate(value.slice(0, 10)) // YYYY-MM-DD
  } catch {
    return null
  }
}

/**
 * Mapea los documentos del vehículo a los campos del form
 */
export function mapVehicleDocumentsToForm(vehicle: Vehicle) {
  const mapped: Record<string, any> = {}

  vehicle.vehicleDocuments?.forEach((doc, index) => {
    const i = index + 1
    mapped[`doc${i}Type`] = doc.document_type_id
    mapped[`doc${i}Expiration`] = toCalendarDate(doc.expiration_date)
  })

  return mapped
}
