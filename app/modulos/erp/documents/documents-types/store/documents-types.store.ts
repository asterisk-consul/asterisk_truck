import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useDocumentsTypesService } from '~/modulos/erp/documents/documents-types/services/documents-types.service'

import type {
  DocumentsType,
  CreateDocumentsTypeDto,
  UpdateDocumentsTypeDto
} from '~/modulos/erp/documents/documents-types/types/documents-types.types'

export const useDocumentsTypesStore = defineStore('documents-types', () => {
  const items = ref<DocumentsType[]>([])
  const current = ref<DocumentsType | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  const service = useDocumentsTypesService()

  const fetchAll = async () => {
    loading.value = true
    error.value = null

    try {
      items.value = await service.findAll()
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchOne = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const item = await service.findOne(id)

      current.value = item

      const index = items.value.findIndex((i) => i.id === id)

      if (index !== -1) {
        items.value[index] = item
      }

      return item
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const create = async (payload: CreateDocumentsTypeDto) => {
    loading.value = true
    error.value = null

    try {
      const created = await service.create(payload)

      items.value.unshift(created)

      return created
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (id: string, payload: UpdateDocumentsTypeDto) => {
    loading.value = true
    error.value = null

    try {
      const updated = await service.update(id, payload)

      const index = items.value.findIndex((i) => i.id === id)

      if (index !== -1) {
        items.value[index] = updated
      }

      if (current.value?.id === id) {
        current.value = updated
      }

      return updated
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    items,
    current,
    loading,
    error,

    fetchAll,
    fetchOne,
    create,
    update,

    clearError
  }
})
