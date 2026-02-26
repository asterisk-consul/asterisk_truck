// stores/vehicles.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useVehiclesService } from '~/services/logistica/transport/vehicles.service'
import type {
  Vehicle,
  CreateVehicleInput
} from '~/types/logistica/transport/vehicles'

export const useVehiclesStore = defineStore('vehicles', () => {
  const service = useVehiclesService()

  const vehicles = ref<Vehicle[]>([])
  const loading = ref(false)

  const fetchVehicles = async (companyId: string) => {
    try {
      loading.value = true
      const data = await service.getAll(companyId)
      vehicles.value = data
    } finally {
      loading.value = false
    }
  }

  const createVehicle = async (payload: CreateVehicleInput) => {
    const vehicle = await service.create(payload)
    vehicles.value.push(vehicle)
    return vehicle
  }

  return {
    vehicles,
    loading,
    fetchVehicles,
    createVehicle
  }
})
