import type {
  Trip,
  CreateTripInput,
  AddTripCargoInput,
  TripCargo
} from '~/types/logistica/transport/trips'

export const useTripsService = () => {
  const getAll = (companyId: string) =>
    $fetch<Trip[]>('/api/logistica/transport/trips', {
      query: { companyId }
    })

  const getById = (id: string) =>
    $fetch<Trip>(`/api/logistica/transport/trips/${id}`)

  const create = (body: CreateTripInput) =>
    $fetch<Trip>('/api/logistica/transport/trips', {
      method: 'POST',
      body
    })

  const start = (id: string) =>
    $fetch<Trip>(`/api/logistica/transport/trips/${id}`, {
      method: 'PATCH',
      body: { action: 'start' }
    })

  const complete = (id: string) =>
    $fetch<Trip>(`/api/logistica/transport/trips/${id}`, {
      method: 'PATCH',
      body: { action: 'complete' }
    })

  const remove = (id: string) =>
    $fetch<void>(`/api/logistica/transport/trips/${id}`, {
      method: 'DELETE'
    })
  const addCargo = (body: AddTripCargoInput) => {
    return $fetch<TripCargo>('/api/logistica/transport/trips/cargo', {
      method: 'POST',
      body
    })
  }

  return {
    getAll,
    getById,
    create,
    start,
    complete,
    addCargo,
    remove
  }
}
