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

export type UpdateTaxDto = Partial<Omit<CreateTaxDto, 'company_id'>>

const COMPANY_ID = '9af6e716-d26a-45f3-9afa-68c346e1628f'

export const TaxesService = {
  async getAll(): Promise<Tax[]> {
    return $fetch(`/api/erp/taxes?company_id=${COMPANY_ID}`)
  },

  async create(dto: Omit<CreateTaxDto, 'company_id'>): Promise<Tax> {
    return $fetch('/api/erp/taxes', {
      method: 'POST',
      body: { ...dto, company_id: COMPANY_ID }
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
