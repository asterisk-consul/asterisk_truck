<script setup lang="ts">
import FilterValueInput from './FilterValueInput.vue'

import type {
  TableFilter,
  ColumnFilterMeta,
  FilterOperator
} from '../types/tablas.types'

const props = defineProps<{
  filters: TableFilter[]
  columns: any[]
}>()

const emit = defineEmits<{
  add: []
  remove: [id: string]
}>()

function getColumn(column: string) {
  return props.columns.find((c) => c.accessorKey === column || c.id === column)
}

function getColumnMeta(column: string): ColumnFilterMeta | undefined {
  return getColumn(column)?.meta?.filter
}

function getColumnLabel(column: string) {
  const col = getColumn(column)

  return col?.meta?.label || col?.label || column
}

/* ========================
   OPERADORES POR TIPO
======================== */

function getDefaultOperator(type?: string): FilterOperator {
  switch (type) {
    case 'date-range':
      return 'between'

    case 'number':
      return 'equals'

    case 'select':
      return 'equals'

    case 'boolean':
      return 'equals'

    default:
      return 'contains'
  }
}

function getOperators(column: string) {
  const meta = getColumnMeta(column)

  return (meta?.operators || [getDefaultOperator(meta?.type)]).map((o) => ({
    label: formatOperator(o),
    value: o
  }))
}

function formatOperator(operator: string) {
  switch (operator) {
    case 'contains':
      return 'Contiene'

    case 'equals':
      return 'Igual a'

    case 'startsWith':
      return 'Empieza con'

    case 'between':
      return 'Entre'

    case 'gt':
      return 'Mayor a'

    case 'lt':
      return 'Menor a'

    default:
      return operator
  }
}

/* ========================
   Cambio columna
======================== */

function onColumnChange(filter: TableFilter, column: string) {
  filter.column = column

  const meta = getColumnMeta(column)

  filter.operator = getDefaultOperator(meta?.type)

  /* RESET VALUE */

  switch (meta?.type) {
    case 'date-range':
      filter.value = {
        start: undefined,
        end: undefined
      }
      break

    case 'boolean':
      filter.value = false
      break

    default:
      filter.value = ''
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <!-- Chips -->

    <UBadge
      v-for="filter in filters"
      :key="filter.id"
      color="primary"
      variant="soft"
      class="px-3 py-1"
    >
      <div class="flex items-center gap-2">
        <span>
          {{ getColumnLabel(filter.column) }}
        </span>

        <span class="opacity-60">
          {{ formatOperator(filter.operator) }}
        </span>

        <span class="font-medium">
          {{ typeof filter.value === 'object' ? 'Seleccionado' : filter.value }}
        </span>

        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="xs"
          @click="emit('remove', filter.id)"
        />
      </div>
    </UBadge>

    <!-- Popover -->

    <UPopover>
      <UButton icon="i-lucide-filter" color="neutral" variant="outline">
        Filtros

        <UBadge v-if="filters.length" size="xs" color="primary">
          {{ filters.length }}
        </UBadge>
      </UButton>

      <template #content>
        <div class="w-225 p-4 flex flex-col gap-3">
          <!-- Rows -->

          <div
            v-for="filter in filters"
            :key="filter.id"
            class="grid grid-cols-[220px_180px_1fr_auto] gap-2 items-start"
          >
            <!-- Columna -->

            <USelect
              :model-value="filter.column"
              :items="
                columns
                  .filter((c) => c.accessorKey || c.id)
                  .map((c) => ({
                    label: c.meta?.label || c.label || c.accessorKey || c.id,

                    value: c.accessorKey || c.id
                  }))
              "
              @update:model-value="(v) => onColumnChange(filter, v)"
            />

            <!-- Operador -->

            <USelect
              v-model="filter.operator"
              :items="getOperators(filter.column)"
            />

            <!-- Valor -->

            <FilterValueInput
              v-model="filter.value"
              :meta="getColumnMeta(filter.column)"
            />

            <!-- Delete -->

            <UButton
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              @click="emit('remove', filter.id)"
            />
          </div>

          <!-- Footer -->

          <div class="flex items-center justify-between pt-2 border-t">
            <UButton icon="i-lucide-plus" variant="soft" @click="emit('add')">
              Agregar filtro
            </UButton>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
