import type {
  VehicleCombination,
  UpdateVehicleCombinationInput,
  CreateVehicleCombinationInput // 👈
} from '../types/vehicles-combinations.types'

export type VehicleCombinationForm = {
  id: string
  unit_number: string
  tractor_id: string
  trailer_id: string
  driver_id: string | undefined
  valid_from?: string
  valid_until?: string
}

const toDateOnly = (iso?: string | null): string => {
  if (!iso) return ''
  return iso.split('T')[0] ?? ''
}

const toISO = (date?: string | null): string | undefined => {
  if (!date) return undefined
  return new Date(date).toISOString()
}

export function mapVehicleCombinationToForm(
  data: VehicleCombination
): VehicleCombinationForm {
  return {
    id: data.id,
    unit_number: data.unit_number ?? '',
    tractor_id: data.tractor_id ?? '',
    trailer_id: data.trailer_id ?? '',
    driver_id: data.driver_id ?? undefined,
    valid_from: toDateOnly(data.valid_from),
    valid_until: toDateOnly(data.valid_until)
  }
}

export function mapVehicleCombinationFormToDto(
  form: VehicleCombinationForm
): UpdateVehicleCombinationInput {
  return {
    unit_number: form.unit_number || undefined,
    tractor_id: form.tractor_id,
    trailer_id: form.trailer_id || undefined,
    driver_id: form.driver_id || undefined,
    valid_from: toISO(form.valid_from),
    valid_until: toISO(form.valid_until)
  }
}

// 👇 nuevo
export function mapVehicleCombinationFormToCreateDto(
  form: VehicleCombinationForm
): CreateVehicleCombinationInput {
  return {
    unit_number: form.unit_number || undefined,
    tractor_id: form.tractor_id,
    trailer_id: form.trailer_id || undefined,
    driver_id: form.driver_id || undefined,
    valid_from: toISO(form.valid_from) ?? new Date().toISOString(),
    valid_until: toISO(form.valid_until)
  }
}
