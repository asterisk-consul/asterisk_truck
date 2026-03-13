import { computed, type Ref } from 'vue'
import type { Location } from '~/modulos/logistica/master-data/locations/locations'

export interface SelectItem {
  label: string
  value: string
}

export function useLocations(locations: Ref<Location[]>) {
  const items = computed<SelectItem[]>(() =>
    locations.value.map((location) => {
      const city = location.city ?? ''
      const address = location.address ?? ''

      const label = address ? `${address} - ${city}` : city

      return {
        label,
        value: location.id
      }
    })
  )

  return {
    items
  }
}
