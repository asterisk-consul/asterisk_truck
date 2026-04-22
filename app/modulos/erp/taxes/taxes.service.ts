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

export interface TaxFilters {
  company_id?: string
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

export type UpdateTaxDto = Partial<Omit<CreateTaxDto, 'company_id'>>

export const TaxesService = {
  async getAll(filters?: TaxFilters): Promise<Tax[]> {
    const params = new URLSearchParams()
    const qs = params.toString() ? `?${params.toString()}` : ''
    return $fetch(`/api/erp/taxes${qs}`)
  },

  async create(dto: CreateTaxDto): Promise<Tax> {
    return $fetch('/api/erp/taxes', {
      method: 'POST',
      body: dto
    })
  },

  async update(id: string, dto: UpdateTaxDto): Promise<Tax> {
    return $fetch(`/api/erp/taxes/${id}`, {
      method: 'PATCH',
      body: dto
    })
  }
}
