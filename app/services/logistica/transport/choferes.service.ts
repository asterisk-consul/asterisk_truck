import type {
  Driver,
  CreateDriverInput,
  UpdateDriverInput
} from '@/types/logistica/transport/drivers'

export const useChoferesService = () => {
  const getAll = (company_id: string) =>
    $fetch<Driver[]>('/api/logistica/transport/drivers', {
      query: { company_id }
    })

  const getById = (id: string) =>
    $fetch<Driver>(`/api/logistica/transport/drivers/${id}`)

  const create = (body: CreateDriverInput) =>
    $fetch<Driver>('/api/logistica/transport/drivers', {
      method: 'POST',
      body
    })

  const update = (id: string, body: UpdateDriverInput) =>
    $fetch<Driver>(`/api/logistica/transport/drivers/${id}`, {
      method: 'PATCH',
      body
    })

  const activate = (id: string) =>
    $fetch<void>(`/api/logistica/transport/drivers/${id}/activate`, {
      method: 'PATCH'
    })
  const desactivate = (id: string) =>
    $fetch<void>(`/api/logistica/transport/drivers/${id}/desactivate`, {
      method: 'PATCH'
    })

  return {
    getAll,
    getById,
    create,
    update,
    activate,
    desactivate
  }
}
