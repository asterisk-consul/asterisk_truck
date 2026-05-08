import type { Document } from '~/modulos/erp/facturas/types/factura.types'

export const DocumentsSalesService = {
  async getAll(params?: {
    documentTypeId?: string
    status?: number
  }): Promise<Document[]> {
    return $fetch('/api/erp/documents/sales', {
      query: params
    })
  },

  async getOne(id: string): Promise<Document> {
    return $fetch(`/api/erp/documents/sales/${id}`)
  },

  async create(dto: any): Promise<Document> {
    return $fetch('/api/erp/documents/sales', {
      method: 'POST' as any,
      body: dto
    })
  },

  async update(id: string, dto: any): Promise<Document> {
    return $fetch(`/api/erp/documents/sales/${id}`, {
      method: 'PATCH' as any,
      body: dto
    })
  },
  async confirm(id: string): Promise<Document> {
    return $fetch(`/api/erp/documents/sales/${id}/confirm`, {
      method: 'PATCH' as any
    })
  },

  async cancel(id: string): Promise<Document> {
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
