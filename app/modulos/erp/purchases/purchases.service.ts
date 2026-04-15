import type {
  PurchaseSummaryResponse,
  PurchaseMovement,
  SummaryFilters
} from '../purchases/types/purchases.types'

export const PurchasesService = {
  async getSummary(filters?: SummaryFilters): Promise<PurchaseSummaryResponse> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.set('startDate', filters.startDate)
    if (filters?.endDate) params.set('endDate', filters.endDate)
    if (filters?.supplierId) params.set('supplierId', filters.supplierId)
    const qs = params.toString() ? `?${params.toString()}` : ''
    return $fetch(`/api/erp/purchases/summary${qs}`)
  },

  async getMovements(
    filters?: SummaryFilters & { productId?: string }
  ): Promise<PurchaseMovement[]> {
    const params = new URLSearchParams()

    if (filters?.startDate) params.set('startDate', filters.startDate)
    if (filters?.endDate) params.set('endDate', filters.endDate)
    if (filters?.supplierId) params.set('supplierId', filters.supplierId)

    // 🔥 CLAVE
    if (filters?.productId) params.set('productId', filters.productId)

    const qs = params.toString() ? `?${params.toString()}` : ''

    return $fetch(`/api/erp/purchases/movements${qs}`)
  },

  async getProducts() {
    return $fetch('/api/erp/purchases/products')
  },

  async getProductById(id: number | string) {
    return $fetch(`/api/erp/purchases/products/${id}`)
  }
}
