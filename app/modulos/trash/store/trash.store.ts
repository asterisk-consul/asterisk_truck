import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTrashService } from '~/modulos/trash/services/trash.service'
import type { TrashItem } from '~/modulos/trash/types/trash.types'

export const useTrashStore = defineStore('trash', () => {
  const items = ref<TrashItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const service = useTrashService()

  // 🗑️ FETCH ALL
  const fetchAll = async (params?: { days?: number; table?: string }) => {
    loading.value = true
    error.value = null
    try {
      items.value = await service.getAll(params)
    } catch (err: any) {
      error.value = err?.data?.message || err.message
    } finally {
      loading.value = false
    }
  }

  // 🗑️ SOFT DELETE (optimista)
  const softDelete = async (table: string, id: string) => {
    error.value = null
    try {
      await service.softDelete(table, id)

      // 🔥 opcional: lo quitás del listado actual si estás mostrando activos
      items.value = items.value.filter(
        (item) => !(item.id === id && item.table === table)
      )
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    }
  }

  // ♻️ RESTORE
  const restore = async (table: string, id: string) => {
    error.value = null
    try {
      await service.restore(table, id)

      // 🔥 lo saco de la papelera
      items.value = items.value.filter(
        (item) => !(item.id === id && item.table === table)
      )
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    }
  }

  // 🗑️ BULK DELETE
  const softDeleteMany = async (table: string, ids: string[]) => {
    loading.value = true
    error.value = null
    try {
      await service.softDeleteMany(table, ids)

      items.value = items.value.filter(
        (item) => !(item.table === table && ids.includes(item.id))
      )
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ♻️ BULK RESTORE
  const restoreMany = async (table: string, ids: string[]) => {
    loading.value = true
    error.value = null
    try {
      await service.restoreMany(table, ids)

      items.value = items.value.filter(
        (item) => !(item.table === table && ids.includes(item.id))
      )
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 💀 HARD DELETE
  const hardDeleteMany = async (table: string, ids: string[]) => {
    loading.value = true
    error.value = null
    try {
      await service.hardDeleteMany(table, ids)

      items.value = items.value.filter(
        (item) => !(item.table === table && ids.includes(item.id))
      )
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
    loading,
    error,
    fetchAll,
    softDelete,
    restore,
    softDeleteMany,
    restoreMany,
    hardDeleteMany,
    clearError
  }
})
