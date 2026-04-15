<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import { PurchasesService } from '~/modulos/erp/purchases/purchases.service'

const route = useRoute()

// --- Params ---
const productId = computed(() => route.params.id as string)

// --- Filters ---
const filters = reactive({
  startDate: (route.query.startDate as string) || '2026-01-01',
  endDate: (route.query.endDate as string) || '2026-12-31',
  supplierId: Array.isArray(route.query.supplierId)
    ? route.query.supplierId[0]
    : route.query.supplierId
})

// --- Fetch ---
const { data, pending, error, refresh } = await useAsyncData(
  `product-movements-${productId.value}`,
  async () => {
    if (!productId.value) return null

    console.log('FRONT productId:', productId.value)
    console.log('FRONT filters:', filters)

    try {
      const [detail, movements] = await Promise.all([
        // ✅ método correcto
        PurchasesService.getProductById(productId.value),

        // ✅ método correcto + productId incluido
        PurchasesService.getMovements({
          ...filters,
          productId: productId.value
        })
      ])

      return {
        ...detail,
        movements
      }
    } catch (e) {
      console.error('API ERROR:', e)

      // fallback
      const movements = await PurchasesService.getMovements({
        ...filters,
        productId: productId.value
      })

      return {
        productName: 'Sin datos',
        movements
      }
    }
  }
)

// --- Total ---
const totalMovements = computed(() => {
  return (data.value?.movements || []).reduce(
    (acc: number, m: any) => acc + (m.adjustedValue || 0),
    0
  )
})

// --- Helpers ---
function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(n ?? 0)
}

function fmtDate(d?: string) {
  return d ? d.slice(0, 10) : '-'
}

// --- Refetch ---
function applyFilters() {
  refresh()
}
</script>

<template>
  <UDashboardPanel>
    <!-- HEADER -->
    <template #header>
      <UDashboardNavbar :title="data?.productName || 'Detalle producto'">
        <template #leading>
          <UButton
            icon="i-heroicons-arrow-left"
            variant="ghost"
            @click="$router.back()"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="p-4 space-y-5">
        <!-- Filtros -->
        <div class="flex gap-3 flex-wrap items-end">
          <UInput v-model="filters.startDate" type="date" size="sm" />
          <UInput v-model="filters.endDate" type="date" size="sm" />

          <UButton
            size="sm"
            icon="i-heroicons-arrow-path"
            :loading="pending"
            @click="applyFilters"
          >
            Aplicar
          </UButton>
        </div>

        <UAlert v-if="error" color="error" title="Error al cargar datos" />

        <!-- Tabla -->
        <div class="bg-white dark:bg-gray-900 p-4 rounded-lg border">
          <div class="flex justify-between mb-3">
            <span class="text-xs text-gray-400">Movimientos</span>
            <span class="text-sm font-medium">
              Total: {{ fmt(totalMovements) }}
            </span>
          </div>

          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-400 border-b">
                <th class="text-left">Fecha</th>
                <th>Tipo</th>
                <th>Proveedor</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              <tr v-if="pending">
                <td colspan="4" class="text-center py-6">Cargando...</td>
              </tr>

              <tr v-else-if="!data?.movements?.length">
                <td colspan="4" class="text-center py-6">Sin movimientos</td>
              </tr>

              <tr
                v-for="m in data?.movements || []"
                :key="m.ref + m.number"
                class="border-b"
              >
                <td>{{ fmtDate(m.date) }}</td>
                <td>{{ m.documentTypeName }}</td>
                <td>{{ m.supplierName }}</td>
                <td class="text-right">
                  {{ fmt(m.adjustedValue) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
