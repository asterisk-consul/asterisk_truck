import type {
  VehicleCombination,
  UpdateVehicleCombinationInput
} from '../types/vehicles-combinations.types'

export type VehicleCombinationForm = {
  id: string | null
  unit_number: string
  tractor_id: string | null
  trailer_id: string | null
  driver_id: string | null
  valid_from: string | null
  valid_until: string | null
}

export function mapVehicleCombinationToForm(
  data: VehicleCombination
): VehicleCombinationForm {
  return {
    id: data.id,
    unit_number: data.unit_number ?? '',
    tractor_id: data.tractor_id ?? null,
    trailer_id: data.trailer_id ?? null,
    driver_id: data.driver_id ?? null,
    valid_from: data.valid_from ?? null,
    valid_until: data.valid_until ?? null
  }
}

export function mapVehicleCombinationFormToDto(
  form: VehicleCombinationForm
): UpdateVehicleCombinationInput {
  return {
    unit_number: form.unit_number,
    tractor_id: form.tractor_id,
    trailer_id: form.trailer_id,
    driver_id: form.driver_id,
    valid_from: form.valid_from,
    valid_until: form.valid_until
  }
}
