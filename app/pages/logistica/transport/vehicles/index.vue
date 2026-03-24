<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { storeToRefs } from 'pinia'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'
//stores
import { useVehiclesStore } from '~/modulos/logistica/transport/vehicles/vehicles.store'
import { useDocumentTypesStore } from '~/modulos/logistica/documents/delivery-types/document-types.store'
//form
import { vehicleFormFields } from '~/modulos/logistica/transport/vehicles/vehicleFormFields'
import ModalForm from '~/components/ModalForm.vue'
import { mapVehicleDocumentsToForm } from '~/mappers/mapVehicleDocumentsToForm'
//composables
import { useDocuments } from '~/composables/logistica/useDocuments'
//tabla columns
import { vehiclesColumns } from '~/modulos/logistica/transport/vehicles/vehicles.columns'
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
const COMPANY_ID = '21f611eb-1f24-4a85-9b82-efc5ba78ef71'

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

  console.log('ROW:', JSON.stringify(row, null, 2)) // ← agregar
  console.log('DOC FIELDS:', JSON.stringify(documentFields, null, 2)) // ← agregar

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
  },
  onToggleActive: async (row, value) => {
    const prev = row.active
    row.active = value

    try {
      if (value) await store.activate(row.id)
      else await store.deactivate(row.id)
    } catch {
      row.active = prev
    }
  },
  onToggleRefrigeration: async (row, value) => {
    const prev = row.refrigeration
    row.refrigeration = value

    try {
      await store.update(row.id, { refrigeration: value })
    } catch {
      row.refrigeration = prev
    }
  },
  onToggleType(row, value) {
    const prev = row.type
    row.type = value

    try {
      store.update(row.id, { type: value })
    } catch {
      row.type = prev
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
<<<<<<< Updated upstream
  await store.fetchAll('a12364b6-c47b-4baa-b4a1-4188b8003433')
=======
  await store.fetchAll('21f611eb-1f24-4a85-9b82-efc5ba78ef71')
>>>>>>> Stashed changes
  await documentStore.fetchAll()
  loading.value = store.loading
})
/* ---------------------------------------
   ACTIONS
--------------------------------------- */

async function handleSubmit(data: any) {
  if (modalMode.value === 'create') {
    const payload = mapCreateVehiclePayload(data)
    await store.create(payload)
  } else {
    const payload = mapUpdateVehiclePayload(data) // ya usa editingRow internamente
    console.log('UPDATE PAYLOAD:', JSON.stringify(payload, null, 2))
    await store.update(editingRow.value!.id, payload)
  }

  await store.fetchAll(COMPANY_ID)
  modalOpen.value = false
}

/* ---------------------------------------
   MAPPERS
--------------------------------------- */

function mapVehicleBase(form: any, existingRow?: any) {
  const documents: any[] = []

  for (let i = 1; i <= 4; i++) {
    const type = form[`doc${i}Type`]
    const expiration = form[`doc${i}Expiration`]
    const docId = existingRow?.[`doc${i}Id`] // ← leer del editingRow, no del form

    if (type) {
      documents.push({
        ...(docId && { id: docId }),
        documentTypeId: type,
        expirationDate: expiration || undefined
      })
    }
  }

  return {
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

function mapCreateVehiclePayload(form: any): CreateVehicleInput {
  return {
    companyId: COMPANY_ID,
    ...mapVehicleBase(form)
  }
}

function mapUpdateVehiclePayload(form: any): UpdateVehicleInput {
  return mapVehicleBase(form, editingRow.value) // ← pasar editingRow
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
