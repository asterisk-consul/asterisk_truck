<script setup lang="ts">
import { useLocationsStore } from '@/stores/logistica/meta-data/locations.store'
import { columns } from './columns'
import { locationFormFields } from '~/form/locationsFormFields'
const store = useLocationsStore()

definePageMeta({
  layout: 'logistica'
})

const { items } = storeToRefs(store)
const open = ref(false)
const loading = ref(true)

onMounted(async () => {
  await store.fetchAll()
  loading.value = store.loading
})
const saveLocation = async (data: any) => {
  const payload = {
    city: data.city,
    province: data.province,
    country: data.country,
    postalCode: data.postal_code
  }
  await store.create(payload)
  open.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Locaciones</h3>
      <UButton icon="i-heroicons-plus" @click="open = true">
        Nueva Locacion
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
    :fields="locationFormFields"
    title="Nueva Locacion"
    @submit="saveLocation"
  />
</template>
