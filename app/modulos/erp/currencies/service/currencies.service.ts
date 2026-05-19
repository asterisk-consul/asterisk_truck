import type {
  Currency,
  CreateCurrencyInput,
  UpdateCurrencyInput
} from '~/modulos/erp/currencies/types/currencies.types'

const urlBase = '/api/erp/currencies'

export const useCurrenciesService = () => {
  const findAll = () => {
    return $fetch<Currency[]>(urlBase, {
      method: 'GET'
    })
  }

  const findOne = (id: string) => {
    return $fetch<Currency>(`${urlBase}/${id}`)
  }

  const getBaseCurrency = () => {
    return $fetch<Currency>(`${urlBase}/base`)
  }

  const create = (data: CreateCurrencyInput) => {
    return $fetch<Currency>(urlBase, {
      method: 'POST',
      body: data
    })
  }

  const update = (id: string, data: UpdateCurrencyInput) => {
    return $fetch<Currency>(`${urlBase}/${id}`, {
      method: 'PATCH',
      body: data
    })
  }

  const remove = (id: string) => {
    return $fetch<void>(`${urlBase}/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    findAll,
    findOne,
    getBaseCurrency,
    create,
    update,
    remove
  }
}
