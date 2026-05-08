<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'

import type { BusinessParty } from '~/modulos/logistica/master-data/bussiness-parties/types/bussines-parties.types'

import { storeToRefs } from 'pinia'

import { useBusinessPartiesStore } from '~/modulos/logistica/master-data/bussiness-parties/bussines-parties.store'

import BusinessPartyModal from '~/modulos/logistica/master-data/bussiness-parties/components/BusinnesPartyModal.vue'

import { useProductsStore } from '~/modulos/logistica/master-data/product/products.store'

import { useBusinessParties } from '~/modulos/logistica/master-data/bussiness-parties/composable/useBusinessParties'

import { useProducts } from '~/modulos/logistica/master-data/product/composable/useProducts'

import { useDocumentsTypesStore } from '~/modulos/erp/documents/documents-types/store/documents-types.store'

import { useDocumentsTypes } from '~/modulos/erp/documents/documents-types/composables/useDocumentsTypes'

import FacturaItemsTable from './FacturaItemsTable.vue'

import FacturaTotals from './FacturaTotals.vue'

import type { Document, FacturaItem, FacturaTax } from '../types/factura.types'

interface Props {
  loading?: boolean

  initialValues?: Partial<Document>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [payload: any]
}>()

const selectedBusinessParty = ref<BusinessParty | undefined>(undefined)
const showBusinessPartiesModal = ref(false)
const partiesStore = useBusinessPartiesStore()
const productsStore = useProductsStore()
const documentsTypesStore = useDocumentsTypesStore()
const { items: parties } = storeToRefs(partiesStore)
const { items: products } = storeToRefs(productsStore)
const { items: documentsTypes } = storeToRefs(documentsTypesStore)
const { items: partyOptions } = useBusinessParties(parties)
const { items: productOptions } = useProducts(products)
const { items: documentTypeOptions } = useDocumentsTypes(documentsTypes)

onMounted(async () => {
  await Promise.all([
    partiesStore.fetchAll(),

    productsStore.fetchAll(),

    documentsTypesStore.fetchAll()
  ])
})

const form = reactive({
  document_type_id: '',

  party_id: '',

  date: '',

  descrip: '',

  ref: ''
})

const items = ref<FacturaItem[]>([])
watch(
  () => props.initialValues,
  (value) => {
    if (!value) {
      return
    }

    console.log('DOCUMENT EDIT')
    console.log(value)

    form.document_type_id = value.document_type_id ?? ''

    form.party_id = value.party_id ?? ''

    form.date = value.date
      ? new Date(value.date).toISOString().split('T')[0]
      : ''

    form.descrip = value.descrip ?? ''

    form.ref = value.ref ?? ''

    items.value = (value.document_items ?? []).map((item: any) => {
      const taxes =
        item.document_item_taxes?.map((tax: any) => ({
          tax_id: tax.tax_id,

          name: tax.taxes?.name ?? '',

          code: tax.taxes?.code ?? '',

          tax_rate: Number(tax.tax_rate ?? 0),

          tax_amount: Number(tax.tax_amount ?? 0),

          calculation_level:
            tax.taxes?.calculation_level?.toLowerCase() ?? 'line',

          is_included_in_price: false
        })) ?? []

      const subtotal = Number(item.price ?? 0)

      const totalTaxes = taxes.reduce(
        (acc: number, tax: any) => acc + Number(tax.tax_amount || 0),
        0
      )

      return {
        product_id: item.product_id,

        product_name:
          item.products?.name || item.products?.description || 'Producto',

        quantity: Number(item.quantity ?? 0),

        unit_price: Number(item.unit_price ?? 0),

        price: subtotal,

        subtotal,

        taxes,

        total_taxes: totalTaxes,

        total: subtotal + totalTaxes
      }
    })

    console.log('ITEMS LOADED')
    console.log(items.value)
  },
  {
    immediate: true,
    deep: true
  }
)

const selectedCustomer = computed({
  get: () => partyOptions.value.find((i) => i.value === form.party_id),

  set: (option) => {
    form.party_id = option?.value ?? ''
  }
})

const selectedDocumentType = computed({
  get: () =>
    documentTypeOptions.value.find((i) => i.value === form.document_type_id),

  set: (option) => {
    form.document_type_id = option?.value ?? ''
  }
})

const currentDocumentType = computed(() =>
  documentsTypes.value.find((d) => d.id === form.document_type_id)
)

function addItem(prod: any) {
  // console.log('PRODUCT FULL')
  // console.log(prod)

  // console.log('CURRENT DOC')
  // console.log(currentDocumentType.value)

  // ─────────────────────────────────────
  // Precio
  // ─────────────────────────────────────
  const unitPrice = Number(prod.price ?? prod.data?.price ?? 0)

  const quantity = 1

  const subtotal = quantity * unitPrice

  // ─────────────────────────────────────
  // Taxes producto
  // ─────────────────────────────────────
  const productTaxes =
    prod.taxes?.map((t: any) => ({
      tax_id: t.tax_id,

      name: t.taxes?.name,

      code: t.taxes?.code,

      tax_rate: Number(t.taxes?.rate ?? 0),

      tax_amount: 0,

      calculation_level: String(
        t.taxes?.calculation_level ?? 'LINE'
      ).toLowerCase(),

      is_included_in_price: Boolean(t.is_included_in_price)
    })) ?? []

  // ─────────────────────────────────────
  // Taxes documento
  // ─────────────────────────────────────
  const documentTaxes =
    value.document_taxes?.map((tax: any) => ({
      tax_id: tax.tax_id,

      name: tax.taxes?.name ?? '',

      code: tax.taxes?.code ?? '',

      tax_rate: Number(tax.tax_rate ?? 0),

      tax_amount: Number(tax.tax_amount ?? 0),

      calculation_level:
        tax.taxes?.calculation_level?.toLowerCase() ?? 'document',

      is_included_in_price: false
    })) ?? []

  items.value = (value.document_items ?? []).map((item: any) => {
    const lineTaxes =
      item.document_item_taxes?.map((tax: any) => ({
        tax_id: tax.tax_id,

        name: tax.taxes?.name ?? '',

        code: tax.taxes?.code ?? '',

        tax_rate: Number(tax.tax_rate ?? 0),

        tax_amount: Number(tax.tax_amount ?? 0),

        calculation_level:
          tax.taxes?.calculation_level?.toLowerCase() ?? 'line',

        is_included_in_price: false
      })) ?? []

    // agregar taxes documento
    const taxes = [...lineTaxes, ...documentTaxes]

    const subtotal = Number(item.price ?? 0)

    const totalTaxes = taxes.reduce(
      (acc: number, tax: any) => acc + Number(tax.tax_amount || 0),
      0
    )

    return {
      product_id: item.product_id,

      product_name:
        item.products?.name || item.products?.description || 'Producto',

      quantity: Number(item.quantity ?? 0),

      unit_price: Number(item.unit_price ?? 0),

      price: subtotal,

      subtotal,

      taxes,

      total_taxes: totalTaxes,

      total: subtotal + totalTaxes
    }
  })

  // ─────────────────────────────────────
  // Totales
  // ─────────────────────────────────────
  const totalTaxes = taxes.reduce(
    (acc, tax) => acc + Number(tax.tax_amount || 0),

    0
  )

  const total = subtotal + totalTaxes

  // ─────────────────────────────────────
  // Push item
  // ─────────────────────────────────────
  items.value.push({
    product_id: prod.value ?? prod.id ?? '',

    product_name: prod.label ?? prod.name ?? 'Producto',

    quantity,

    unit_price: unitPrice,

    price: subtotal,

    subtotal,

    taxes,

    total_taxes: totalTaxes,

    total
  })
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

const subtotal = computed(() =>
  items.value.reduce(
    (acc, item) => acc + Number(item.subtotal || 0),

    0
  )
)

const allTaxes = computed(() => items.value.flatMap((i) => i.taxes ?? []))

const totalTaxes = computed(() =>
  allTaxes.value.reduce(
    (acc, tax) => acc + Number(tax.tax_amount || 0),

    0
  )
)

const total = computed(
  () => Number(subtotal.value || 0) + Number(totalTaxes.value || 0)
)

function submit() {
  emit('submit', {
    document_type_id: form.document_type_id,

    party_id: form.party_id,

    date: form.date,

    descrip: form.descrip,

    ref: form.ref,

    items: items.value.map((i) => ({
      product_id: i.product_id,

      quantity: Number(i.quantity),

      unit_price: Number(i.unit_price),

      taxes: i.taxes.map((t) => ({
        tax_id: t.tax_id,

        tax_rate: Number(t.tax_rate || 0),

        tax_amount: Number(t.tax_amount || 0)
      }))
    }))
  })
}
const onEditBussinessParty = () => {
  if (!selectedCustomer.value?.value) {
    return
  }

  const customer = parties.value.find(
    (c) => c.id === selectedCustomer.value?.value
  )

  if (!customer) {
    return
  }

  selectedBusinessParty.value = customer

  showBusinessPartiesModal.value = true
}

console.log('props', props.initialValues)
defineExpose({ submit })
</script>

<template>
  <UCard>
    <template #header>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex gap-2">
          <USelectMenu
            v-model="selectedCustomer"
            :items="partyOptions"
            placeholder="Cliente"
            searchable
            class="w-full"
          />

          <UButton
            icon="i-lucide-plus"
            variant="outline"
            @click="showBusinessPartiesModal = true"
          />

          <UButton
            icon="i-lucide-pencil"
            variant="outline"
            :disabled="!selectedCustomer"
            @click="onEditBussinessParty"
          />
        </div>

        <USelectMenu
          v-model="selectedDocumentType"
          :items="documentTypeOptions"
          placeholder="Tipo de documento"
          class="w-full"
        />

        <UInput v-model="form.date" type="date" />
      </div>
    </template>

    <FacturaItemsTable
      :items="items"
      :product-options="productOptions"
      @remove="removeItem"
      @add="addItem"
    />

    <template #footer>
      <FacturaTotals :subtotal="subtotal" :taxes="allTaxes" :total="total" />
    </template>
  </UCard>

  <BusinessPartyModal
    v-model:open="showBusinessPartiesModal"
    v-model:business-party="selectedBusinessParty"
  />
</template>
