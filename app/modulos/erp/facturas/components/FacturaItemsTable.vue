<script setup lang="ts">
import { h, resolveComponent, ref } from 'vue'

import type { FacturaItem } from '../types/factura.types'

interface Props {
  items: FacturaItem[]

  productOptions: {
    value: string

    label: string

    price?: number

    taxes?: any[]
  }[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [index: number]

  add: [product: any]
}>()

const selectedProduct = ref<any>(null)

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',

    currency: 'ARS'
  }).format(Number(n || 0))
}

function recalculateItem(item: FacturaItem) {
  // console.log('======================')
  // console.log('RECALCULATE ITEM')
  // console.log(item)

  // ─────────────────────────────
  // subtotal
  // ─────────────────────────────
  item.subtotal = Number(
    (Number(item.quantity || 0) * Number(item.unit_price || 0)).toFixed(2)
  )

  // console.log('SUBTOTAL')
  // console.log(item.subtotal)

  // ─────────────────────────────
  // recalcular taxes
  // ─────────────────────────────
  item.taxes = (item.taxes ?? []).map((tax) => {
    // console.log('PROCESS TAX')
    // console.log(tax)

    const subtotal = Number(item.subtotal || 0)

    // SOLO ignorar si está incluido en precio
    const taxAmount = tax.is_included_in_price
      ? 0
      : subtotal * (Number(tax.tax_rate || 0) / 100)

    // console.log('TAX AMOUNT')
    // console.log(taxAmount)

    return {
      ...tax,

      tax_amount: Number(taxAmount.toFixed(2))
    }
  })

  // console.log('TAXES AFTER')
  // console.log(item.taxes)

  // ─────────────────────────────
  // total taxes
  // ─────────────────────────────
  item.total_taxes = item.taxes.reduce(
    (acc, tax) => acc + Number(tax.tax_amount || 0),

    0
  )

  // console.log('TOTAL TAXES')
  // console.log(item.total_taxes)

  // ─────────────────────────────
  // total
  // ─────────────────────────────
  item.total = Number((item.subtotal + item.total_taxes).toFixed(2))

  // console.log('TOTAL')
  // console.log(item.total)
}

function handleAdd() {
  if (!selectedProduct.value) {
    return
  }

  emit('add', selectedProduct.value)

  selectedProduct.value = null
}

const UInput = resolveComponent('UInput')

const UButton = resolveComponent('UButton')

const columns = [
  {
    accessorKey: 'product_name',

    header: 'Producto'
  },

  {
    accessorKey: 'quantity',

    header: 'Cantidad',

    meta: {
      class: {
        th: 'text-right',

        td: 'text-right'
      }
    },

    cell: ({ row }: any) =>
      h(UInput, {
        modelValue: row.original.quantity,

        type: 'number',

        min: 0,

        step: 1,

        'onUpdate:modelValue': (val: number) => {
          // console.log('UPDATE QUANTITY', val)

          row.original.quantity = Number(val || 0)

          recalculateItem(row.original)
        }
      })
  },

  {
    accessorKey: 'unit_price',

    header: 'Precio Unitario',

    meta: {
      class: {
        th: 'text-right',

        td: 'text-right'
      }
    },

    cell: ({ row }: any) =>
      h(UInput, {
        modelValue: row.original.unit_price,

        type: 'number',

        min: 0,

        step: '0.01',

        'onUpdate:modelValue': (val: number) => {
          // console.log('UPDATE PRICE', val)

          row.original.unit_price = Number(val || 0)

          recalculateItem(row.original)
        }
      })
  },

  {
    accessorKey: 'subtotal',

    header: 'Subtotal',

    meta: {
      class: {
        th: 'text-right',

        td: 'text-right'
      }
    },

    cell: ({ row }: any) => fmt(Number(row.original.subtotal || 0))
  },

  {
    accessorKey: 'total_taxes',

    header: 'Impuestos',

    meta: {
      class: {
        th: 'text-right',

        td: 'text-right'
      }
    },

    cell: ({ row }: any) => fmt(Number(row.original.total_taxes || 0))
  },

  {
    accessorKey: 'total',

    header: 'Total',

    meta: {
      class: {
        th: 'text-right',

        td: 'text-right'
      }
    },

    cell: ({ row }: any) => fmt(Number(row.original.total || 0))
  },

  {
    id: 'actions',

    header: '',

    cell: ({ row }: any) =>
      h(UButton, {
        color: 'error',

        variant: 'soft',

        icon: 'i-lucide-trash',

        onClick: () => emit('remove', row.index)
      })
  }
]
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <span class="text-sm font-medium text-muted whitespace-nowrap">
        Agregar producto:
      </span>

      <USelectMenu
        v-model="selectedProduct"
        :items="props.productOptions"
        placeholder="Buscar por nombre..."
        searchable
        class="w-72"
      />

      <UButton
        icon="i-lucide-plus"
        :disabled="!selectedProduct"
        @click="handleAdd"
      >
        Agregar
      </UButton>
    </div>

    <UTable :data="props.items" :columns="columns" />
  </div>
</template>
