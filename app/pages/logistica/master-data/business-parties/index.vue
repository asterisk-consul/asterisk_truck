<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { useBusinessPartiesStore } from '~/modulos/logistica/master-data/bussiness-parties/bussines-parties.store'
import { businessPartyFormFields } from '~/modulos/logistica/master-data/bussiness-parties/businessPartyFormFields'
import { BusinessPartyColumns } from '~/modulos/logistica/master-data/bussiness-parties/columns'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'

const store = useBusinessPartiesStore()

const { items } = storeToRefs(store)
const open = ref(false)
const loading = ref(true)

onMounted(async () => {
  await store.fetchAll('21f611eb-1f24-4a85-9b82-efc5ba78ef71')
  console.log(store.items)
  loading.value = store.loading
})

const saveLocation = async (data: any) => {
  const payload = {
    company_id: '21f611eb-1f24-4a85-9b82-efc5ba78ef71',
    type: data.type,
    name: data.name,
    tax_id: data.tax_id,
    phone: String(data.phone),
    email: data.email,
    active: true
  }

  await store.create(payload)
  await store.fetchAll('21f611eb-1f24-4a85-9b82-efc5ba78ef71')
  open.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Partes Interesadas</h3>
      <UButton icon="i-heroicons-plus" @click="open = true">
        Crear Parte Interesada
      </UButton>
    </div>

    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </div>
  <ModalForm
    v-model:open="open"
    :fields="businessPartyFormFields"
    title="Nueva Locacion"
    @submit="saveLocation"
  />
</template>
