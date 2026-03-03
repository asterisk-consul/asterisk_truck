<script setup lang="ts">
import { useBusinessPartiesStore } from '@/stores/logistica/meta-data/bussines-parties.store'
import { businessPartyFormFields } from '~/form/businessPartyFormFields'
import { columns } from './columns'
definePageMeta({ layout: 'logistica' })

const store = useBusinessPartiesStore()

const { items } = storeToRefs(store)
const open = ref(false)
const loading = ref(true)

onMounted(async () => {
  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  console.log(store.items)
  loading.value = store.loading
})

const saveLocation = async (data: any) => {
  console.log(data)
  const payload = {
    company_id: 'a060f7ff-0281-4df4-b5b3-cbdf940be31e',
    type: data.type,
    name: data.name,
    tax_id: data.tax_id,
    phone: String(data.phone),
    email: data.email,
    active: true
  }
  console.log(payload)
  await store.create(payload)
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
    <UTable
      :loading="loading"
      sticky
      :data="items"
      :columns="columns"
      class="border border-default rounded-lg"
    />
  </div>
  <ModalForm
    v-model:open="open"
    :fields="businessPartyFormFields"
    title="Nueva Locacion"
    @submit="saveLocation"
  />
</template>
