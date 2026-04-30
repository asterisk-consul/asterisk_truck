import { computed, type Ref } from 'vue'
import type { Vehicle } from '~/modulos/logistica/transport/vehicles/types/vehicles.types'
import type { VehicleCombination } from '~/modulos/logistica/transport/vehicles-combinations/types/vehicles-combinations.types'

export interface SelectItem {
  label: string
  value: string
  disabled?: boolean
}

export function useVehicles(
  vehicles: Ref<Vehicle[]>,
  combinations?: Ref<VehicleCombination[]>,
  currentCombinationId?: Ref<string | undefined>
) {
  /**
   * IDs usados
   */
  const usedTractorIds = computed(() => {
    if (!combinations) return new Set<string>()
    return new Set(
      combinations.value
        .filter((c) => c.id !== currentCombinationId?.value)
        .map((c) => c.tractor_id)
    )
  })

  const usedTrailerIds = computed(() => {
    if (!combinations) return new Set<string>()
    return new Set(
      combinations.value
        .filter((c) => c.id !== currentCombinationId?.value)
        .map((c) => c.trailer_id)
    )
  })

  /**
   * TODAS las opciones (pero marcando las usadas)
   */
  const tractorOptions = computed(() =>
    vehicles.value
      .filter((v) => v.type === 'CAMION')
      .map((v) => ({
        label: `${v.plate} ${v.brand ?? ''} ${v.model ?? ''}`.trim(),
        value: v.id,
        disabled: usedTractorIds.value.has(v.id)
      }))
  )

  const trailerOptions = computed(() =>
    vehicles.value
      .filter((v) => v.type === 'SEMI')
      .map((v) => ({
        label: v.plate,
        value: v.id,
        disabled: usedTrailerIds.value.has(v.id)
      }))
  )

  /**
   * SOLO disponibles (filtradas)
   */
  const availableTractorOptions = computed(() =>
    tractorOptions.value.filter((o) => !o.disabled)
  )

  const availableTrailerOptions = computed(() =>
    trailerOptions.value.filter((o) => !o.disabled)
  )

  return {
    // 👇 completas
    tractorOptions,
    trailerOptions,

    // 👇 filtradas
    availableTractorOptions,
    availableTrailerOptions
  }
}
