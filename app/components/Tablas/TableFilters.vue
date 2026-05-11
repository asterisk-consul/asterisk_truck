<script setup lang="ts" generic="T">
import FilterValueInput from './FilterValueInput.vue'

import type { TableFilter, ColumnFilterMeta } from './tablas.types'

const props = defineProps<{
  filters: TableFilter[]
  columns: any[]
}>()

const emit = defineEmits<{
  add: []
  remove: [id: string]
}>()

function getColumnMeta(column: string): ColumnFilterMeta | undefined {
  return props.columns.find((c) => c.accessorKey === column)?.meta?.filter
}

function getOperators(column: string) {
  const meta = getColumnMeta(column)

  return (meta?.operators || ['contains', 'equals']).map((o) => ({
    label: o,
    value: o
  }))
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div
      v-for="filter in filters"
      :key="filter.id"
      class="flex items-center gap-2"
    >
      <!-- Columna -->
      <USelect
        v-model="filter.column"
        :items="
          columns
            .filter((c) => c.accessorKey)
            .map((c) => ({
              label: c.meta?.label || c.accessorKey,
              value: c.accessorKey
            }))
        "
        class="w-48"
      />

      <!-- Operador -->
      <USelect
        v-model="filter.operator"
        :items="getOperators(filter.column)"
        class="w-40"
      />

      <!-- Valor -->
      <FilterValueInput
        v-model="filter.value"
        :meta="getColumnMeta(filter.column)"
      />

      <!-- Eliminar -->
      <UButton
        color="error"
        variant="ghost"
        icon="i-lucide-trash"
        @click="emit('remove', filter.id)"
      />
    </div>

    <div class="flex gap-2">
      <UButton icon="i-lucide-plus" @click="emit('add')">
        Agregar filtro
      </UButton>
    </div>
  </div>
</template>
