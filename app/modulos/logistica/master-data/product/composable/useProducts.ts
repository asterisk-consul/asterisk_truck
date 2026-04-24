import { computed, type Ref } from 'vue'
import type { Product } from '~/modulos/logistica/master-data/product/product.types'

export interface ProductSelectItem {
  label: string
  value: string
  price: number
  tax?: {
    id: string
    rate: number
  }
}

export function useProducts(products: Ref<Product[]>) {
  const items = computed<ProductSelectItem[]>(() =>
    products.value.map((product) => {
      const price = product.product_price?.[0]?.price ?? 0
      const tax = product.product_taxes?.[0]

      return {
        label: `${product.sku} - ${product.name}`,
        value: product.id,
        price,
        tax: tax
          ? {
              id: tax.id,
              rate: tax.rate
            }
          : undefined
      }
    })
  )

  return { items }
}
