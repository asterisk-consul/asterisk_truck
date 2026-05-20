<script setup lang="ts">
import type { CurrencyRate } from '~/modulos/erp/currency-rates/types/currency-rates.types'
const props = defineProps<{
  rates: CurrencyRate[]
}>()

const latestRates = computed(() => {
  const grouped = new Map<string, CurrencyRate>()

  const validRates = props.rates.filter(
    (rate) => rate.source?.toLowerCase() !== 'actualización manual'
  )

  const sorted = [...validRates].sort((a, b) => {
    return (
      new Date(b.effective_date ?? '').getTime() -
      new Date(a.effective_date ?? '').getTime()
    )
  })

  for (const rate of sorted) {
    const key = [
      rate.from_currency?.code,
      rate.to_currency?.code,
      rate.rate_type
    ].join('-')

    if (!grouped.has(key)) {
      grouped.set(key, rate)
    }
  }

  return Array.from(grouped.values())
    .map((rate) => {
      const history = sorted.filter((r) => {
        return (
          r.from_currency_id === rate.from_currency_id &&
          r.to_currency_id === rate.to_currency_id &&
          r.rate_type === rate.rate_type
        )
      })

      const previous = history[1]

      const currentRate = Number(rate.rate)
      const previousRate = Number(previous?.rate ?? currentRate)

      const difference = currentRate - previousRate

      const percent = previousRate > 0 ? (difference / previousRate) * 100 : 0

      return {
        ...rate,

        difference,
        percent,

        isUp: difference > 0,
        isDown: difference < 0,

        isDollar: rate.from_currency?.code === 'USD'
      }
    })
    .sort((a, b) => {
      // USD primero
      if (a.isDollar && !b.isDollar) return -1
      if (!a.isDollar && b.isDollar) return 1

      return 0
    })
})
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UPageCard v-for="rate in latestRates" :key="rate.id" variant="subtle">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-xs text-muted">
            {{ rate.from_currency?.code }}
            /
            {{ rate.to_currency?.code }}
          </p>

          <h3 class="text-2xl font-bold">
            {{
              Number(rate.rate).toLocaleString('es-AR', {
                minimumFractionDigits: 2
              })
            }}
          </h3>

          <p class="text-sm text-muted">
            {{ rate.rate_type }}
          </p>
        </div>

        <UBadge color="primary" variant="subtle">
          {{ rate.source }}
        </UBadge>
      </div>
    </UPageCard>
  </div>
</template>
