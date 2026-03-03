import { computed, type Ref } from 'vue'
import type { Product } from '~/types/logistica/master-data/product'

export const useProductsMetrics = (items: Ref<Product[]>) => {
  const total = computed(() => items.value.length)

  return {
    total
  }
}
