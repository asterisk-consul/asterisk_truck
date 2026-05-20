<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Currency } from '~/modulos/erp/currencies/types/currencies.types'

const props = defineProps<{
  currencies: Currency[]
}>()

const emit = defineEmits<{
  toggle: [currency: Currency]
  edit: [currency: Currency]
}>()

const getItems = (currency: Currency): DropdownMenuItem[] => [
  {
    label: 'Editar moneda',
    icon: 'i-lucide-pencil',
    onSelect: () => emit('edit', currency)
  },
  {
    label: currency.active ? 'Desactivar' : 'Activar',
    icon: currency.active ? 'i-lucide-circle-off' : 'i-lucide-circle-check',
    color: currency.active ? ('error' as const) : ('success' as const),
    onSelect: () => emit('toggle', currency)
  }
]
</script>

<template>
  <ul role="list" class="divide-y divide-default">
    <li
      v-for="currency in currencies"
      :key="currency.id"
      class="flex items-center justify-between gap-4 px-4 py-4"
    >
      <!-- Left -->
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary font-bold"
        >
          {{ currency.code }}
        </div>

        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="font-medium truncate">
              {{ currency.name }}
            </p>

            <UBadge
              v-if="currency.is_base"
              color="primary"
              variant="soft"
              size="sm"
            >
              Base
            </UBadge>
          </div>

          <p class="text-sm text-muted">
            {{ currency.code }} · {{ currency.symbol }}
          </p>
        </div>
      </div>

      <!-- Right -->
      <div class="flex items-center gap-3">
        <UToggle
          :model-value="currency.active"
          :disabled="currency.is_base"
          @update:model-value="emit('toggle', currency)"
        />

        <UDropdownMenu :items="getItems(currency)" :content="{ align: 'end' }">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
          />
        </UDropdownMenu>
      </div>
    </li>
  </ul>
</template>
