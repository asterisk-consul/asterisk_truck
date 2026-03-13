<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { storeToRefs } from 'pinia'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'
//stores
import { useVehiclesStore } from '~/modulos/logistica/transport/vehicles/vehicles.store'
import { useVehicleCombinationsStore } from '~/stores/logistica/transport/vehicle-combinations.store'
import { useChoferesStore } from '~/stores/logistica/transport/choferes.store'
import { useAuthStore } from '~/stores/auth.store'
//form
import { vehicleCombinationsFormFields } from '~/form/vehicleCombinationsForm'
import ModalForm from '~/components/ModalForm.vue'
//composables
import { useDriverMetrics } from '~/composables/logistica/useDriverMetrics'
import { useVehicles } from '~/composables/logistica/useVehicles'
//tabla columns
import { columns } from './columns'

const loading = ref(true)
const open = ref(false)

const store = useVehicleCombinationsStore()
const vehiculoStore = useVehiclesStore()
const choferStore = useChoferesStore()
const authStore = useAuthStore()

const { items } = storeToRefs(store)
const { items: vehicles } = storeToRefs(vehiculoStore)
const { drivers } = storeToRefs(choferStore)

const { tractorOptions, trailerOptions } = useVehicles(vehicles)
const { items: driverItems } = useDriverMetrics(drivers)

// ========================================
// COMPUTED
// ========================================

const fields = computed(() =>
  vehicleCombinationsFormFields.map((field) => {
    if (field.name === 'tractor_id') {
      return { ...field, options: tractorOptions.value }
    }
    if (field.name === 'trailer_id') {
      return { ...field, options: trailerOptions.value }
    }
    if (field.name === 'driver_id') {
      return { ...field, options: driverItems.value }
    }
    return field
  })
)

// ========================================
// HOOKS
// ========================================

onMounted(async () => {
  const companyId = 'a060f7ff-0281-4df4-b5b3-cbdf940be31e'
  await store.fetchAll(companyId)
  await vehiculoStore.fetchAll(companyId)
  await choferStore.fetchAll(companyId)
  await authStore.fetchMe()
  loading.value = store.loading
})

// ========================================
// ACTIONS
// ========================================

function saveDriver(data: any) {
  const { id, ...rest } = data

  const payload = {
    ...rest,
    company_id: 'a060f7ff-0281-4df4-b5b3-cbdf940be31e'
  }
  console.log(payload)
  store.create(payload)
  open.value = false
}
// ========================================
// MAP PAYLOAD
// ========================================
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Vehiculos</h3>
      <UButton icon="i-heroicons-plus" @click="open = true">
        Nuevo Vehiculo
      </UButton>
    </div>
    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </div>
  <ModalForm
    v-model:open="open"
    :fields="fields"
    title="Nuevo Chofer"
    @submit="saveDriver"
  />
</template>
