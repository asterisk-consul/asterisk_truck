// stores/trips.store.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTripsService } from '~/services/logistica/transport/trips.service'
import type {
  Trip,
  CreateTripInput,
  AddTripCargoInput
} from '~/types/logistica/transport/trips'

export const useTripsStore = defineStore('trips', () => {
  const service = useTripsService()

  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const loading = ref(false)

  const fetchTrips = async (companyId: string) => {
    try {
      loading.value = true
      trips.value = await service.getAll(companyId)
    } finally {
      loading.value = false
    }
  }

  const createTrip = async (payload: CreateTripInput) => {
    try {
      loading.value = true
      const trip = await service.create(payload)
      trips.value.push(trip)
      return trip
    } finally {
      loading.value = false
    }
  }

  const startTrip = async (id: string) => {
    const updated = await service.start(id)

    const index = trips.value.findIndex((t) => t.id === id)
    if (index !== -1) trips.value[index] = updated

    return updated
  }

  const completeTrip = async (id: string) => {
    const updated = await service.complete(id)

    const index = trips.value.findIndex((t) => t.id === id)
    if (index !== -1) trips.value[index] = updated

    return updated
  }

  const addCargoToTrip = async (payload: AddTripCargoInput) => {
    const cargo = await service.addCargo(payload)

    const trip = trips.value.find((t) => t.id === payload.tripId)
    if (trip) {
      if (!trip.cargo) trip.cargo = []
      trip.cargo.push(cargo)
    }

    return cargo
  }

  return {
    trips,
    currentTrip,
    loading,
    fetchTrips,
    createTrip,
    startTrip,
    completeTrip,
    addCargoToTrip
  }
})
