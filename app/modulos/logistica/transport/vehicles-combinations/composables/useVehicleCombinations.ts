import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { VehicleCombination } from '~/modulos/logistica/transport/vehicles-combinations/types/vehicles-combinations.types'

export interface SelectMenuItem {
  label: string
  value: string
}

export function useVehiclesCombinations(
  vehicleCombinations: Ref<VehicleCombination[]>
) {
  const items = computed<SelectMenuItem[]>(() =>
    vehicleCombinations.value.map((vc) => {
      const parts = [
        vc.unit_number,
        vc.tractor?.plate,
        vc.trailer?.plate,
        vc.drivers?.first_name + ' ' + vc.drivers?.last_name
      ].filter(Boolean)

      return {
        label: parts.length > 0 ? parts.join(' - ') : `VC-${vc.id.slice(0, 8)}`,
        value: vc.id
      }
    })
  )

  return { items }
}
