import type { BusinessParty } from '~/modulos/logistica/master-data/bussiness-parties/bussines-parties.types'
export const useBusinessPartiesService = () => {
  const findAll = (company_id: string) => {
    return $fetch<BusinessParty[]>(
      '/api/logistica/master-data/business-parties',
      {
        query: { company_id }
      }
    )
  }

  const findOne = (id: string) => {
    return $fetch<BusinessParty>(
      `/api/logistica/master-data/business-parties/${id}`
    )
  }

  const create = (data: Partial<BusinessParty>) => {
    return $fetch<BusinessParty>(
      '/api/logistica/master-data/business-parties',
      {
        method: 'POST',
        body: data
      }
    )
  }

  const update = (id: string, data: Partial<BusinessParty>) => {
    return $fetch<BusinessParty>(
      `/api/logistica/master-data/business-parties/${id}`,
      {
        method: 'PATCH',
        body: data
      }
    )
  }

  const remove = (id: string) => {
    return $fetch<void>(`/api/logistica/master-data/business-parties/${id}`, {
      method: 'DELETE'
    })
  }
  return { findAll, findOne, create, update, remove }
}
