<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { storeToRefs } from 'pinia'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'
//stores
import { useVehiclesStore } from '~/modulos/logistica/transport/vehicles/vehicles.store'
import { useDocumentTypesStore } from '~/stores/logistica/documents/document-types.store'
//form
import { vehicleFormFields } from '~/form/vehicleFormFields'
import ModalForm from '~/components/ModalForm.vue'
import { mapVehicleDocumentsToForm } from '~/mappers/mapVehicleDocumentsToForm'
//composables
import { useDocuments } from '~/composables/logistica/useDocuments'
//tabla columns
import { vehiclesColumns } from './vehicles.columns'
import type {
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput
} from '~/modulos/logistica/transport/vehicles/vehicles.types'

type EditableField = 'plate'

type EditableValue = string | null | undefined
/* ---------------------------------------
   STATE
--------------------------------------- */

const loading = ref(true)
const documentStore = useDocumentTypesStore()
const store = useVehiclesStore()

const { items } = storeToRefs(store)
const { items: documentTypes } = storeToRefs(documentStore)

const { vehicleItems } = useDocuments(documentTypes)

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

function openEdit(row: Vehicle) {
  modalMode.value = 'edit'

  const documentFields = mapVehicleDocumentsToForm(row)

  editingRow.value = {
    ...row,

    ...documentFields
  }

  modalOpen.value = true
}

/* ---------------------------------------
   TABLE COLUMNS
--------------------------------------- */

const columns = vehiclesColumns({
  onEdit: openEdit,
  onInlineSave: async (
    row: Vehicle,
    field: EditableField,
    value: EditableValue
  ) => {
    const prev = row[field]
    row[field] = value ?? ''

    try {
      // Type assertion para el objeto dinámico
      const updateData = {
        [field]: value ?? undefined
      } as UpdateVehicleInput // ← Solución temporal

      await store.update(row.id, updateData)
    } catch {
      row[field] = prev
    }
  }
})

// ========================================
// COMPUTED
// ========================================
const fields = computed(() =>
  vehicleFormFields.map((field) => {
    if (
      field.name === 'doc1Type' ||
      field.name === 'doc2Type' ||
      field.name === 'doc3Type' ||
      field.name === 'doc4Type'
    ) {
      return {
        ...field,
        options: vehicleItems.value,
        disabled: vehicleItems.value.length === 0
      }
    }

    return field
  })
)

// ========================================
// HOOKS
// ========================================

onMounted(async () => {
  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  await documentStore.fetchAll()
  loading.value = store.loading
})

// ========================================
// ACTIONS
// ========================================

async function handleSubmit(data: any) {
  if (modalMode.value === 'create') {
    const payload: CreateVehicleInput = mapVehiclePayload(data)

    await store.create(payload)
  } else {
    const payload: UpdateVehicleInput = mapVehiclePayload(data)

    await store.update(editingRow.value.id, payload)
  }

  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e') // 🔥 FALTA ESTO

  modalOpen.value = false
}
// ========================================
// MAP PAYLOAD
// ========================================
function mapVehiclePayload(form: any) {
  const documents = []

  for (let i = 1; i <= 4; i++) {
    const type = form[`doc${i}Type`]
    const expiration = form[`doc${i}Expiration`]

    if (type) {
      documents.push({
        documentTypeId: type,
        expirationDate: expiration || undefined
      })
    }
  }

  return {
    companyId: 'a060f7ff-0281-4df4-b5b3-cbdf940be31e',
    type: form.type,
    plate: form.plate,
    brand: form.brand,
    model: form.model,
    year: Number(form.year),
    maxWeight: Number(form.maxWeight),
    maxVolume: Number(form.maxVolume),
    refrigeration: form.refrigeration,
    documents
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Vehiculos</h3>
      <UButton icon="i-heroicons-plus" @click="openCreate">
        Nuevo Vehiculo
      </UButton>
    </div>
    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </div>
  <ModalForm
    v-model:open="modalOpen"
    :fields="fields"
    :title="modalMode === 'create' ? 'Nuevo Chofer' : 'Editar Chofer'"
    :initial-values="editingRow"
    @submit="handleSubmit"
  />
</template>
