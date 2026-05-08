import { defineStore } from 'pinia'
import { ref } from 'vue'

import { DocumentsSalesService } from '~/modulos/erp/sales/services/sales.service'

import type { Document } from '~/modulos/erp/facturas/types/factura.types'

export const useDocumentsSalesStore = defineStore(
  'documents-sales',

  () => {
    // ─────────────────────────────────────
    // State
    // ─────────────────────────────────────
    const items = ref<Document[]>([])

    const current = ref<Document | null>(null)

    const loading = ref(false)

    const error = ref<string | null>(null)

    // ─────────────────────────────────────
    // Fetch all
    // ─────────────────────────────────────
    const fetchAll = async (params?: {
      status?: number
      documentTypeId?: string
    }) => {
      loading.value = true

      error.value = null

      try {
        const response = await DocumentsSalesService.getAll(params)

        items.value = response

        return response
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error loading documents'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Fetch one
    // ─────────────────────────────────────
    const fetchOne = async (id: string) => {
      loading.value = true

      error.value = null

      try {
        const response = await DocumentsSalesService.getOne(id)

        current.value = response

        const index = items.value.findIndex((i) => i.id === id)

        if (index !== -1) {
          items.value[index] = response
        }

        return response
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error loading document'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Create
    // ─────────────────────────────────────
    const create = async (payload: any) => {
      loading.value = true

      error.value = null

      try {
        const response = await DocumentsSalesService.create(payload)

        items.value.unshift(response)

        return response
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error creating document'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Update
    // ─────────────────────────────────────
    const update = async (id: string, payload: any) => {
      loading.value = true

      error.value = null

      try {
        const response = await DocumentsSalesService.update(id, payload)

        const index = items.value.findIndex((i) => i.id === id)

        if (index !== -1) {
          items.value[index] = response
        }

        if (current.value?.id === id) {
          current.value = response
        }

        return response
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error updating document'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Confirm
    // ─────────────────────────────────────
    const confirm = async (id: string) => {
      loading.value = true

      error.value = null

      try {
        const response = await DocumentsSalesService.confirm(id)

        const index = items.value.findIndex((i) => i.id === id)

        if (index !== -1) {
          items.value[index] = response
        }

        if (current.value?.id === id) {
          current.value = response
        }

        return response
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error confirming document'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Cancel
    // ─────────────────────────────────────
    const cancel = async (id: string) => {
      loading.value = true

      error.value = null

      try {
        const response = await DocumentsSalesService.cancel(id)

        const index = items.value.findIndex((i) => i.id === id)

        if (index !== -1) {
          items.value[index] = response
        }

        if (current.value?.id === id) {
          current.value = response
        }

        return response
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error cancelling document'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Remove
    // ─────────────────────────────────────
    const remove = async (id: string) => {
      loading.value = true

      error.value = null

      try {
        await DocumentsSalesService.remove(id)

        items.value = items.value.filter((i) => i.id !== id)

        if (current.value?.id === id) {
          current.value = null
        }
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error deleting document'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Generate drafts
    // ─────────────────────────────────────
    const generateFromAllTrips = async () => {
      loading.value = true

      error.value = null

      try {
        return await DocumentsSalesService.generateFromAllTrips()
      } catch (err: any) {
        console.error(err)

        error.value =
          err?.data?.message || err?.message || 'Error generating documents'

        throw err
      } finally {
        loading.value = false
      }
    }

    // ─────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────
    const clearCurrent = () => {
      current.value = null
    }

    const clearError = () => {
      error.value = null
    }

    return {
      // state
      items,
      current,
      loading,
      error,

      // actions
      fetchAll,
      fetchOne,
      create,
      update,
      confirm,
      cancel,
      remove,
      generateFromAllTrips,

      // helpers
      clearCurrent,
      clearError
    }
  }
)
