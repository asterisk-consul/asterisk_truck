export interface DocumentTax {
  id: string
  tax_id: string
  tax_rate: number
  taxable_base: number
  tax_amount: number
  taxes: {
    id: string
    code: string
    name: string
    tax_type: string
    rate: number
    is_percentage: boolean
  }
}

export interface DocumentItemTax {
  id: string
  tax_id: string
  tax_rate: number
  tax_amount: number
  taxes: {
    id: string
    code: string
    name: string
    tax_type: string
  }
}

export interface DocumentItem {
  id: string
  document_id: string
  product_id: string | null
  quantity: number
  unit_price: number
  price: number
  products: {
    id: string
    name: string
    sku: string | null
  } | null
  document_item_taxes: DocumentItemTax[]
}

export interface SaleDocument {
  id: string
  document_type_id: string
  party_id: string | null
  number: number
  date: string
  status: number
  subtotal: number
  exempt_amount: number
  total_taxes: number
  total: number
  descrip: string | null
  ref: string | null
  created_at: string
  updated_at: string
  document_types: {
    id: string
    code: string
    description: string
    direction: number
  }
  business_parties: {
    id: string
    name: string
    tax_id: string | null
  } | null
  document_items: DocumentItem[]
  document_taxes: DocumentTax[]
}

export const STATUS_LABELS: Record<number, string> = {
  0: 'Borrador',
  1: 'Pendiente',
  2: 'Confirmado',
  3: 'Anulado'
}

export const STATUS_COLORS: Record<number, string> = {
  0: 'neutral',
  1: 'warning',
  2: 'success',
  3: 'error'
}
