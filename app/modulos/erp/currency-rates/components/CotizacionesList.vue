<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { UBadge } from '#components'
import { h } from 'vue'

import { useCurrencyRatesStore } from '~/modulos/erp/currency-rates/store/currency-rates.store'
import type { CurrencyRate } from '~/modulos/erp/currency-rates/types/currency-rates.types'

const store = useCurrencyRatesStore()
const { items } = storeToRefs(store)
console.log(items)
onMounted(() => {
  store.fetchAll()
})

const columns: TableColumn<CurrencyRate>[] = [
  {
    accessorKey: 'from_currency.code',
    header: 'Desde',
    cell: ({ row }) => {
      const currency = row.original.from_currency

      if (!currency) return '-'

      return `${currency.symbol} ${currency.code}`
    }
  },

  {
    accessorKey: 'to_currency.code',
    header: 'Hacia',
    cell: ({ row }) => {
      const currency = row.original.to_currency

      if (!currency) return '-'

      return `${currency.symbol} ${currency.code}`
    }
  },

  {
    accessorKey: 'rate',
    header: 'Cotización',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right font-medium'
      }
    },
    cell: ({ row }) => {
      return Number(row.original.rate).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      })
    }
  },

  {
    accessorKey: 'rate_type',
    header: 'Tipo',
    cell: ({ row }) => {
      const rateType = row.original.rate_type

      if (!rateType) return '-'

      return h(
        UBadge,
        {
          color: 'primary',
          variant: 'subtle'
        },
        () => rateType
      )
    }
  },

  {
    accessorKey: 'source',
    header: 'Origen',
    cell: ({ row }) => {
      const source = row.original.source

      if (!source) return '-'

      return h(
        UBadge,
        {
          color: 'neutral',
          variant: 'soft',
          class: 'uppercase'
        },
        () => source
      )
    }
  },

  {
    accessorKey: 'effective_date',
    header: 'Fecha Vigencia',
    cell: ({ row }) => {
      const date = row.original.effective_date

      if (!date) return '-'

      return new Date(date).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },

  {
    accessorKey: 'created_at',
    header: 'Creado',
    cell: ({ row }) => {
      const date = row.original.created_at

      if (!date) return '-'

      return new Date(date).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
]
console.log('CotizacionesList mounted')
</script>
<template>
  <UPageCard title="Cotizaciones" description="Listado de Cotizaciones.">
    <UTable :data="items" :columns="columns" />
  </UPageCard>
</template>
