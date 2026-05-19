export interface CurrencyRate {
  id: string

  from_currency_id: string
  to_currency_id: string

  rate: number

  effective_date?: string

  active?: boolean

  created_at?: string
  updated_at?: string
}

export interface CreateCurrencyRateInput {
  from_currency_id: string
  to_currency_id: string

  rate: number

  effective_date?: string

  active?: boolean
}

export interface UpdateCurrencyRateInput extends Partial<CreateCurrencyRateInput> {}
