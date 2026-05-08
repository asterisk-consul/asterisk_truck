<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import { DocumentsSalesService } from '~/modulos/erp/sales/sales.service'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type SaleDocument
} from '~/modulos/erp/sales/types/sales.types'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// ✅ instanciar correctamente
const salesService = DocumentsSalesService

// ── ID ────────────────────────────────────────────────────────────
const docId = computed(() => route.params.id as string)

// ── STATE ─────────────────────────────────────────────────────────
const doc = ref<SaleDocument | null>(null)
const pending = ref(false)
const error = ref<any>(null)

// ── FETCH ─────────────────────────────────────────────────────────
async function fetchDoc() {
  if (!docId.value) return

  try {
    pending.value = true
    error.value = null

    doc.value = await salesService.getOne(docId.value)
  } catch (e) {
    console.error(e)
    error.value = e
    toast.add({ title: 'Error al cargar documento', color: 'error' })
  } finally {
    pending.value = false
  }
}

// cargar inicial
await fetchDoc()

// recargar si cambia la ruta
watch(docId, async () => {
  await fetchDoc()
})

// ── Helpers ───────────────────────────────────────────────────────
function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(n ?? 0)
}

function fmtDate(d?: string) {
  return d ? d.slice(0, 10) : '-'
}

// ── Acciones ──────────────────────────────────────────────────────
const confirming = ref(false)
const cancelling = ref(false)
const deleting = ref(false)

async function confirmDoc() {
  if (!docId.value) return

  try {
    confirming.value = true
    await salesService.confirm(docId.value)

    toast.add({ title: 'Documento confirmado', color: 'success' })

    await fetchDoc() // ✅ reemplazo de refresh
  } catch (e) {
    console.error(e)
    toast.add({ title: 'Error al confirmar', color: 'error' })
  } finally {
    confirming.value = false
  }
}

async function cancelDoc() {
  if (!docId.value) return

  try {
    cancelling.value = true
    await salesService.cancel(docId.value)

    toast.add({ title: 'Documento anulado', color: 'warning' })

    await fetchDoc() // ✅
  } catch (e) {
    console.error(e)
    toast.add({ title: 'Error al anular', color: 'error' })
  } finally {
    cancelling.value = false
  }
}

async function deleteDoc() {
  if (!docId.value) return

  try {
    deleting.value = true
    await salesService.remove(docId.value)

    toast.add({ title: 'Borrador eliminado', color: 'success' })
    router.push('/erp/sales')
  } catch (e) {
    console.error(e)
    toast.add({ title: 'Error al eliminar', color: 'error' })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <UDashboardPanel>
    <!-- HEADER -->
    <template #header>
      <UDashboardNavbar
        :title="doc?.ref ? `Factura ${doc.ref}` : 'Detalle de venta'"
      >
        <template #leading>
          <UButton
            icon="i-heroicons-arrow-left"
            variant="ghost"
            @click="router.push('/erp/sales')"
          />
        </template>

        <template #right>
          <!-- Estado -->
          <UBadge
            v-if="doc"
            :color="STATUS_COLORS[doc.status]"
            :label="STATUS_LABELS[doc.status]"
            variant="subtle"
          />

          <!-- Confirmar -->
          <UButton
            v-if="doc?.status === 1"
            icon="i-heroicons-check-circle"
            size="sm"
            color="success"
            :loading="confirming"
            @click="confirmDoc"
          >
            Confirmar
          </UButton>

          <!-- Anular -->
          <UButton
            v-if="doc?.status === 1 || doc?.status === 2"
            icon="i-heroicons-x-circle"
            size="sm"
            color="error"
            variant="soft"
            :loading="cancelling"
            @click="cancelDoc"
          >
            Anular
          </UButton>

          <!-- Editar -->
          <UButton
            v-if="doc?.status === 0"
            icon="i-heroicons-pencil"
            size="sm"
            variant="outline"
            @click="router.push(`/erp/sales/${docId}/edit`)"
          >
            Editar
          </UButton>

          <!-- Eliminar -->
          <UButton
            v-if="doc?.status === 0"
            icon="i-heroicons-trash"
            size="sm"
            color="error"
            variant="ghost"
            :loading="deleting"
            @click="deleteDoc"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <!-- BODY -->
    <template #body>
      <!-- SIN ID -->
      <div v-if="!docId" class="p-8 text-center text-gray-400">ID inválido</div>

      <!-- DATA -->
      <div v-else-if="doc" class="p-4 space-y-5">
        <!-- INFO -->
        <div
          class="border-primary-400 rounded-xl border p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div>
            <span class="text-xs text-gray-400">Fecha</span>
            <div>{{ fmtDate(doc.date) }}</div>
          </div>

          <div>
            <span class="text-xs text-gray-400">Cliente</span>
            <div>{{ doc.business_parties?.name || doc.party_id }}</div>
          </div>

          <div>
            <span class="text-xs text-gray-400">Tipo</span>
            <div>
              {{ doc.document_types.description || doc.document_type_id }}
            </div>
          </div>

          <div>
            <span class="text-xs text-gray-400">Ref</span>
            <div>{{ doc.ref || '-' }}</div>
          </div>
        </div>

        <!-- ITEMS -->
        <div class="border-primary-400 rounded-xl border overflow-hidden">
          <div class="px-4 py-3 border-b">Ítems</div>

          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="px-4 py-2 text-left">Producto</th>
                <th class="px-4 py-2 text-right">Cant.</th>
                <th class="px-4 py-2 text-right">Precio</th>
                <th class="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item, index) in doc.document_items"
                :key="item.id ?? item.product_id ?? `tmp-${index}`"
              >
                <td class="px-4 py-2">
                  {{ item.products || item.product_id }}
                </td>
                <td class="px-4 py-2 text-right">
                  {{ item.quantity }}
                </td>
                <td class="px-4 py-2 text-right">
                  {{ fmt(item.unit_price) }}
                </td>
                <td class="px-4 py-2 text-right">
                  {{ fmt(item.price) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- TOTALES -->
        <div class="flex justify-end">
          <div class="border-primary-400 rounded-xl border p-5 w-80 space-y-2">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>{{ fmt(doc.subtotal) }}</span>
            </div>

            <div
              v-for="t in doc.document_taxes"
              :key="t.tax_id"
              class="flex justify-between"
            >
              <span>IVA {{ t.tax_rate }}%</span>
              <span>{{ fmt(t.tax_amount) }}</span>
            </div>

            <div class="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{{ fmt(doc.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
