import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { TaxesService } from '~/modulos/erp/taxes/services/taxes.service'

import type {
  Tax,
  CreateTaxDto,
  UpdateTaxDto
} from '~/modulos/erp/taxes/types/taxes.types'

export const useTaxesStore = defineStore('taxes', () => {
  const items = ref<Tax[]>([])
  const current = ref<Tax | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  /* =========================
   * Getters
   * ========================= */

  const activeTaxes = computed(() => items.value.filter((tax) => tax.active))

  const percentageTaxes = computed(() =>
    items.value.filter((tax) => tax.is_percentage)
  )

  const fixedTaxes = computed(() =>
    items.value.filter((tax) => !tax.is_percentage)
  )

  /* =========================
   * Actions
   * ========================= */

  const fetchAll = async () => {
    loading.value = true
    error.value = null

    try {
      items.value = await TaxesService.getAll()

      return items.value
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const create = async (payload: Omit<CreateTaxDto, 'company_id'>) => {
    loading.value = true
    error.value = null

    try {
      const created = await TaxesService.create(payload)

      items.value.unshift(created)

      return created
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const update = async (id: string, payload: UpdateTaxDto) => {
    loading.value = true
    error.value = null

    try {
      const updated = await TaxesService.update(id, payload)

      const index = items.value.findIndex((t) => t.id === id)

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

  const remove = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await TaxesService.remove(id)

      items.value = items.value.filter((t) => t.id !== id)

      if (current.value?.id === id) {
        current.value = null
      }
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const setCurrent = (tax: Tax | null) => {
    current.value = tax
  }

  const clearError = () => {
    error.value = null
  }

  return {
    /* state */
    items,
    current,
    loading,
    error,

    /* getters */
    activeTaxes,
    percentageTaxes,
    fixedTaxes,

    /* actions */
    fetchAll,
    create,
    update,
    remove,
    setCurrent,
    clearError
  }
})
