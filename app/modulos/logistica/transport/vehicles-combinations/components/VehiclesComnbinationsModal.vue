<script setup lang="ts">
import type { VehicleCombination } from '~/modulos/logistica/transport/vehicles-combinations/types/vehicles-combinations.types'
import type { VehicleCombinationForm } from '~/modulos/logistica/transport/vehicles-combinations/mappers/vehicle-combinations.mapper'
import { useVehicleCombinationsStore } from '~/modulos/logistica/transport/vehicles-combinations/vehicle-combinations.store'
import VehicleCombinationFormComponent from '~/modulos/logistica/transport/vehicles-combinations/components/VehiclesCombinationsForm.vue'
import { mapVehicleCombinationFormToCreateDto } from '~/modulos/logistica/transport/vehicles-combinations/mappers/vehicle-combinations.mapper'

import { useVehiclesStore } from '~/modulos/logistica/transport/vehicles/store/vehicles.store'
import { useChoferesStore } from '~/modulos/logistica/transport/drivers/choferes.store'

const props = defineProps<{
  vehicleCombinationId?: string
}>()

const emit = defineEmits<{
  success: [vehicleCombination: VehicleCombination]
}>()

const toast = useToast()
const open = defineModel<boolean>('open', { default: false })
const store = useVehicleCombinationsStore()

const loading = ref(false)

// En el modal - VehiclesComnbinationsModal.vue
const vehiclesStore = useVehiclesStore()
const choferesStore = useChoferesStore()

watch(
  () => [props.vehicleCombinationId, open.value] as const,
  async ([id, isOpen]) => {
    if (!isOpen) return
    loading.value = true
    try {
      await Promise.all([
        id ? store.fetchOne(id) : Promise.resolve(),
        vehiclesStore.fetchAll(),
        choferesStore.fetchAll()
      ])
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const vehicleCombination = computed(() =>
  props.vehicleCombinationId ? (store.current ?? undefined) : undefined
)
console.log(vehicleCombination)
const submit = async (form: VehicleCombinationForm) => {
  let result: VehicleCombination

  if (props.vehicleCombinationId) {
    result = await store.reassign(mapVehicleCombinationFormToCreateDto(form))
  } else {
    result = await store.create(mapVehicleCombinationFormToCreateDto(form))
  }

  open.value = false
  toast.add({
    title: 'Guardado',
    description: `La Unidad ${form.unit_number} se guardó correctamente`,
    color: 'success'
  })
  emit('success', result)
}
</script>

<template>
  <UModal v-model:open="open" class="w-full max-w-3xl">
    <template #body>
      <div v-if="loading" class="space-y-2 p-6">
        <USkeleton class="h-4 w-62" />
        <USkeleton class="h-4 w-50" />
      </div>
      <VehicleCombinationFormComponent
        v-if="open"
        :key="vehicleCombinationId ?? 'new'"
        :vehicleCombination="vehicleCombination"
        @submit="submit"
        @cancel="open = false"
      />
    </template>
  </UModal>
</template>
