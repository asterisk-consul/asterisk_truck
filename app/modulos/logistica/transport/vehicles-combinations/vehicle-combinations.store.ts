import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useVehicleCombinationsService } from '~/modulos/logistica/transport/vehicles-combinations/vehicles-combinations.service'
import type {
  VehicleCombination,
  CreateVehicleCombinationInput,
  UpdateVehicleCombinationInput
} from '~/modulos/logistica/transport/vehicles-combinations/types/vehicles-combinations.types'

export const useVehicleCombinationsStore = defineStore(
  'vehicleCombinations',
  () => {
    const items = ref<VehicleCombination[]>([])
    const available = ref<VehicleCombination[]>([])
    const current = ref<VehicleCombination | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const service = useVehicleCombinationsService()

    const fetchAll = async () => {
      loading.value = true
      error.value = null
      try {
        items.value = await service.getAll()
      } catch (err: any) {
        error.value = err?.data?.message || err.message
      } finally {
        loading.value = false
      }
    }

    const fetchActive = async () => {
      loading.value = true
      error.value = null
      try {
        items.value = await service.getActive()
      } catch (err: any) {
        error.value = err?.data?.message || err.message
      } finally {
        loading.value = false
      }
    }

    const fetchOne = async (id: string) => {
      loading.value = true
      error.value = null
      try {
        const vehicle = await service.getById(id)
        current.value = vehicle
        const index = items.value.findIndex((v) => v.id === id)
        if (index !== -1) items.value[index] = vehicle
        return vehicle
      } catch (err: any) {
        error.value = err?.data?.message || err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const create = async (payload: CreateVehicleCombinationInput) => {
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
    const fetchAvailable = async (date: string) => {
      loading.value = true
      error.value = null

      try {
        available.value = await service.getAvailable(date)
      } catch (err: any) {
        error.value = err?.data?.message || err.message
      } finally {
        loading.value = false
      }
    }

    const update = async (
      id: string,
      payload: UpdateVehicleCombinationInput
    ) => {
      loading.value = true
      error.value = null
      try {
        const updated = await service.update(id, payload)
        const index = items.value.findIndex((v) => v.id === id)
        if (index !== -1) items.value[index] = updated
        if (current.value?.id === id) current.value = updated
        return updated
      } catch (err: any) {
        error.value = err?.data?.message || err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const finish = async (id: string) => {
      loading.value = true
      error.value = null
      try {
        const finished = await service.finish(id)
        const index = items.value.findIndex((v) => v.id === id)
        if (index !== -1) items.value[index] = finished
        if (current.value?.id === id) current.value = finished
        return finished
      } catch (err: any) {
        error.value = err?.data?.message || err.message
        throw err
      } finally {
        loading.value = false
      }
    }
    const activate = async (id: string) => {
      loading.value = true
      error.value = null

      try {
        await service.activate(id)
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
        await service.remove(id)
        items.value = items.value.filter((v) => v.id !== id)
        if (current.value?.id === id) current.value = null
      } catch (err: any) {
        error.value = err?.data?.message || err.message
        throw err
      } finally {
        loading.value = false
      }
    }
    const reassign = async (
      unitNumber: string,
      newCombinationPayload: CreateVehicleCombinationInput
    ) => {
      loading.value = true
      error.value = null

      try {
        const activeCombo = items.value.find(
          (combo) => !combo.valid_until && combo.unit_number === unitNumber
        )

        if (activeCombo) {
          await finish(activeCombo.id)
        }

        const created = await create(newCombinationPayload)
        return created
      } catch (err: any) {
        error.value = err?.data?.message || err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    // const buildRemainingPayload = (
    //   combo: VehicleCombination,
    //   removedElementId: string
    // ): CreateVehicleCombinationInput | null => {
    //   const remaining: Partial<CreateVehicleCombinationInput> = {
    //     tractor_id:
    //       combo.tractor_id !== removedElementId ? combo.tractor_id : undefined,
    //     trailer_id:
    //       combo.trailer_id !== removedElementId
    //         ? (combo.trailer_id ?? undefined)
    //         : undefined,
    //     driver_id:
    //       combo.driver_id !== removedElementId
    //         ? (combo.driver_id ?? undefined)
    //         : undefined
    //     // copiá acá los demás campos requeridos por CreateVehicleCombinationInput
    //   }

    //   // Regla mínima de viabilidad — ajustá según tu negocio
    //   const isViable = !!remaining.tractor_id && !!remaining.driver_id

    //   return isViable ? (remaining as CreateVehicleCombinationInput) : null
    // }
    const clearError = () => {
      error.value = null
    }

    return {
      items,
      available,
      current,
      loading,
      error,
      fetchAll,
      fetchActive,
      fetchOne,
      create,
      update,
      finish,
      activate,
      remove,
      clearError,
      fetchAvailable,
      reassign
    }
  }
)
