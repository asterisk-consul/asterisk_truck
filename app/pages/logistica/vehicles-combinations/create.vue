<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { useRouter } from 'vue-router'

import VehicleCombinationForm from '~/modulos/logistica/transport/vehicles-combinations/components/VehiclesCombinationsForm.vue'
import { mapVehicleCombinationFormToCreateDto } from '~/modulos/logistica/transport/vehicles-combinations/mappers/vehicle-combinations.mapper'
import { useVehicleCombinationsStore } from '~/modulos/logistica/transport/vehicles-combinations/vehicle-combinations.store'

const store = useVehicleCombinationsStore()
const router = useRouter()

const toast = useToast()

const saving = ref(false)

const handleSubmit = async (form: any) => {
  try {
    saving.value = true

    const payload = mapVehicleCombinationFormToCreateDto(form)

    await store.create(payload)
    toast.add({
      title: 'Guardado',
      description: `La Unidad ${form.unit_number} se guardó correctamente`,
      color: 'success'
    })

    await router.push('/logistica/vehicles-combinations')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message || error?.message || 'Error al guardar',
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

const moduleCollapsed = inject('moduleSidebarCollapsed') as Ref<boolean>
function toggleModuleSidebar() {
  moduleCollapsed.value = !moduleCollapsed.value
}
</script>
<template>
  <UPage class="space-y-4">
    <div class="flex flex-col">
      <div>
        <UButton
          icon="i-lucide-layout-panel-left"
          variant="ghost"
          color="neutral"
          label="Menu"
          @click="toggleModuleSidebar"
        />
      </div>
      <UPageHeader
        title="Crear Unidad"
        description="Unidades"
        class="mb-4 w-full"
      />
    </div>
    <VehicleCombinationForm @submit="handleSubmit" @cancel="router.back()" />
  </UPage>
</template>
