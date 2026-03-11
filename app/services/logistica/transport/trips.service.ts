import type {
  Trip,
  CreateTripInput,
  UpdateTripInput,
  TripRate,
  CreateTripRateInput,
  UpdateTripRateInput
} from '~/types/logistica/trips'

export const useTripsService = () => {
  const base = '/api/logistica/transport/trips'

  const getAll = (company_id: string) =>
    $fetch<Trip[]>(base, { query: { company_id } })

  const getById = (id: string) => $fetch<Trip>(`${base}/${id}`)

  const create = (body: CreateTripInput) =>
    $fetch<Trip>(base, { method: 'POST', body })

  const update = (id: string, body: UpdateTripInput) =>
    $fetch<Trip>(`${base}/${id}`, { method: 'PATCH', body })

  const remove = (id: string) =>
    $fetch<{ deleted: boolean }>(`${base}/${id}`, { method: 'DELETE' })

  const updateStatus = (id: string, status: string) =>
    $fetch<Trip>(`${base}/${id}/status/${status}`, {
      method: 'PATCH'
    })

  // rates
  const addRate = (trip_id: string, body: CreateTripRateInput) =>
    $fetch<TripRate>(`${base}/${trip_id}/rates`, { method: 'POST', body })

  const updateRate = (id: string, body: UpdateTripRateInput) =>
    $fetch<TripRate>(`${base}/rates/${id}`, { method: 'PATCH', body })

  const removeRate = (id: string) =>
    $fetch<{ deleted: boolean }>(`${base}/rates/${id}`, { method: 'DELETE' })

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    updateStatus,
    addRate,
    updateRate,
    removeRate
  }
}
