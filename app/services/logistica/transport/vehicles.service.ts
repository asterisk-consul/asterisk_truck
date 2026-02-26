import type {
  Vehicle,
  CreateVehicleInput
} from '@/types/logistica/transport/vehicles'
export const useVehiclesService = () => {
  const getAll = (companyId: string) =>
    $fetch<Vehicle[]>('/api/logistica/transport/vehicles', {
      query: { companyId }
    })

  const create = (body: CreateVehicleInput) =>
    $fetch<Vehicle>('/api/logistica/transport/vehicles', {
      method: 'POST',
      body
    })

  return {
    getAll,
    create
  }
}
