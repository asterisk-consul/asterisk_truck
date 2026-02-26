import type {
  Driver,
  CreateDriverInput
} from '~/types/logistica/transport/drivers'

export const useChoferesService = () => {
  const getAll = (companyId: string) =>
    $fetch<Driver[]>('/api/logistica/transport/drivers', {
      query: { companyId }
    })

  const create = (body: CreateDriverInput) =>
    $fetch<Driver>('/api/logistica/transport/drivers', {
      method: 'POST',
      body
    })

  return { getAll, create }
}
