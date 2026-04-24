import type { SaleDocument } from './types/sales.types'

export const DocumentsSalesService = {
  async getAll(params?: {
    documentTypeId?: string
    status?: number
  }): Promise<SaleDocument[]> {
    return $fetch('/api/erp/documents/sales', {
      query: params
    })
  },

  async getOne(id: string): Promise<SaleDocument> {
    return $fetch(`/api/erp/documents/sales/${id}`)
  },

  async create(dto: any): Promise<SaleDocument> {
    return $fetch('/api/erp/documents/sales', {
      method: 'POST' as any,
      body: dto
    })
  },

  async update(id: string, dto: any): Promise<SaleDocument> {
    return $fetch(`/api/erp/documents/sales/${id}`, {
      method: 'PATCH' as any,
      body: dto
    })
  },
  async confirm(id: string): Promise<SaleDocument> {
    return $fetch(`/api/erp/documents/sales/${id}/confirm`, {
      method: 'PATCH' as any
    })
  },

  async cancel(id: string): Promise<SaleDocument> {
    return $fetch(`/api/erp/documents/sales/${id}/cancel`, {
      method: 'PATCH' as any
    })
  },

  async remove(id: string): Promise<void> {
    return $fetch(`/api/erp/documents/sales/${id}`, { method: 'DELETE' as any })
  },

  async generateFromAllTrips(): Promise<{
    total_trips: number
    results: any[]
  }> {
    return $fetch('/api/erp/documents/sales/generate', {
      method: 'POST' as any
    })
  }
}
