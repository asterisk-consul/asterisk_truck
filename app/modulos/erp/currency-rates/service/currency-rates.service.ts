import type {
  CurrencyRate,
  CreateCurrencyRateInput,
  UpdateCurrencyRateInput
} from '~/modulos/erp/currency-rates/types/currency-rates.types'

const urlBase = '/api/erp/currencies-rate'

export const useCurrencyRatesService = () => {
  const findAll = () => {
    return $fetch<CurrencyRate[]>(urlBase, {
      method: 'GET'
    })
  }

  const findOne = (id: string) => {
    return $fetch<CurrencyRate>(`${urlBase}/${id}`)
  }

  const create = (data: CreateCurrencyRateInput) => {
    return $fetch<CurrencyRate>(urlBase, {
      method: 'POST',
      body: data
    })
  }

  const update = (id: string, data: UpdateCurrencyRateInput) => {
    return $fetch<CurrencyRate>(`${urlBase}/${id}`, {
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
    create,
    update,
    remove
  }
}
