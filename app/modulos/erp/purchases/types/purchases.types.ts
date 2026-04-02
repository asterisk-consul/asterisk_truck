export interface PurchaseSummaryItem {
  productCode: string
  productName: string
  totalQuantity: number
  totalCost: number
  unitPrice: number
  supplier?: string
}

export interface PurchaseSummaryBySupplier {
  supplier: string
  supplierCode: string
  totalCost: number
  products: PurchaseSummaryItem[]
}

export interface PurchaseSummaryResponse {
  globalTotal: number
  bySupplier: PurchaseSummaryBySupplier[]
}

export interface PurchaseMovement {
  ref: string
  number: string
  date: string
  supplierName: string
  supplierCode: string
  productId: number | null
  productCode: string
  productName: string
  documentTypeCode: string
  documentTypeName: string
  quantity: number
  unitPrice: number
  itemSubtotal: number
  documentSubtotal: number
  documentTotal: number
  taxCode: string
  taxName: string
  taxAmount: number
  sequenceNumber: string
  transactionType: string
  adjustedValue: number
}

export interface SummaryFilters {
  startDate?: string
  endDate?: string
  supplierId?: string
}
