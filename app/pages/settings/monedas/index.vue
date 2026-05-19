<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Currency } from '~/modulos/erp/currencies/types/currencies.types'

import CurrencyList from '~/modulos/erp/currencies/components/CurrencyList.vue'

definePageMeta({
  middleware: ['auth']
})

useSeoMeta({
  title: 'Monedas'
})

import { useCurrenciesStore } from '~/modulos/erp/currencies/store/currencies.store'

const store = useCurrenciesStore()
const { items: currencies } = storeToRefs(store)

const columns: TableColumn<Currency>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => `#${row.getValue('id')}`
  },
  {
    accessorKey: 'name',
    header: 'Nombre'
  },
  {
    accessorKey: 'symbol',
    header: 'Simbolo'
  },
  {
    accessorKey: 'code',
    header: 'Codigo'
  }
]
onMounted(() => {
  store.fetchAll()
})
</script>
<template>
  <div>
    <UPageCard
      title="Monedas"
      description="Listado de Monedas."
      variant="naked"
      orientation="horizontal"
      class="mb-4"
    >
      <UButton
        icon="i-heroicons-plus"
        label="Nueva Moneda"
        color="neutral"
        class="w-fit lg:ms-auto"
      />
    </UPageCard>
    <CurrencyList :currencies="currencies" />
  </div>
</template>
