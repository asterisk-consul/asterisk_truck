export interface Product {
  id: string
  name: string
  sku?: string

  requires_refrigeration?: boolean

  price_enabled: boolean
  is_rate_type: boolean
  rate_id?: string | null

  taxId?: string | null

  created_at: string
  updated_at: string
  deleted_at?: string | null

  created_by?: string | null
  updated_by?: string | null
  deleted_by?: string | null

  active?: boolean

  // ── Relaciones ─────────────────────────────

  product_price?: ProductPrice[]
  product_taxes?: ProductTax[]

  transfer_rate?: TransferRate | null
}

export interface ProductPrice {
  id: string
  product_id: string
  price: number

  // opcional pero recomendable si lo tenés
  is_default?: boolean

  created_at?: string
  updated_at?: string
}

export interface ProductTax {
  id: string
  product_id: string
  tax_id: string
  rate: number

  // opcional
  is_default?: boolean
}
export interface TransferRate {
  id: string
  // agregá campos reales si los usás
}
export type CreateProductInput = Omit<
  Product,
  'id' | 'created_at' | 'updated_at'
>

export type UpdateProductInput = Partial<CreateProductInput>
