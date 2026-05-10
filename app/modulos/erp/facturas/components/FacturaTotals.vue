<script setup lang="ts">
import { computed } from 'vue'

import type { FacturaTax } from '../types/factura.types'

interface Props {
  subtotal: number

  taxes: FacturaTax[]

  total: number
}

const props = defineProps<Props>()

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',

    currency: 'ARS'
  }).format(Number(n || 0))
}

const groupedTaxes = computed(() => {
  const map = new Map<
    string,
    {
      name: string

      amount: number

      rate: number
    }
  >()

  for (const tax of props.taxes ?? []) {
    const key = tax.tax_id

    const amount = Number(tax.tax_amount || 0)

    // ignorar taxes vacíos
    if (amount <= 0) {
      continue
    }

    if (!map.has(key)) {
      map.set(key, {
        name: tax.name ?? `Impuesto ${tax.tax_rate ?? 0}%`,

        amount,

        rate: Number(tax.tax_rate || 0)
      })
    } else {
      const existing = map.get(key)!

      existing.amount = Number((existing.amount + amount).toFixed(2))
    }
  }

  return Array.from(map.values())
})

const totalTaxes = computed(() =>
  groupedTaxes.value.reduce(
    (acc, tax) => acc + Number(tax.amount || 0),

    0
  )
)
</script>

<template>
  <div class="p-4 space-y-2">
    <!-- Subtotal -->
    <div class="flex justify-between">
      <span>Subtotal</span>

      <span>
        {{ fmt(subtotal) }}
      </span>
    </div>

    <!-- Taxes -->
    <div
      v-for="tax in groupedTaxes"
      :key="tax.name"
      class="flex justify-between text-sm text-gray-400"
    >
      <span>
        {{ tax.name }}
      </span>

      <span>
        {{ fmt(tax.amount) }}
      </span>
    </div>

    <!-- Total impuestos -->
    <div
      v-if="groupedTaxes.length"
      class="flex justify-between text-sm border-t pt-2"
    >
      <span>Total impuestos</span>

      <span>
        {{ fmt(totalTaxes) }}
      </span>
    </div>

    <!-- Total -->
    <div class="flex justify-between text-lg font-bold border-t pt-2">
      <span>Total</span>

      <span>
        {{ fmt(total) }}
      </span>
    </div>
  </div>
</template>
