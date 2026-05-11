<script setup lang="ts">
interface Props {
  document: any
}

const props = defineProps<Props>()

function fmt(n: any) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(Number(n ?? 0))
}

// Taxes de nivel LINE agrupadas por tax_id (vienen de document_item_taxes)
const lineTaxesSummary = computed(() => {
  const map = new Map<string, { name: string; code: string; amount: number }>()
  for (const item of props.document.document_items ?? []) {
    for (const t of item.document_item_taxes ?? []) {
      const key = t.tax_id
      const existing = map.get(key)
      if (existing) {
        existing.amount += Number(t.tax_amount ?? 0)
      } else {
        map.set(key, {
          name: t.taxes?.name ?? t.tax_id,
          code: t.taxes?.code ?? '',
          amount: Number(t.tax_amount ?? 0)
        })
      }
    }
  }
  return [...map.values()]
})

// Taxes de nivel DOCUMENT (vienen de document_taxes)
const documentTaxesSummary = computed(() =>
  (props.document.document_taxes ?? []).map((t: any) => ({
    tax_id: t.tax_id,
    name: t.taxes?.name ?? t.tax_id,
    code: t.taxes?.code ?? '',
    rate: Number(t.tax_rate ?? 0),
    taxableBase: Number(t.taxable_base ?? 0),
    amount: Number(t.tax_amount ?? 0)
  }))
)

// Subtotal total del documento para calcular proporciones
const subtotalTotal = computed(() =>
  (props.document.document_items ?? []).reduce(
    (acc: number, item: any) => acc + Number(item.price ?? 0),
    0
  )
)

// Por cada item, calcula los impuestos que le corresponden:
// - LINE: directo de document_item_taxes
// - DOCUMENT: proporcional según peso del item sobre el subtotal total
function taxesForItem(item: any): { name: string; amount: number }[] {
  const result: { name: string; amount: number }[] = []

  // Taxes de línea propias del item
  for (const t of item.document_item_taxes ?? []) {
    result.push({
      name: t.taxes?.name ?? t.tax_id,
      amount: Number(t.tax_amount ?? 0)
    })
  }

  // Taxes de documento: distribuir proporcionalmente
  const itemPrice = Number(item.price ?? 0)
  const total = subtotalTotal.value
  if (total > 0) {
    for (const docTax of documentTaxesSummary.value) {
      const proportional =
        Math.round((itemPrice / total) * docTax.amount * 100) / 100
      result.push({
        name: docTax.name,
        amount: proportional
      })
    }
  }

  return result
}

// Items enriquecidos con taxes calculadas y total por item
const enrichedItems = computed(() =>
  (props.document.document_items ?? []).map((item: any) => {
    const taxes = taxesForItem(item)
    const totalTaxes = taxes.reduce((acc, t) => acc + t.amount, 0)
    return {
      ...item,
      _taxes: taxes,
      _totalTaxes: totalTaxes,
      _total: Number(item.price ?? 0) + totalTaxes
    }
  })
)

const statusLabel: Record<number, { label: string; color: string }> = {
  0: { label: 'Borrador', color: 'neutral' },
  1: { label: 'Pendiente', color: 'warning' },
  2: { label: 'Confirmada', color: 'success' },
  3: { label: 'Anulada', color: 'error' }
}

const statusInfo = computed(
  () =>
    statusLabel[props.document.status] ?? {
      label: 'Desconocido',
      color: 'neutral'
    }
)
</script>

<template>
  <div class="space-y-6">
    <!-- Cabecera -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xl font-bold">Factura #{{ document.number }}</div>
            <div class="text-sm text-gray-500">
              {{ document.document_types?.description }}
            </div>
          </div>
          <UBadge :color="statusInfo.color as any">
            {{ statusInfo.label }}
          </UBadge>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-500">Cliente</div>
          <div class="font-medium">{{ document.business_parties?.name }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-500">Fecha</div>
          <div class="font-medium">{{ document.date?.slice(0, 10) }}</div>
        </div>
        <div v-if="document.descrip">
          <div class="text-sm text-gray-500">Descripción</div>
          <div class="font-medium">{{ document.descrip }}</div>
        </div>
        <div v-if="document.ref">
          <div class="text-sm text-gray-500">Referencia</div>
          <UTooltip text="Ver detalles del viaje">
            <div
              class="font-medium cursor-pointer text-blue-600 hover:underline"
              @click="$router.push(`/logistica/viajes/${document.ref}`)"
            >
              {{ document.ref }}
            </div>
          </UTooltip>
        </div>
      </div>
    </UCard>

    <!-- Items -->
    <UCard>
      <template #header>
        <div class="font-medium">Ítems</div>
      </template>

      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 dark:border-gray-700 text-left">
            <th class="pb-2 font-medium text-gray-500">Producto</th>
            <th class="pb-2 font-medium text-gray-500 text-right">Cant.</th>
            <th class="pb-2 font-medium text-gray-500 text-right">
              P. Unitario
            </th>
            <th class="pb-2 font-medium text-gray-500 text-right">Subtotal</th>
            <th class="pb-2 font-medium text-gray-500 text-right">Impuestos</th>
            <th class="pb-2 font-medium text-gray-500 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in enrichedItems"
            :key="item.id"
            class="border-b border-gray-100 dark:border-gray-800"
          >
            <td class="py-3 pr-4">
              {{ item.products?.name || item.products?.description || '—' }}
            </td>
            <td class="py-3 text-right">{{ Number(item.quantity) }}</td>
            <td class="py-3 text-right">{{ fmt(item.unit_price) }}</td>
            <td class="py-3 text-right">{{ fmt(item.price) }}</td>
            <td class="py-3 text-right">
              <div
                v-for="tax in item._taxes"
                :key="tax.name"
                class="text-xs text-gray-500"
              >
                {{ fmt(tax.amount) }}
              </div>
              <span v-if="!item._taxes.length" class="text-gray-400">—</span>
            </td>
            <td class="py-3 text-right font-medium">{{ fmt(item._total) }}</td>
          </tr>
        </tbody>
      </table>
    </UCard>

    <!-- Totales -->
    <UCard>
      <div class="space-y-2 max-w-sm ml-auto">
        <div class="flex justify-between">
          <span class="text-gray-500">Subtotal</span>
          <span>{{ fmt(document.subtotal) }}</span>
        </div>

        <!-- Taxes de línea -->
        <div
          v-for="tax in lineTaxesSummary"
          :key="'line-' + tax.code"
          class="flex justify-between text-sm"
        >
          <span>{{ fmt(tax.amount) }}</span>
        </div>

        <!-- Taxes de documento -->
        <div
          v-for="tax in documentTaxesSummary"
          :key="'doc-' + tax.code"
          class="flex justify-between text-sm"
        >
          <span class="text-gray-500">
            {{ tax.name }}
          </span>
          <span>{{ fmt(tax.amount) }}</span>
        </div>

        <UDivider />

        <div class="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{{ fmt(document.total) }}</span>
        </div>
      </div>
    </UCard>
  </div>
</template>
