import type {
  CorridorWithRelations,
  CreateCorridorDto
} from '../corridors.types'

import { mapStopsToDto } from '../corridors.mappers'

export function useCorridorForm(
  companyId: string,
  corridor?: CorridorWithRelations
) {
  const form = reactive<CreateCorridorDto>({
    company_id: companyId,
    name: corridor?.name ?? '',
    origin_location_id: corridor?.origin_location_id ?? '',
    destination_location_id: corridor?.destination_location_id ?? '',
    is_template: corridor?.is_template ?? true,
    stops: mapStopsToDto(corridor?.corridorStops)
  })

  return {
    form
  }
}
