import type {
  SalesSummaryResponse,
  SalesMovement,
  SummaryFilters
} from './types/salesReports.types'

export const SalesService = {
  async getSummary(filters?: SummaryFilters): Promise<SalesSummaryResponse> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.set('startDate', filters.startDate)
    if (filters?.endDate) params.set('endDate', filters.endDate)
    if (filters?.supplierId) params.set('supplierId', filters.supplierId)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return $fetch(`/api/erp/sales-reports/summary${qs}`)
  },

  async getMovements(
    filters?: SummaryFilters & { productId?: string }
  ): Promise<SalesMovement[]> {
    const params = new URLSearchParams()

    if (filters?.startDate) params.set('startDate', filters.startDate)
    if (filters?.endDate) params.set('endDate', filters.endDate)
    if (filters?.supplierId) params.set('supplierId', filters.supplierId)

    // 🔥 CLAVE
    if (filters?.productId) params.set('productId', filters.productId)

    const qs = params.toString() ? `?${params.toString()}` : ''

    return $fetch(`/api/erp/sales-reports/movements${qs}`)
  },

  async getProducts() {
    return $fetch('/api/erp/sales-reports/products')
  },

  async getProductById(id: number | string) {
    return $fetch(`/api/erp/sales-reports/products/${id}`)
  }
}
