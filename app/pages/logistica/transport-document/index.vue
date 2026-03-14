<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { storeToRefs } from 'pinia'
import { useDocumentTypesStore } from '~/modulos/logistica/documents/delivery-types/document-types.store'
import { documentTypeFormFields } from '~/modulos/logistica/documents/delivery-types/documentTypeFormFields'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'

import type {
  CreateDocumentTypeInput,
  UpdateDocumentTypeInput
} from '~/modulos/logistica/documents/delivery-types/document-types.types'

type EditableField = 'name'
type EditableValue = string | null | undefined

import ModalForm from '~/components/ModalForm.vue'
import { transportDocumentTypeColumns } from '../../../modulos/logistica/documents/delivery-types/columns'

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

const columns = transportDocumentTypeColumns({
  onEdit: openEdit,
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
  onToggleEntity: async (row, value) => {
    row.entity = value
    console.log(value)
    try {
      await store.update(row.id, { entity: value })
    } catch {
      row.entity = !value ? 'VEHICLE' : 'DRIVER'
    }
  },
  onInlineSave: async (row, field: EditableField, value: EditableValue) => {
    const prev = row[field] as EditableValue
    row[field] = value ?? ''

    try {
      const normalized = value ?? undefined

      await store.update(row.id, {
        [field]: normalized
      })
    } catch {
      row[field] = prev ?? ''
    }
  }
})

const loading = ref(true)
const store = useDocumentTypesStore()
const { items } = storeToRefs(store)

/* ---------------------------------------
   LIFECYCLE
--------------------------------------- */

onMounted(async () => {
  await store.fetchAll()
  loading.value = store.loading
})

/* ---------------------------------------
   SUBMIT HANDLER
--------------------------------------- */

async function handleSubmit(data: any) {
  if (modalMode.value === 'create') {
    const { id, ...payload } = data

    await store.create(payload)
  } else {
    console.log(data)
    const payload: UpdateDocumentTypeInput = {
      name: data.name,
      entity: data.entity
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
      <h3>Docuementos de Transporte</h3>
      <UButton icon="i-heroicons-plus" @click="openCreate">
        Nuevo Documentos
      </UButton>
    </div>
    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </div>
  <ModalForm
    v-model:open="modalOpen"
    :fields="documentTypeFormFields"
    :title="modalMode === 'create' ? 'Nuevo Documento' : 'Editar Documento'"
    :initial-values="editingRow"
    @submit="handleSubmit"
  />
</template>
