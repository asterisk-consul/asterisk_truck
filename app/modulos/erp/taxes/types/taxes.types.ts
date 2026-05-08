export interface Tax {
  id: string
  company_id: string
  code: string
  name: string
  tax_type: string
  rate: number
  is_percentage: boolean
  active: boolean
  calculation_level: string
}

export interface CreateTaxDto {
  company_id: string
  code: string
  name: string
  tax_type: string
  rate: number
  is_percentage: boolean
  active: boolean
  calculation_level: string
}

export type UpdateTaxDto = Partial<CreateTaxDto>
