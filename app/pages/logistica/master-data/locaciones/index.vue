<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { useLocationsStore } from '~/modulos/logistica/master-data/locations/locations.store'
import { LocationColumns } from '../../../../modulos/logistica/master-data/locations/columns'
import { locationFormFields } from '~/modulos/logistica/master-data/locations/locationsFormFields'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'
const store = useLocationsStore()

/* ---------------------------------------
   TIPOS
--------------------------------------- */

import type {
  CreateLocationInput,
  UpdateLocationInput,
  Location
} from '~/modulos/logistica/master-data/locations/locations'

type EditableField = 'city' | 'province' | 'country' | 'postalCode'

type EditableValue = string | null | undefined
/* ---------------------------------------
   STATE
--------------------------------------- */
const { items } = storeToRefs(store)
const loading = ref(true)

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

/* ---------------------------------------
   TABLE COLUMNS
--------------------------------------- */

const columns = LocationColumns({
  onEdit: openEdit,
  onInlineSave: async (
    row: Location,
    field: EditableField,
    value: EditableValue
  ) => {
    const prev = row[field]
    row[field] = value ?? ''

    try {
      await store.update(row.id, {
        [field]: value ?? undefined
      })
    } catch {
      row[field] = prev
    }
  }
})

/* ---------------------------------------
   LIFECYCLE
--------------------------------------- */
onMounted(async () => {
  await store.fetchAll()
  console.log(items)
  loading.value = store.loading
})

/* ---------------------------------------
   SUBMIT HANDLER
--------------------------------------- */

async function handleSubmit(data: any) {
  if (modalMode.value === 'create') {
    const payload: CreateLocationInput = {
      city: data.city,
      province: data.province,
      country: data.country,
      postalCode: data.postal_code
    }

    await store.create(payload)
  } else {
    const payload: UpdateLocationInput = {
      city: data.city,
      province: data.province,
      country: data.country,
      postalCode: data.postal_code
    }

    await store.update(editingRow.value.id, payload)
  }

  await store.fetchAll() // 🔥 FALTA ESTO

  modalOpen.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Locaciones</h3>
      <UButton icon="i-heroicons-plus" @click="openCreate">
        Nueva Locacion
      </UButton>
    </div>

    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </div>

  <ModalForm
    v-model:open="modalOpen"
    :fields="locationFormFields"
    :title="modalMode === 'create' ? 'Nueva Locación' : 'Editar Locación'"
    :initial-values="editingRow"
    @submit="handleSubmit"
  />
</template>
