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
      newCombinationPayload: CreateVehicleCombinationInput
    ) => {
      loading.value = true
      error.value = null

      try {
        const { tractor_id, trailer_id, driver_id } = newCombinationPayload

        // console.log('🚀 REASSIGN - payload:', {
        //   tractor_id,
        //   trailer_id,
        //   driver_id
        // })

        // Combo destino = la que tiene el mismo tractor (actualizar, no recrear)
        const destinationCombo = items.value.find(
          (combo) =>
            !combo.valid_until && tractor_id && combo.tractor_id === tractor_id
        )

        // Afectadas = solo las que tienen trailer o driver en conflicto
        // (excluimos la destino para no procesarla dos veces)
        const affectedCombos = items.value.filter((combo) => {
          if (combo.valid_until) return false
          if (combo.tractor_id === tractor_id) return false
          return (
            (trailer_id && combo.trailer_id === trailer_id) ||
            (driver_id && combo.driver_id === driver_id)
          )
        })

        // console.log('🎯 destinationCombo:', destinationCombo?.unit_number)
        // console.log(
        //   '⚠️ affectedCombos:',
        //   affectedCombos.map((c) => ({
        //     id: c.id,
        //     unit: c.unit_number,
        //     tractor: c.tractor_id,
        //     trailer: c.trailer_id,
        //     driver: c.driver_id
        //   }))
        // )

        // PASO 1 — Clasificar: update vs cerrar+reconstruir
        const toUpdate: typeof affectedCombos = []
        const toClose: typeof affectedCombos = []

        for (const combo of affectedCombos) {
          const conflictsTrailer = trailer_id && combo.trailer_id === trailer_id
          const conflictsDriver = driver_id && combo.driver_id === driver_id

          if (!conflictsTrailer && !conflictsDriver) {
            toUpdate.push(combo)
          } else {
            toClose.push(combo)
          }
        }

        // console.log(
        //   '🔄 toUpdate:',
        //   toUpdate.map((c) => c.unit_number)
        // )
        // console.log(
        //   '🔴 toClose:',
        //   toClose.map((c) => c.unit_number)
        // )

        // PASO 2 — Calcular reconstrucciones ANTES de cerrar nada
        const takenTractors = new Set(tractor_id ? [tractor_id] : [])
        const takenTrailers = new Set(trailer_id ? [trailer_id] : [])
        const takenDrivers = new Set(driver_id ? [driver_id] : [])

        const reconstructions: CreateVehicleCombinationInput[] = []

        for (const combo of toClose) {
          const remainingTractor =
            combo.tractor_id && !takenTractors.has(combo.tractor_id)
              ? combo.tractor_id
              : undefined
          const remainingTrailer =
            combo.trailer_id && !takenTrailers.has(combo.trailer_id)
              ? combo.trailer_id
              : undefined
          const remainingDriver =
            combo.driver_id && !takenDrivers.has(combo.driver_id)
              ? combo.driver_id
              : undefined

          const isViable = !!remainingTractor

          const hasAnythingWorthKeeping =
            (!!combo.trailer_id && combo.trailer_id !== trailer_id) ||
            (!!combo.driver_id && combo.driver_id !== driver_id)

          // console.log('🔧 Remaining para combo', combo.unit_number, {
          //   remainingTractor,
          //   remainingTrailer,
          //   remainingDriver,
          //   isViable,
          //   hasAnythingWorthKeeping
          // })

          if (isViable && hasAnythingWorthKeeping) {
            reconstructions.push({
              unit_number: combo.unit_number ?? undefined,
              tractor_id: remainingTractor,
              trailer_id: remainingTrailer ?? undefined,
              driver_id: remainingDriver ?? undefined,
              valid_from: newCombinationPayload.valid_from,
              valid_until: undefined
            })
          }
        }

        // PASO 3 — Actualizar las que no tienen conflicto real
        for (const combo of toUpdate) {
          // console.log('🔄 Actualizando combo (sin cerrar):', combo.unit_number)
          await update(combo.id, {
            unit_number: combo.unit_number ?? undefined,
            valid_from: combo.valid_from,
            valid_until: combo.valid_until ?? undefined,
            tractor_id: combo.tractor_id,
            trailer_id: combo.trailer_id ?? undefined,
            driver_id: combo.driver_id ?? undefined
          })
        }

        // PASO 4 — Cerrar las que tienen conflicto
        for (const combo of toClose) {
          // console.log('🔴 Cerrando combo:', {
          //   id: combo.id,
          //   unit: combo.unit_number
          // })
          await finish(combo.id)
        }

        // PASO 5 — Reconstruir las viables (ya sin conflictos activos)
        for (const newCombo of reconstructions) {
          // console.log('🟢 Creando combo reconstruida:', newCombo)
          await create(newCombo)
        }

        // PASO 6 — Actualizar o crear la combo destino
        if (destinationCombo) {
          // console.log(
          //   '🔄 Actualizando combo destino:',
          //   destinationCombo.unit_number
          // )
          const updated = await update(destinationCombo.id, {
            unit_number: destinationCombo.unit_number ?? undefined,
            valid_from: destinationCombo.valid_from,
            valid_until: undefined,
            tractor_id,
            trailer_id: trailer_id ?? undefined,
            driver_id: driver_id ?? undefined
          })
          return updated
        } else {
          // console.log('🆕 Creando nueva combinación destino')
          return await create(newCombinationPayload)
        }
      } catch (err: any) {
        // console.error('❌ Error completo:', err)
        // console.error('❌ Response data:', err?.response?.data || err?.data)
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
