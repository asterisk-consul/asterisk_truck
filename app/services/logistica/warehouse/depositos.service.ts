import type {
  Warehouse,
  CreateWarehouseInput,
  UpdateWarehouseInput
} from '~/types/logistica/warehouses/warehouse' // services/warehouse.service.ts

export const useDepositosService = () => {
  const getAll = () =>
    $fetch<Warehouse[]>('/api/logistica/warehouse/warehouses')

  const getById = (id: string) =>
    $fetch<Warehouse>(`/api/logistica/warehouse/warehouses/${id}`)

  const create = (body: CreateWarehouseInput) =>
    $fetch<Warehouse>('/api/logistica/warehouse/warehouses', {
      method: 'POST',
      body
    })

  const update = (id: string, body: UpdateWarehouseInput) =>
    $fetch<Warehouse>(`/api/logistica/warehouse/warehouses/${id}`, {
      method: 'PATCH',
      body
    })

  const remove = (id: string) =>
    $fetch<void>(`/api/logistica/warehouse/warehouses/${id}`, {
      method: 'DELETE'
    })

  return { getAll, getById, create, update, remove }
}
