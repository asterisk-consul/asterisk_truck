export interface Currency {
  id: string
  code: string
  name: string
  symbol?: string

  exchange_rate?: number

  is_base?: boolean
  active?: boolean

  created_at?: string
  updated_at?: string
}

export interface CreateCurrencyInput {
  code: string
  name: string

  symbol?: string
  exchange_rate?: number

  is_base?: boolean
  active?: boolean
}

export interface UpdateCurrencyInput extends Partial<CreateCurrencyInput> {}
