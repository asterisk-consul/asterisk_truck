import { reactive, watch } from 'vue'
import type { VehicleCombination } from '../types/vehicles-combinations.types'
import {
  mapVehicleCombinationToForm,
  mapVehicleCombinationFormToDto,
  type VehicleCombinationForm
} from '../mappers/vehicle-combinations.mapper'

export function useVehicleCombinationForm(
  editingRow: Ref<VehicleCombination | null>
) {
  const form = reactive<VehicleCombinationForm>({
    id: null,
    unit_number: '',
    tractor_id: null,
    trailer_id: null,
    driver_id: null,
    valid_from: null,
    valid_until: null
  })

  watch(
    editingRow,
    (row) => {
      if (!row) return
      Object.assign(form, mapVehicleCombinationToForm(row))
    },
    { immediate: true }
  )

  const toDto = () => mapVehicleCombinationFormToDto(form)

  return {
    form,
    toDto
  }
}
