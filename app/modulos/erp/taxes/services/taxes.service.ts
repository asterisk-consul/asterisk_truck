import type {
  CreateTaxDto,
  Tax,
  UpdateTaxDto
} from '~/modulos/erp/taxes/types/taxes.types'

export const TaxesService = {
  async getAll(): Promise<Tax[]> {
    return $fetch(`/api/erp/taxes`)
  },

  async create(dto: Omit<CreateTaxDto, 'company_id'>): Promise<Tax> {
    return $fetch('/api/erp/taxes', {
      method: 'POST',
      body: { ...dto }
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
