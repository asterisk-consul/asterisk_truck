export interface Tax {
  id: string
  code: string
  name: string
  tax_type: string
  rate: number
  is_percentage: boolean
  active: boolean
  calculation_level: string
}

export interface CreateTaxDto {
  code: string
  name: string
  tax_type: string
  rate: number
  is_percentage: boolean
  active: boolean
  calculation_level: string
}

export type UpdateTaxDto = Partial<CreateTaxDto>

export const TaxesService = {
  async getAll(): Promise<Tax[]> {
    return $fetch(`/api/erp/taxes`)
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
  },

  async remove(id: string): Promise<void> {
    return $fetch(`/api/erp/taxes/${id}`, { method: 'DELETE' })
  }
}
