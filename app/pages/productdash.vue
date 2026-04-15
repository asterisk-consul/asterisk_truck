<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import { Chart, registerables } from 'chart.js'
import { PurchasesService } from '~/modulos/erp/purchases/purchases.service'
import type {
  SummaryFilters,
  PurchaseSummaryResponse
} from '~/modulos/erp/purchases/types/purchases.types'
import type { ButtonProps } from '@nuxt/ui'

Chart.register(...registerables)

// --- Estado ---
const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<PurchaseSummaryResponse | null>(null)

const filters = ref<SummaryFilters>({
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  supplierId: undefined
})

const search = ref('')
const sortCol = ref<string>('totalPurchases')
const sortDir = ref<1 | -1>(-1)

const barChartRef = ref<HTMLCanvasElement | null>(null)
const doughChartRef = ref<HTMLCanvasElement | null>(null)
let barChartInstance: Chart | null = null
let doughChartInstance: Chart | null = null

const PALETTE = [
  '#185FA5',
  '#0F6E56',
  '#993C1D',
  '#6B3F9C',
  '#854F0B',
  '#A32D2D',
  '#0C7C93',
  '#3B6D11',
  '#7A4A8C',
  '#5F5E5A'
]

const links = ref<ButtonProps[]>([
  {
    label: 'Exportar CSV',
    icon: 'i-heroicons-arrow-down-tray',
    onClick: exportCSV,
    color: 'neutral',
    variant: 'outline'
  }
])

// --- Fetch ---
async function fetchData() {
  loading.value = true
  error.value = null
  try {
    data.value = await PurchasesService.getSummary(filters.value)
  } catch (e: any) {
    error.value = e?.message ?? 'Error al cargar datos'
  } finally {
    loading.value = false
  }
}

function goToProduct(p: any) {
  const id = p.productId || p.id

  console.log('ID QUE SE ENVÍA:', id, p)

  if (!id || id === '[id].vue') {
    console.error('ID inválido', id, p)
    return
  }

  navigateTo({
    path: `/erp/purchases/products/${id}`,
    query: {
      startDate: filters.value.startDate,
      endDate: filters.value.endDate,
      supplierId: filters.value.supplierId
    }
  })
}

// --- Métricas ---
const metrics = computed(() => {
  if (!data.value) return []
  const d = data.value
  const prods = d.products ?? []
  const positiveTotal = prods
    .filter((p) => p.totalPurchases > 0)
    .reduce((a, b) => a + b.totalPurchases, 0)
  const negTotal = d.negTotal ?? 0
  const taxRate =
    d.globalTotal > 0 ? ((d.globalTaxes / d.globalTotal) * 100).toFixed(1) : '0'
  return [
    {
      label: 'Total Gravado',
      value: fmt(d.globalTotal),
      sub: `${d.globalTransactionCount} transacciones`
    },
    {
      label: 'Total Impuestos',
      value: fmt(d.globalTaxes),
      sub: `${taxRate}% sobre compras`
    },
    {
      label: 'Total Exento',
      value: fmt(d.globalExempt),
      sub: `${taxRate}% sobre compras`
    },
    {
      label: 'Total',
      value: fmt(d.globalTotal + d.globalTaxes + d.globalExempt),
      sub: `${taxRate}% sobre compras`
    },
    {
      label: 'Productos únicos',
      value: String(d.totalProducts),
      sub: 'categorías activas'
    },
    { label: 'Subtotal positivo', value: fmt(positiveTotal), sub: 'sin NC' },
    {
      label: 'Notas de crédito',
      value: fmt(negTotal),
      sub: 'ajustes negativos'
    }
  ]
})

// --- Tabla ---
const products = computed(() => data.value?.products ?? [])

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return products.value
    .filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q)
    )
    .slice()
    .sort((a, b) => {
      const av = (a as any)[sortCol.value]
      const bv = (b as any)[sortCol.value]
      if (typeof av === 'string') return sortDir.value * av.localeCompare(bv)
      return sortDir.value * ((av ?? 0) - (bv ?? 0))
    })
})

const maxAbs = computed(() =>
  Math.max(...filtered.value.map((p) => Math.abs(p.totalPurchases) || 0), 1)
)

function setSort(col: string) {
  if (sortCol.value === col) sortDir.value = sortDir.value === -1 ? 1 : -1
  else {
    sortCol.value = col
    sortDir.value = -1
  }
}

function sortIcon(col: string) {
  if (sortCol.value !== col) return '↕'
  return sortDir.value === -1 ? '↓' : '↑'
}

// --- Gráficos ---
async function renderCharts() {
  await nextTick()
  const prods = products.value
  if (!prods.length) return

  const top8 = [...prods]
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
    .slice(0, 8)
  if (barChartInstance) barChartInstance.destroy()
  if (barChartRef.value) {
    barChartInstance = new Chart(barChartRef.value, {
      type: 'bar',
      data: {
        labels: top8.map((p) =>
          p.productName.length > 20
            ? p.productName.slice(0, 20) + '…'
            : p.productName
        ),
        datasets: [
          {
            data: top8.map((p) => Math.round(p.totalPurchases)),
            backgroundColor: top8.map((_, i) => PALETTE[i % PALETTE.length]),
            borderRadius: 3,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ' ' + fmt(c.parsed.x) } }
        },
        scales: {
          x: {
            ticks: { callback: (v) => fmtShort(Number(v)), font: { size: 10 } },
            grid: { color: 'rgba(128,128,128,0.08)' }
          },
          y: { ticks: { font: { size: 10 } }, grid: { display: false } }
        }
      }
    })
  }

  const posProds = prods
    .filter((p) => p.totalPurchases > 0)
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
  const top5 = posProds.slice(0, 5)
  const otherSum = posProds.slice(5).reduce((a, b) => a + b.totalPurchases, 0)
  const dData = [
    ...top5.map((p) => Math.round(p.totalPurchases)),
    Math.round(otherSum)
  ]
  const dColors = [...PALETTE.slice(0, 5), '#B4B2A9']

  if (doughChartInstance) doughChartInstance.destroy()
  if (doughChartRef.value) {
    doughChartInstance = new Chart(doughChartRef.value, {
      type: 'doughnut',
      data: {
        labels: [...top5.map((p) => p.productName), 'Otros'],
        datasets: [
          {
            data: dData,
            backgroundColor: dColors,
            borderWidth: 1,
            borderColor: 'transparent'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const t = dData.reduce((a, b) => a + b, 0)
                return ` ${fmt(c.parsed)} (${t > 0 ? ((c.parsed / t) * 100).toFixed(1) : 0}%)`
              }
            }
          }
        }
      }
    })
  }
}

// --- Donut legend ---
const doughLegend = computed(() => {
  const posProds = products.value
    .filter((p) => p.totalPurchases > 0)
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
  const top5 = posProds.slice(0, 5)
  const otherSum = posProds.slice(5).reduce((a, b) => a + b.totalPurchases, 0)
  const items = [
    ...top5.map((p, i) => ({
      label: p.productName,
      color: PALETTE[i],
      value: p.totalPurchases
    })),
    { label: 'Otros', color: '#B4B2A9', value: otherSum }
  ]
  const total = items.reduce((a, b) => a + b.value, 0)
  return items.map((i) => ({
    ...i,
    pct: total > 0 ? ((i.value / total) * 100).toFixed(1) : '0'
  }))
})

// --- CSV ---
function exportCSV() {
  const headers = [
    'Código',
    'Producto',
    'Total Gravado',
    'Total Impuestos',
    'Transacciones',
    'Facturas',
    'NC',
    'Promedio',
    '1ra compra',
    'Últ. compra'
  ]
  const rows = filtered.value.map((p) => [
    p.productCode,
    p.productName,
    p.totalPurchases,
    p.totalTaxes,
    p.transactionCount,
    p.invoiceCount,
    p.creditNoteCount,
    p.avgPurchaseValue,
    fmtDate(p.firstPurchaseDate),
    fmtDate(p.lastPurchaseDate)
  ])
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = 'compras.csv'
  a.click()
}

// --- Helpers ---
function fmt(n: number | null | undefined): string {
  if (n == null) return '-'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n)
}
function fmtShort(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  if (abs >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M'
  if (abs >= 1e3) return '$' + (n / 1e3).toFixed(0) + 'K'
  return '$' + n.toFixed(0)
}
function fmtDate(d?: string): string {
  return d ? d.slice(0, 10) : '-'
}

watch(data, () => renderCharts())
onMounted(fetchData)
</script>

<template>
  <UDashboardPanel id="compras-dashboard" :ui="{ body: 'overflow-y-auto' }">
    <!-- ── Header con navbar y botón de colapso ── -->
    <template #header>
      <UDashboardNavbar
        title="Dashboard de compras"
        :ui="{
          title: 'truncate min-w-0',
          right: 'gap-3 flex-shrink-0'
        }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            v-for="link in links"
            :key="link.label"
            :label="link.label"
            :icon="link.icon"
            :color="link.color"
            :variant="link.variant"
            size="sm"
            @click="link.onClick"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- ── Cuerpo con scroll ── -->
    <template #body>
      <div class="flex flex-col gap-5 p-4 min-h-0 h-full">
        <!-- Panel superior: filtros + métricas + gráficos -->
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-5"
        >
          <!-- Filtros -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">Desde</span>
              <UInput v-model="filters.startDate" type="date" size="sm" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">Hasta</span>
              <UInput v-model="filters.endDate" type="date" size="sm" />
            </div>
            <UButton
              size="sm"
              color="primary"
              variant="solid"
              icon="i-heroicons-arrow-path"
              :loading="loading"
              @click="fetchData"
            >
              Actualizar
            </UButton>
          </div>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="error"
            icon="i-heroicons-exclamation-triangle"
          />

          <!-- Métricas -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <template v-if="loading">
              <div
                v-for="i in 5"
                :key="i"
                class="rounded-lg bg-gray-100 dark:bg-gray-800 h-20 animate-pulse"
              />
            </template>
            <template v-else>
              <div
                v-for="m in metrics"
                :key="m.label"
                class="rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 p-3 flex flex-col gap-1"
              >
                <span
                  class="text-[10px] text-gray-400 uppercase tracking-wider"
                >
                  {{ m.label }}
                </span>
                <span class="text-sm font-medium leading-tight tabular-nums">
                  {{ m.value }}
                </span>
                <span class="text-[10px] text-gray-400">{{ m.sub }}</span>
              </div>
            </template>
          </div>

          <!-- Gráficos -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div class="space-y-2">
              <p
                class="text-xs font-medium text-gray-400 uppercase tracking-wide"
              >
                Top 8 por monto
              </p>
              <div class="relative h-52">
                <canvas ref="barChartRef" />
              </div>
            </div>
            <div class="space-y-2">
              <p
                class="text-xs font-medium text-gray-400 uppercase tracking-wide"
              >
                Distribución
              </p>
              <div class="flex flex-wrap gap-x-3 gap-y-1">
                <span
                  v-for="item in doughLegend"
                  :key="item.label"
                  class="flex items-center gap-1 text-[10px] text-gray-500"
                >
                  <span
                    class="w-2 h-2 rounded-sm flex-shrink-0"
                    :style="{ background: item.color }"
                  />
                  {{
                    item.label.length > 14
                      ? item.label.slice(0, 14) + '…'
                      : item.label
                  }}
                  <span class="text-gray-400">{{ item.pct }}%</span>
                </span>
              </div>
              <div class="relative h-40">
                <canvas ref="doughChartRef" />
              </div>
            </div>
          </div>
        </div>

        <!-- Panel inferior: tabla -->
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3"
        >
          <div class="flex items-center justify-between gap-3">
            <p
              class="text-xs font-medium text-gray-400 uppercase tracking-wide"
            >
              Detalle por producto
            </p>
            <span class="text-xs text-gray-400">
              {{ filtered.length }} de {{ products.length }} productos
            </span>
          </div>

          <UInput
            v-model="search"
            placeholder="Buscar por producto o código…"
            icon="i-heroicons-magnifying-glass"
            size="sm"
          />

          <div
            class="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800"
          >
            <table
              class="w-full text-xs border-collapse"
              style="table-layout: fixed"
            >
              <thead>
                <tr
                  class="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700"
                >
                  <th
                    class="th"
                    style="width: 90px"
                    @click="setSort('productCode')"
                  >
                    Código
                    <span
                      :class="['sort', sortCol === 'productCode' && 'active']"
                    >
                      {{ sortIcon('productCode') }}
                    </span>
                  </th>
                  <th
                    class="th"
                    style="width: 190px"
                    @click="setSort('productName')"
                  >
                    Producto
                    <span
                      :class="['sort', sortCol === 'productName' && 'active']"
                    >
                      {{ sortIcon('productName') }}
                    </span>
                  </th>
                  <th
                    class="th tr"
                    style="width: 140px"
                    @click="setSort('totalPurchases')"
                  >
                    Total gravado
                    <span
                      :class="[
                        'sort',
                        sortCol === 'totalPurchases' && 'active'
                      ]"
                    >
                      {{ sortIcon('totalPurchases') }}
                    </span>
                  </th>
                  <th
                    class="th tr"
                    style="width: 130px"
                    @click="setSort('totalTaxes')"
                  >
                    Total Impuestos
                    <span
                      :class="['sort', sortCol === 'totalTaxes' && 'active']"
                    >
                      {{ sortIcon('totalTaxes') }}
                    </span>
                  </th>
                  <th
                    class="th tc"
                    style="width: 65px"
                    @click="setSort('transactionCount')"
                  >
                    Transac.
                    <span
                      :class="[
                        'sort',
                        sortCol === 'transactionCount' && 'active'
                      ]"
                    >
                      {{ sortIcon('transactionCount') }}
                    </span>
                  </th>
                  <th
                    class="th tc"
                    style="width: 65px"
                    @click="setSort('invoiceCount')"
                  >
                    Fact.
                    <span
                      :class="['sort', sortCol === 'invoiceCount' && 'active']"
                    >
                      {{ sortIcon('invoiceCount') }}
                    </span>
                  </th>
                  <th
                    class="th tc"
                    style="width: 50px"
                    @click="setSort('creditNoteCount')"
                  >
                    NC
                    <span
                      :class="[
                        'sort',
                        sortCol === 'creditNoteCount' && 'active'
                      ]"
                    >
                      {{ sortIcon('creditNoteCount') }}
                    </span>
                  </th>
                  <th
                    class="th tr"
                    style="width: 140px"
                    @click="setSort('avgPurchaseValue')"
                  >
                    Prom. compra
                    <span
                      :class="[
                        'sort',
                        sortCol === 'avgPurchaseValue' && 'active'
                      ]"
                    >
                      {{ sortIcon('avgPurchaseValue') }}
                    </span>
                  </th>
                  <th
                    class="th"
                    style="width: 90px"
                    @click="setSort('firstPurchaseDate')"
                  >
                    1ra compra
                    <span
                      :class="[
                        'sort',
                        sortCol === 'firstPurchaseDate' && 'active'
                      ]"
                    >
                      {{ sortIcon('firstPurchaseDate') }}
                    </span>
                  </th>
                  <th
                    class="th"
                    style="width: 90px"
                    @click="setSort('lastPurchaseDate')"
                  >
                    Últ. compra
                    <span
                      :class="[
                        'sort',
                        sortCol === 'lastPurchaseDate' && 'active'
                      ]"
                    >
                      {{ sortIcon('lastPurchaseDate') }}
                    </span>
                  </th>
                  <th class="th" style="width: 100px">Participación</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="11" class="text-center py-10 text-gray-400">
                    Cargando…
                  </td>
                </tr>
                <tr v-else-if="!filtered.length">
                  <td colspan="11" class="text-center py-10 text-gray-400">
                    Sin resultados
                  </td>
                </tr>
                <tr
                  v-for="p in filtered"
                  :key="p.productCode"
                  class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  @click="goToProduct(p)"
                >
                  <td class="td font-mono text-[10px] text-gray-400">
                    {{ p.productCode }}
                  </td>

                  <td class="td truncate" :title="p.productName">
                    <span
                      class="text-primary-600 hover:underline cursor-pointer"
                      @click.stop="goToProduct(p)"
                    >
                      {{ p.productName }}
                    </span>
                  </td>
                  <td
                    class="td tr tabular-nums"
                    :class="p.totalPurchases < 0 ? 'text-red-500' : ''"
                  >
                    {{ fmt(p.totalPurchases) }}
                  </td>
                  <td class="td tr tabular-nums">{{ fmt(p.totalTaxes) }}</td>
                  <td class="td tc">{{ p.transactionCount }}</td>
                  <td class="td tc">{{ p.invoiceCount }}</td>
                  <td class="td tc">
                    <UBadge
                      v-if="p.creditNoteCount > 0"
                      color="info"
                      variant="soft"
                      size="xs"
                    >
                      {{ p.creditNoteCount }}
                    </UBadge>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td
                    class="td tr tabular-nums"
                    :class="p.avgPurchaseValue < 0 ? 'text-red-500' : ''"
                  >
                    {{ fmt(p.avgPurchaseValue) }}
                  </td>
                  <td class="td text-gray-400">
                    {{ fmtDate(p.firstPurchaseDate) }}
                  </td>
                  <td class="td text-gray-400">
                    {{ fmtDate(p.lastPurchaseDate) }}
                  </td>
                  <td class="td">
                    <div class="flex items-center gap-1">
                      <div
                        class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden"
                      >
                        <div
                          class="h-full rounded-full"
                          :style="{
                            width:
                              (
                                (Math.abs(p.totalPurchases) / maxAbs) *
                                100
                              ).toFixed(1) + '%',
                            background:
                              p.totalPurchases < 0 ? '#ef4444' : '#185FA5'
                          }"
                        />
                      </div>
                      <span class="tabular-nums text-gray-400 w-6 text-right">
                        {{ ((p.totalPurchases / maxAbs) * 100).toFixed(0) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 500;
  font-size: 11px;
  color: rgb(156 163 175);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.th:hover {
  color: rgb(107 114 128);
}
.tr {
  text-align: right;
}
.tc {
  text-align: center;
}
.td {
  padding: 7px 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sort {
  font-size: 9px;
  margin-left: 2px;
  opacity: 0.3;
}
.sort.active {
  opacity: 1;
}
</style>
