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
    id: '',
    unit_number: '',
    tractor_id: '',
    trailer_id: '',
    driver_id: '',
    valid_from: '',
    valid_until: ''
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
