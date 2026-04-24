<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import { DocumentsSalesService } from '~/modulos/erp/sales/sales.service'
import {
  STATUS_LABELS,
  STATUS_COLORS
} from '~/modulos/erp/sales/types/sales.types'
import type { SaleDocument } from '~/modulos/erp/sales/types/sales.types'

// ─── Filtros ──────────────────────────────────────────────────────────────────
const statusFilter = ref<number | undefined>(undefined)
const generating = ref(false)
const generateResult = ref<{ total_trips: number; results: any[] } | null>(null)

// ─── Fetch ────────────────────────────────────────────────────────────────────
const {
  data: documents,
  pending,
  error,
  refresh
} = await useAsyncData(
  'documents-sales',
  () => DocumentsSalesService.getAll({ status: statusFilter.value }),
  { server: false }
)

watch(statusFilter, () => refresh())

// ─── Estadísticas ─────────────────────────────────────────────────────────────
const stats = computed(() => {
  const docs = documents.value ?? []
  return {
    total: docs.length,
    pendiente: docs.filter((d) => d.status === 1).length,
    confirmado: docs.filter((d) => d.status === 2).length,
    anulado: docs.filter((d) => d.status === 3).length,
    totalPendiente: docs
      .filter((d) => d.status === 1)
      .reduce((a, d) => a + Number(d.total), 0),
    totalConfirmado: docs
      .filter((d) => d.status === 2)
      .reduce((a, d) => a + Number(d.total), 0)
  }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(n ?? 0)
}

function fmtDate(d?: string) {
  return d ? d.slice(0, 10) : '-'
}

// ─── Acciones ─────────────────────────────────────────────────────────────────
async function generateFromTrips() {
  generating.value = true
  try {
    generateResult.value = await DocumentsSalesService.generateFromAllTrips()
    await refresh()
  } catch (e) {
    console.error(e)
  } finally {
    generating.value = false
  }
}

// ─── Columnas ─────────────────────────────────────────────────────────────────
const columns = [
  { id: 'number', header: 'Nº' },
  { id: 'date', header: 'Fecha' },
  { id: 'client', header: 'Cliente' },
  { id: 'descrip', header: 'Descripción' },
  { id: 'total', header: 'Total' },
  { id: 'status', header: 'Estado' },
  { id: 'actions', header: '' }
]

const statusOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Borrador', value: 0 },
  { label: 'Pendiente', value: 1 },
  { label: 'Confirmado', value: 2 },
  { label: 'Anulado', value: 3 }
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Facturas de Venta">
        <template #trailing>
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-refresh-cw"
              variant="ghost"
              color="neutral"
              :loading="generating"
              label="Generar desde viajes"
              @click="generateFromTrips"
            />
            <UButton
              icon="i-lucide-plus"
              color="primary"
              label="Nueva factura"
              :to="'/erp/sales/new'"
            />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-5">
        <!-- Resultado de generación -->
        <UAlert
          v-if="generateResult"
          color="success"
          variant="subtle"
          icon="i-lucide-check-circle"
          :title="`Generados: ${generateResult.results.reduce((a, r) => a + r.created, 0)} — Existentes: ${generateResult.results.reduce((a, r) => a + r.skipped, 0)}`"
          closable
          @close="generateResult = null"
        />

        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          title="Error al cargar documentos"
        />

        <!-- Estadísticas -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <UPageCard variant="subtle">
            <div class="space-y-1">
              <p class="text-xs text-muted">Pendientes</p>
              <p class="text-2xl font-semibold text-warning-500">
                {{ stats.pendiente }}
              </p>
              <p class="text-xs text-muted">{{ fmt(stats.totalPendiente) }}</p>
            </div>
          </UPageCard>

          <UPageCard variant="subtle">
            <div class="space-y-1">
              <p class="text-xs text-muted">Confirmados</p>
              <p class="text-2xl font-semibold text-success-500">
                {{ stats.confirmado }}
              </p>
              <p class="text-xs text-muted">{{ fmt(stats.totalConfirmado) }}</p>
            </div>
          </UPageCard>

          <UPageCard variant="subtle">
            <div class="space-y-1">
              <p class="text-xs text-muted">Anulados</p>
              <p class="text-2xl font-semibold text-error-500">
                {{ stats.anulado }}
              </p>
            </div>
          </UPageCard>

          <UPageCard variant="subtle">
            <div class="space-y-1">
              <p class="text-xs text-muted">Total documentos</p>
              <p class="text-2xl font-semibold">{{ stats.total }}</p>
            </div>
          </UPageCard>
        </div>

        <!-- Filtro por estado -->
        <div class="flex gap-2 flex-wrap">
          <UButton
            v-for="opt in statusOptions"
            :key="String(opt.value)"
            :variant="statusFilter === opt.value ? 'solid' : 'ghost'"
            color="neutral"
            size="sm"
            :label="opt.label"
            @click="statusFilter = opt.value"
          />
        </div>

        <!-- Tabla -->
        <UPageCard variant="subtle">
          <UTable :data="documents ?? []" :columns="columns" :loading="pending">
            <template #number-cell="{ row }">
              <span class="font-mono font-medium">
                {{ row.original.document_types?.code }}-{{
                  String(row.original.number).padStart(8, '0')
                }}
              </span>
            </template>

            <template #date-cell="{ row }">
              {{ fmtDate(row.original.date) }}
            </template>

            <template #client-cell="{ row }">
              {{ row.original.business_parties?.name ?? '-' }}
            </template>

            <template #descrip-cell="{ row }">
              <span class="text-muted text-xs">
                {{ row.original.descrip ?? '-' }}
              </span>
            </template>

            <template #total-cell="{ row }">
              <span class="font-medium">
                {{ fmt(Number(row.original.total)) }}
              </span>
            </template>

            <template #status-cell="{ row }">
              <UBadge
                :label="STATUS_LABELS[row.original.status]"
                :color="STATUS_COLORS[row.original.status] as any"
                variant="subtle"
              />
            </template>

            <template #actions-cell="{ row }">
              <UButton
                icon="i-lucide-eye"
                variant="ghost"
                color="neutral"
                size="sm"
                :to="`/erp/sales/${row.original.id}`"
              />
            </template>
          </UTable>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
