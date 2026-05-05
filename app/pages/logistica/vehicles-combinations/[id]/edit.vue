<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import VehicleCombinationForm from '~/modulos/logistica/transport/vehicles-combinations/components/VehiclesCombinationsForm.vue'
import { mapVehicleCombinationFormToCreateDto } from '~/modulos/logistica/transport/vehicles-combinations/mappers/vehicle-combinations.mapper'
import { useVehicleCombinationsStore } from '~/modulos/logistica/transport/vehicles-combinations/vehicle-combinations.store'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const store = useVehicleCombinationsStore()

const id = route.params.id as string
const loading = ref(true)
const unitSaved = ref(false)

const moduleCollapsed = inject('moduleSidebarCollapsed') as Ref<boolean>

const unidad = computed(() => store.current ?? undefined)
// console.log(unidad)

onMounted(async () => {
  try {
    await store.fetchOne(id)
  } finally {
    loading.value = false

    unitSaved.value = true
  }
})
const submit = async (form: any) => {
  const payload = mapVehicleCombinationFormToCreateDto(form)
  await store.reassign(payload)
  toast.add({
    title: 'Guardado',
    description: `La Unidad ${form.unit_number} se guardó correctamente`,
    color: 'success'
  })
  unitSaved.value = true

  await router.push('/logistica/vehicles-combinations')
}
</script>
<template>
  <div v-if="loading" class="grid gap-2">
    <USkeleton class="h-4 w-62.5" />
    <USkeleton class="h-4 w-50" />
  </div>
  <UPage>
    <div class="flex flex-col">
      <UButton
        icon="i-lucide-layout-panel-left"
        variant="ghost"
        color="neutral"
        label="Menu"
        @click="moduleCollapsed = !moduleCollapsed"
      />
      <UPageHeader title="Editar Unidad" />
    </div>
    <VehicleCombinationForm
      :vehicleCombination="unidad"
      @submit="submit"
      @cancel="router.back()"
    />
  </UPage>
</template>
