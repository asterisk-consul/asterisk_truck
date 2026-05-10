// factura-form.types.ts

export interface Tax {
  id: string
  name: string
  code: string
  rate: number
}

export interface Product {
  id: string
  name: string
  code: string
}

export interface DocumentItemTax {
  tax_id: string

  tax_rate: number

  tax_amount: number

  taxes?: Tax
}

export interface DocumentItem {
  id: string

  product_id: string | null

  quantity: number

  unit_price: number

  price: number

  products?: Product | null

  document_item_taxes?: DocumentItemTax[]
}

export interface DocumentTax {
  tax_id: string

  tax_rate: number

  taxable_base: number

  tax_amount: number

  taxes?: Tax
}

export interface Document {
  id: string

  number: number
  document_type_id: string

  party_id: string | null

  date: string

  status: number

  subtotal: number

  exempt_amount: number

  total_taxes: number

  total: number

  descrip?: string | null

  ref?: string | null
  items: FacturaItem[]

  document_items?: DocumentItem[]

  document_taxes?: DocumentTax[]
}

export interface FacturaTax {
  tax_id: string

  name?: string

  code?: string

  tax_rate: number

  taxable_base?: number

  tax_amount: number

  calculation_level?: 'line' | 'document'

  is_included_in_price?: boolean
}

export interface FacturaItem {
  id?: string

  product_id: string | null

  product_name?: string

  product_code?: string

  quantity: number

  unit_price: number

  price: number

  subtotal?: number

  taxes: FacturaTax[]

  total_taxes?: number

  total: number
}

export interface FacturaFormValues {
  id?: string

  document_type_id: string

  party_id: string | null

  date: string

  descrip: string

  ref: string

  status?: number

  subtotal: number

  exempt_amount: number

  taxable_base?: number

  total_taxes: number

  total: number

  items: FacturaItem[]

  document_taxes: FacturaTax[]
}
