<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import CurrencyList from '~/modulos/erp/currencies/components/CurrencyList.vue'
import CotizacionesList from '~/modulos/erp/currency-rates/components/CotizacionesList.vue'

definePageMeta({
  middleware: ['auth']
})

useSeoMeta({
  title: 'Monedas'
})

const items = ref<TabsItem[]>([
  {
    label: 'Monedas',
    slot: 'monedas' as const
  },
  {
    label: 'Cotizaciones',
    slot: 'cotizaciones' as const
  }
])

import { useCurrenciesStore } from '~/modulos/erp/currencies/store/currencies.store'

const store = useCurrenciesStore()
const { items: currencies } = storeToRefs(store)

const loading = ref(false)

onMounted(() => {
  store.fetchAll()
  loading.value = store.loading
})
</script>
<template>
  <UTabs :items="items" variant="link" class="w-full">
    <template #monedas="{ item }">
      <UPageCard
        title="Monedas"
        description="Listado de Monedas."
        orientation="horizontal"
        variant="naked"
        class="mb-2 mt-4 w-full lg:max-w-2xl mx-auto"
      >
        <UButton
          icon="i-heroicons-plus"
          label="Nueva Moneda"
          color="neutral"
          class="w-fit lg:ms-auto"
        />
      </UPageCard>
      <div class="grid gap-2 w-full lg:max-w-2xl mx-auto" v-if="!loading">
        <USkeleton class="h-4 w-55" />
        <USkeleton class="h-4 w-50" />
      </div>
      <UPageCard
        v-else
        variant="subtle"
        class="w-full lg:max-w-2xl mx-auto"
        :ui="{
          container: 'p-0 sm:p-0 gap-y-0',
          wrapper: 'items-stretch',
          header: 'p-4 mb-0 border-b border-default'
        }"
      >
        <CurrencyList class="w-full" :currencies="currencies" />
      </UPageCard>
    </template>
    <template #cotizaciones="{ item }">
      <CotizacionesList />
    </template>
  </UTabs>
</template>
