import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useProductsService } from '~/modulos/logistica/master-data/product/product.service'
import type {
  Product,
  CreateProductInput,
  UpdateProductInput
} from '~/modulos/logistica/master-data/product/product.types'

export const useProductsStore = defineStore('products', () => {
  const service = useProductsService()

  const items = ref<Product[]>([])
  const current = ref<Product | null>(null)
  const loading = ref(false)

  // =========================
  // LOAD ALL
  // =========================
  const fetchAll = async () => {
    try {
      loading.value = true
      items.value = await service.findAll()
    } finally {
      loading.value = false
    }
  }

  // =========================
  // LOAD ONE
  // =========================
  const fetchOne = async (id: string) => {
    try {
      loading.value = true
      const data = await service.findOne(id)
      current.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  // =========================
  // CREATE
  // =========================
  const create = async (payload: CreateProductInput) => {
    const created = await service.create(payload)
    return created
  }

  // =========================
  // UPDATE
  // =========================
  const update = async (id: string, payload: UpdateProductInput) => {
    const updated = await service.update(id, payload)

    const index = items.value.findIndex((i) => i.id === id)
    if (index !== -1) {
      items.value[index] = updated
    }

    if (current.value?.id === id) {
      current.value = updated
    }

    return updated
  }

  // =========================
  // DELETE
  // =========================
  const remove = async (id: string) => {
    await service.remove(id)

    items.value = items.value.filter((i) => i.id !== id)

    if (current.value?.id === id) {
      current.value = null
    }
  }

  return {
    items,
    current,
    loading,
    fetchAll,
    fetchOne,
    create,
    update,
    remove
  }
})
