import { defineStore } from 'pinia'
import { useChoferesService } from '~/services/logistica/transport/choferes.service'
import type {
  Driver,
  CreateDriverInput
} from '~/types/logistica/transport/drivers'

export const useChoferesStore = defineStore('choferes', () => {
  const drivers = ref<Driver[]>([])
  const current = ref<Driver | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)

  const service = useChoferesService()

  // ========================================
  // GET ALL
  // ========================================
  const fetchAll = async (companyId: string) => {
    loading.value = true
    error.value = null

    try {
      drivers.value = await service.getAll(companyId)
    } catch (err: any) {
      error.value = err?.data?.message || err.message
    } finally {
      loading.value = false
    }
  }

  // ========================================
  // CREATE
  // ========================================
  const createDriver = async (payload: CreateDriverInput) => {
    loading.value = true
    error.value = null

    try {
      const newDriver = await service.create(payload)
      drivers.value.push(newDriver)
      return newDriver
    } catch (err: any) {
      error.value = err?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    drivers,
    current,
    loading,
    error,
    fetchAll,
    createDriver
  }
})
