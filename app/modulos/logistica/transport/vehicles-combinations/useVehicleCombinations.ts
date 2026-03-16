import { computed, type Ref } from 'vue'
import type { VehicleCombination } from '~/modulos/logistica/transport/vehicles-combinations/vehicles-combinations.types'

export interface SelectItem {
  label: string
  value: string
}

export function useVehiclesCombinations(vehicles: Ref<VehicleCombination[]>) {
  const items = computed<SelectItem[]>(() =>
    vehicles.value.map((vehicle) => {
      const label = `${vehicle.unit_number} - ${vehicle.tractor?.plate} - ${vehicle.trailer?.plate}`
      return { label, value: vehicle.id }
    })
  )
  return { items }
}
