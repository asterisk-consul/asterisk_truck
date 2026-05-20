<script setup lang="ts">
import type { CurrencyRate } from '~/modulos/erp/currency-rates/types/currency-rates.types'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const props = defineProps<{
  rates: CurrencyRate[]
}>()

const chartData = computed(() => {
  return [...props.rates]
    .sort((a, b) => {
      return (
        new Date(a.effective_date ?? '').getTime() -
        new Date(b.effective_date ?? '').getTime()
      )
    })
    .map((item) => ({
      date: new Date(item.effective_date ?? '').toLocaleDateString('es-AR'),
      rate: Number(item.rate)
    }))
})
</script>

<template>
  <UPageCard
    title="Histórico"
    description="Evolución de cotizaciones"
    variant="subtle"
  >
    <div class="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart :data="chartData">
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="rate" strokeWidth="2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </UPageCard>
</template>
