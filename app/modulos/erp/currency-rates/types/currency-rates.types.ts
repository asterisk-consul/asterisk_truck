export interface CurrencyReference {
  id: string

  code: string
  name: string
  symbol: string

  is_base?: boolean
  active?: boolean

  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  created_by?: string | null
  updated_by?: string | null
  deleted_by?: string | null
}

export interface CurrencyRate {
  id: string

  from_currency_id: string
  to_currency_id: string

  rate: number

  source?: string
  rate_type?: string

  effective_date?: string

  active?: boolean

  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  created_by?: string | null
  updated_by?: string | null
  deleted_by?: string | null

  from_currency?: CurrencyReference
  to_currency?: CurrencyReference
}

export interface CreateCurrencyRateInput {
  from_currency_id: string
  to_currency_id: string

  rate: number

  source?: string
  rate_type?: string

  effective_date?: string

  active?: boolean
}

export interface UpdateCurrencyRateInput extends Partial<CreateCurrencyRateInput> {}

export interface CurrencyRateFilters {
  from_currency_id?: string
  to_currency_id?: string

  source?: string
  rate_type?: string

  active?: boolean

  effective_date_from?: string
  effective_date_to?: string

  search?: string
}
