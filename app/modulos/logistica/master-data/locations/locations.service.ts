import type {
  Location,
  CreateLocationInput,
  UpdateLocationInput
} from '~/modulos/logistica/master-data/locations/locations'

export const useLocationsService = () => {
  const getAll = () => $fetch<Location[]>('/api/locations')

  const getOne = (id: string) => $fetch<Location>(`/api/locations/${id}`)

  const create = (payload: CreateLocationInput) =>
    $fetch<Location>('/api/locations', {
      method: 'POST',
      body: payload
    })

  const update = (id: string, payload: UpdateLocationInput) =>
    $fetch<Location>(`/api/locations/${id}`, {
      method: 'PATCH',
      body: payload
    })

  const remove = (id: string) =>
    $fetch<void>(`/api/locations/${id}`, {
      method: 'DELETE'
    })

  return {
    getAll,
    getOne,
    create,
    update,
    remove
  }
}
