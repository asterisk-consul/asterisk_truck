<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import { storeToRefs } from 'pinia'

import { DocumentsSalesService } from '~/modulos/erp/sales/sales.service'
import { useBusinessPartiesStore } from '~/modulos/logistica/master-data/bussiness-parties/bussines-parties.store'
import { useProductsStore } from '~/modulos/logistica/master-data/product/products.store'
import { useBusinessParties } from '~/modulos/logistica/master-data/bussiness-parties/composable/useBusinessParties'
import { useProducts } from '~/modulos/logistica/master-data/product/composable/useProducts'

const router = useRouter()
const toast = useToast()

// ✅ instanciar servicio
const salesService = DocumentsSalesService

const store = useBusinessPartiesStore()
const { items: parties } = storeToRefs(store)
const { items: partyOptions } = useBusinessParties(parties)

// ── Productos ─────────────────────────────────────────────────────
// ✔ Productos
const productStore = useProductsStore()
const { items: products } = storeToRefs(productStore)

const { items: productOptions } = useProducts(products)
onMounted(async () => {
  await store.fetchAll()
  await productStore.fetchAll()
  console.log(productStore.items)
})
// ── Form ──────────────────────────────────────────────────────────
const form = reactive({
  document_type_id: '84052621-1431-425b-a301-ce6429fafb6a',
  party_id: '',
  date: new Date().toISOString().slice(0, 10),
  descrip: '',
  ref: ''
})

const selectedParty = ref<{ label: string; value: string } | null>(null)

watch(selectedParty, (v) => {
  form.party_id = v?.value ?? ''
})

// ── Items ─────────────────────────────────────────────────────────
interface LineItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  price: number
  tax_rate: number
  tax_id: string
  tax_amount: number
}

const items = ref<LineItem[]>([])
const selectedProduct = ref<any>(null)

function addItem() {
  if (!selectedProduct.value) return

  const prod = productOptions.value.find(
    (p) => p.value === selectedProduct.value?.value
  )
  if (!prod) return

  items.value.push({
    product_id: prod.value,
    product_name: prod.label,
    quantity: 1,
    unit_price: prod.price,
    price: prod.price,
    tax_rate: prod.tax?.rate ?? 21,
    tax_id: prod.tax?.id ?? '',
    tax_amount: parseFloat(
      (prod.price * ((prod.tax?.rate ?? 21) / 100)).toFixed(2)
    )
  })

  selectedProduct.value = null
}

function removeItem(idx: number) {
  items.value.splice(idx, 1)
}

function updateItemQty(idx: number, qty: number) {
  const item = items.value[idx]
  if (!item) return

  item.quantity = qty
  item.price = parseFloat((item.unit_price * qty).toFixed(2))
  item.tax_amount = parseFloat((item.price * (item.tax_rate / 100)).toFixed(2))
}

// ── Totales ───────────────────────────────────────────────────────
const subtotal = computed(() =>
  items.value.reduce((acc, i) => acc + i.price, 0)
)

const totalTaxes = computed(() =>
  items.value.reduce((acc, i) => acc + i.tax_amount, 0)
)

const total = computed(() => subtotal.value + totalTaxes.value)

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(n ?? 0)
}

// ── Submit ────────────────────────────────────────────────────────
const saving = ref(false)

async function submit() {
  if (!form.party_id) {
    toast.add({ title: 'Seleccioná un cliente', color: 'warning' })
    return
  }

  if (!items.value.length) {
    toast.add({ title: 'Agregá al menos un ítem', color: 'warning' })
    return
  }

  const taxesMap = new Map<
    string,
    {
      tax_id: string
      tax_rate: number
      taxable_base: number
      tax_amount: number
    }
  >()

  for (const item of items.value) {
    if (!item.tax_id) continue

    const existing = taxesMap.get(item.tax_id)

    if (existing) {
      existing.taxable_base += item.price
      existing.tax_amount += item.tax_amount
    } else {
      taxesMap.set(item.tax_id, {
        tax_id: item.tax_id,
        tax_rate: item.tax_rate,
        taxable_base: item.price,
        tax_amount: item.tax_amount
      })
    }
  }

  const payload = {
    document_type_id: form.document_type_id,
    party_id: form.party_id,
    date: form.date,
    descrip: form.descrip || undefined,
    ref: form.ref || undefined,
    subtotal: subtotal.value,
    exempt_amount: 0,
    total_taxes: totalTaxes.value,
    total: total.value,
    items: items.value.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
      price: i.price,
      taxes: i.tax_id
        ? [
            {
              tax_id: i.tax_id,
              tax_rate: i.tax_rate,
              tax_amount: i.tax_amount
            }
          ]
        : []
    })),
    taxes: Array.from(taxesMap.values())
  }

  try {
    saving.value = true

    const created = await salesService.create(payload)

    toast.add({ title: 'Factura creada', color: 'success' })

    router.push(`/erp/sales/${created.id}`)
  } catch (e: any) {
    console.error('ERROR CREATE:', e)

    toast.add({
      title: 'Error al crear factura',
      description: e?.data?.message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Nueva Factura de Venta">
        <template #leading>
          <UButton
            icon="i-heroicons-arrow-left"
            variant="ghost"
            @click="router.push('/erp/sales')"
          />
        </template>
        <template #right>
          <UButton icon="i-heroicons-check" :loading="saving" @click="submit">
            Guardar
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-4 space-y-5 max-w-4xl mx-auto">
        <!-- DATOS -->
        <div class="border border-primary-300 rounded-xl p-5 space-y-4">
          <span class="text-sm font-semibold">Datos generales</span>

          <USelectMenu
            v-model="selectedParty"
            :items="partyOptions"
            placeholder="Cliente"
            searchable
            clear
            class="w-full"
          />

          <UInput v-model="form.date" type="date" />
        </div>

        <!-- ITEMS -->
        <div class="border border-primary-300 rounded-xl p-5 space-y-4">
          <USelectMenu
            v-model="selectedProduct"
            :items="productOptions"
            placeholder="Producto"
            searchable
            clear
            class="w-full"
          />

          <UButton @click="addItem">Agregar</UButton>

          <div v-if="!items.length" class="text-gray-400">Sin items</div>

          <div v-for="(item, i) in items" :key="i">
            {{ item.product_name }} - {{ fmt(item.price) }}
          </div>
        </div>

        <!-- TOTAL -->
        <div v-if="items.length">Total: {{ fmt(total) }}</div>
      </div>
    </template>
  </UDashboardPanel>
</template>
