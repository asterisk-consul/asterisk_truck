import type {
  Company,
  CreateCompanyInput,
  UpdateCompanyInput
} from '~/types/logistica/company/company'

export const useCompaniesService = () => {
  const findAll = () => $fetch<Company[]>('/api/companies')

  const findOne = (id: string) => $fetch<Company>(`/api/companies/${id}`)

  const create = (payload: CreateCompanyInput) =>
    $fetch<Company>('/api/companies', {
      method: 'POST',
      body: payload
    })

  const update = (id: string, payload: UpdateCompanyInput) =>
    $fetch<Company>(`/api/companies/${id}`, {
      method: 'PATCH',
      body: payload
    })

  const deactivate = (id: string) =>
    $fetch<void>(`/api/companies/${id}`, {
      method: 'DELETE'
    })

  return {
    findAll,
    findOne,
    create,
    update,
    deactivate
  }
}
