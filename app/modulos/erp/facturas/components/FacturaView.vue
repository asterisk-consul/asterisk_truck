<script setup lang="ts">
interface Props {
  document: any
}

const props = defineProps<Props>()

function fmt(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(Number(n ?? 0))
}
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xl font-bold">Factura #{{ document.number }}</div>

            <div class="text-sm text-gray-500">
              {{ document.document_types?.description }}
            </div>
          </div>

          <UBadge color="success">Activa</UBadge>
        </div>
      </template>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-sm text-gray-500">Cliente</div>

          <div class="font-medium">
            {{ document.business_parties?.name }}
          </div>
        </div>

        <div>
          <div class="text-sm text-gray-500">Fecha</div>

          <div class="font-medium">
            {{ document.date?.slice(0, 10) }}
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <UTable
        :data="document.document_items"
        :columns="[
          {
            accessorKey: 'products.name',
            header: 'Producto'
          },

          {
            accessorKey: 'quantity',
            header: 'Cant.'
          },

          {
            accessorKey: 'unit_price',
            header: 'P. Unit'
          },

          {
            accessorKey: 'price',
            header: 'Subtotal'
          }
        ]"
      />
    </UCard>

    <UCard>
      <div class="space-y-2 max-w-sm ml-auto">
        <div class="flex justify-between">
          <span>Subtotal</span>

          <span>
            {{ fmt(document.subtotal) }}
          </span>
        </div>

        <div class="flex justify-between">
          <span>IVA</span>

          <span>
            {{ fmt(document.total_taxes) }}
          </span>
        </div>

        <div class="flex justify-between text-lg font-bold">
          <span>Total</span>

          <span>
            {{ fmt(document.total) }}
          </span>
        </div>
      </div>
    </UCard>
  </div>
</template>
