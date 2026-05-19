import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { useCurrenciesService } from '~/modulos/erp/currencies/service/currencies.service'

import type {
  Currency,
  CreateCurrencyInput,
  UpdateCurrencyInput
} from '~/modulos/erp/currencies/types/currencies.types'

export const useCurrenciesStore = defineStore('currencies', () => {
  const service = useCurrenciesService()

  const items = ref<Currency[]>([])
  const current = ref<Currency | null>(null)
  const baseCurrency = ref<Currency | null>(null)

  const loading = ref(false)

  // =========================
  // COMPUTEDS
  // =========================

  const activeItems = computed(() =>
    items.value.filter((i) => i.active !== false)
  )

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
  // BASE CURRENCY
  // =========================

  const fetchBaseCurrency = async () => {
    try {
      loading.value = true

      const data = await service.getBaseCurrency()

      baseCurrency.value = data

      return data
    } finally {
      loading.value = false
    }
  }

  // =========================
  // CREATE
  // =========================

  const create = async (payload: CreateCurrencyInput) => {
    const created = await service.create(payload)

    items.value.push(created)

    return created
  }

  // =========================
  // UPDATE
  // =========================

  const update = async (id: string, payload: UpdateCurrencyInput) => {
    const updated = await service.update(id, payload)

    const index = items.value.findIndex((i) => i.id === id)

    if (index !== -1) {
      items.value[index] = updated
    }

    if (current.value?.id === id) {
      current.value = updated
    }

    if (baseCurrency.value?.id === id) {
      baseCurrency.value = updated
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

    if (baseCurrency.value?.id === id) {
      baseCurrency.value = null
    }
  }

  return {
    // state
    items,
    current,
    baseCurrency,
    loading,

    // computed
    activeItems,

    // actions
    fetchAll,
    fetchOne,
    fetchBaseCurrency,
    create,
    update,
    remove
  }
})
