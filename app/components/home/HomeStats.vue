<script setup lang="ts">
const props = defineProps<{
  period: Period
  range: Range
}>()

function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  })
}

// const DOCUMENT_TYPE_ID = '91a9b49a-88b2-40a7-ba8d-d14ce3b57754'
const { data: stats } = useAsyncData<Stat[]>(
  'stats',
  async () => {
    // const documents = await $fetch(
    //   '/api/erp/purchases'
    //   // , {
    //   // query: {
    //   //   document_type_id: DOCUMENT_TYPE_ID
    //   // }
    //   // }
    // )

    // console.log('DOCUMENTS', documents)

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let total = 0
    let subtotal = 0
    let taxes = 0
    let count = 0

    for (const doc of documents) {
      const docDate = new Date(doc.date)

      if (
        docDate.getMonth() === currentMonth &&
        docDate.getFullYear() === currentYear
      ) {
        total += Number(doc.total)
        subtotal += Number(doc.subtotal)
        taxes += Number(doc.total_taxes)
        count++
      }
    }

    console.log('TOTAL', total)

    return [
      {
        title: 'Compras del mes',
        icon: 'i-lucide-circle-dollar-sign',
        value: formatCurrency(total),
        variation: 0
      },
      {
        title: 'Subtotal compras',
        icon: 'i-lucide-receipt',
        value: formatCurrency(subtotal),
        variation: 0
      },
      {
        title: 'Impuestos compras',
        icon: 'i-lucide-landmark',
        value: formatCurrency(taxes),
        variation: 0
      },
      {
        title: 'Facturas de compra',
        icon: 'i-lucide-file-text',
        value: count,
        variation: 0
      }
    ]
  },
  {
    watch: [() => props.period, () => props.range],
    default: () => [] as Stat[]
  }
)
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      to="/customers"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading:
          'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>

        <UBadge
          :color="stat.variation > 0 ? 'success' : 'error'"
          variant="subtle"
          class="text-xs"
        >
          {{ stat.variation > 0 ? '+' : '' }}{{ stat.variation }}%
        </UBadge>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
