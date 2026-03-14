<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { storeToRefs } from 'pinia'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'
//stores
import { useTripsStore } from '~/modulos/logistica/transport/trips/trips.store'
import { useVehicleCombinationsStore } from '~/modulos/logistica/transport/vehicles-combinations/vehicle-combinations.store'
import { useLocationsStore } from '~/modulos/logistica/master-data/locations/locations.store'
import { useTransferRatesStore } from '~/modulos/logistica/transport/transfer-rates/transfer-rates.store'
import type {
  Trip,
  CreateTripInput,
  UpdateTripInput
} from '~/modulos/logistica/transport/trips/trips.types'
//form
import { tripsFormFields } from '~/modulos/logistica/transport/trips/tripFormFields'
import ModalForm from '~/components/ModalForm.vue'
//composables
import { useLocations } from '~/composables/logistica/useLocations'
import { useVehiclesCombinations } from '~/composables/logistica/useVehicleCombinations'
import { useTransferRate } from '~/composables/logistica/useTransferRate'
//tabla columns
import { tripsColumns } from '~/modulos/logistica/transport/trips/columns'

type EditableField = 'reference_number' | 'kilometers'
type EditableValue = string | null | undefined

const loading = ref(true)
const store = useTripsStore()
const vehiculoStore = useVehicleCombinationsStore()
const locationsStore = useLocationsStore()
const tableRenderers = useTransferRatesStore()

const { items } = storeToRefs(store)
const { items: vehicleCombinations } = storeToRefs(vehiculoStore)
const { items: locations } = storeToRefs(locationsStore)
const { items: rates } = storeToRefs(tableRenderers)

const { items: combinationOptions } =
  useVehiclesCombinations(vehicleCombinations)

const { items: locationsItems } = useLocations(locations)

const { items: ratesItems } = useTransferRate(rates)

/* ---------------------------------------
   MODAL CONTROL
--------------------------------------- */

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingRow = ref<any>(null)

function openCreate() {
  modalMode.value = 'create'
  editingRow.value = null
  modalOpen.value = true
}

function openEdit(row: any) {
  modalMode.value = 'edit'

  editingRow.value = {
    ...row,
    locationId: row.locationId ?? row.locations?.id ?? null
  }
  modalOpen.value = true
}

const columns = tripsColumns({
  onEdit: openEdit,
  onInlineSave: async <K extends EditableField>(
    row: Trip,
    field: K,
    value: Trip[K]
  ) => {
    const prev = row[field]

    row[field] = value ?? prev

    try {
      const updateData: UpdateTripInput = {
        [field]: value ?? undefined
      }

      await store.update(row.id, updateData)
    } catch {
      row[field] = prev
    }
  },
  onToggleStatus: async (row, value) => {
    const prev = row.status
    row.status = value
    try {
      await store.updateStatus(row.id, value)
    } catch {
      row.status = prev
    }
  }
})

// ========================================
// COMPUTED
// ========================================

const fields = computed(() =>
  tripsFormFields.map((field) => {
    if (field.name === 'vehicle_combination_id') {
      return { ...field, options: combinationOptions.value }
    }
    if (field.name === 'origin_location_id') {
      return { ...field, options: locationsItems.value }
    }
    if (field.name === 'destination_location_id') {
      return { ...field, options: locationsItems.value }
    }
    if (field.name === 'rate_id') {
      return { ...field, options: ratesItems.value }
    }
    return field
  })
)

// ========================================
// ACTIONS
// ========================================

onMounted(async () => {
  const companyId = 'a060f7ff-0281-4df4-b5b3-cbdf940be31e'
  await store.fetchAll(companyId)
  await vehiculoStore.fetchAll(companyId)
  await locationsStore.fetchAll()
  await tableRenderers.fetchAll(companyId)
  loading.value = store.loading
})

async function handleSubmit(data: any) {
  const { id, rate_id, rate_value, status, ...rest } = data // extract status separately

  const basePayload = {
    ...rest,
    company_id: 'a060f7ff-0281-4df4-b5b3-cbdf940be31e',
    kilometers: data.kilometers ? Number(data.kilometers) : undefined,
    departure_time: data.departure_time
      ? new Date(data.departure_time).toISOString()
      : undefined,
    arrival_time: data.arrival_time
      ? new Date(data.arrival_time).toISOString()
      : undefined
  }

  if (modalMode.value === 'create') {
    const payload: CreateTripInput = {
      ...basePayload,
      status // requerido en CreateTripInput
    }
    await store.create(payload)
  } else {
    const payload: UpdateTripInput = {
      ...basePayload,
      status // include status in the PATCH body (not via separate endpoint)
    }
    console.log(payload)
    await store.update(editingRow.value.id, payload)
  }

  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  modalOpen.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Viajes</h3>
      <UButton icon="i-heroicons-plus" @click="openCreate">Nuevo Viaje</UButton>
    </div>
    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </div>
  <ModalForm
    v-model:open="modalOpen"
    :fields="fields"
    :title="modalMode === 'create' ? 'Nuevo Viaje' : 'Editar Viaje'"
    :initial-values="editingRow"
    @submit="handleSubmit"
  />
</template>
