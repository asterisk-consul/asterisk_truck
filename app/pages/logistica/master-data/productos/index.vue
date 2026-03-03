<script setup lang="ts">
import { useProductsStore } from '@/stores/logistica/meta-data/products.store'
import { columns } from './columns'
import { productFormFields } from '~/form/productFormFields'
import { useProductsMetrics } from '~/composables/logistica/useProductsMetrics'

const store = useProductsStore()

definePageMeta({
  layout: 'logistica'
})

const { items } = storeToRefs(store)
const metrics = useProductsMetrics(items)
const open = ref(false)
const loading = ref(true)

onMounted(async () => {
  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  loading.value = store.loading
})
const saveLocation = async (data: any) => {
  const payload = {
    company_id: 'a060f7ff-0281-4df4-b5b3-cbdf940be31e',
    name: data.name,
    requires_refrigeration: data.requires_refrigeration,
    sku: data.sku
  }
  console.log(payload)
  await store.create(payload)
  open.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Productos</h3>
      <UButton icon="i-heroicons-plus" @click="open = true">
        Nueva Producto
      </UButton>
    </div>
    <div class="flex flex-row items-center justify-between">
      <UCard>
        <div class="text-center">
          <p class="text-xs text-gray-500">Total Productos</p>
          <p class="text-2xl font-bold">{{ metrics.total }}</p>
        </div>
      </UCard>
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
    :fields="productFormFields"
    title="Nueva Locacion"
    @submit="saveLocation"
  />
</template>
