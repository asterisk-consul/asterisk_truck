<script setup lang="ts">
import { h, resolveComponent, computed, ref, watch } from 'vue'
import { getPaginationRowModel } from '@tanstack/vue-table'
import { tableRenderers } from '@/utils/tableRenderers'

import type { TableColumn } from '@nuxt/ui'
import type { CellContext } from '@tanstack/vue-table'
import type { CellRenderer } from '@/utils/tableRenderers'
import type { ColumnConfig } from '@/utils/tableTypes'

const UCheckbox = resolveComponent('UCheckbox')

/**
 * Props (GENÉRICAS)
 */
const props = defineProps<{
  data: {
    cols: string[]
    rows: Record<string, any>[]
    total: number
  } | null
  loading?: boolean
  selectable?: boolean
  columnConfig?: Record<string, ColumnConfig>
}>()

/**
 * Emits
 */
const emit = defineEmits<{
  (e: 'selection-change', rows: any[]): void
}>()

/**
 * Table refs
 */
const table = useTemplateRef('table')
const rowSelection = ref({})
const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})

/**
 * Utils
 */
const humanize = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/id$/i, '')
    .replace(/\b\w/g, (l) => l.toUpperCase())

/**
 * Columnas dinámicas desde props.data.cols
 */
const columns = computed<TableColumn<any>[]>(() => {
  if (!props.data?.cols) return []

  const apiColumns: TableColumn<any>[] = props.data.cols.map((col) => {
    const config = props.columnConfig?.[col]

    const renderer: CellRenderer = tableRenderers[config?.renderer ?? 'text']

    return {
      id: col,
      accessorKey: col,
      header: config?.label || humanize(col),
      cell: ({ row }: CellContext<any, unknown>) =>
        h(
          'div',
          {
            class: [
              config?.align === 'right' && 'text-right',
              config?.align === 'center' && 'text-center'
            ]
          },
          renderer(row.getValue(col), row.original)
        )
    }
  })

  if (!props.selectable) return apiColumns

  return [
    {
      id: 'select',
      header: ({ table }) =>
        h(UCheckbox, {
          modelValue: table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(!!value)
        }),
      cell: ({ row }: CellContext<any, unknown>) =>
        h(UCheckbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            row.toggleSelected(!!value)
        })
    },
    ...apiColumns
  ]
})

/**
 * Emitir selección
 */
watch(rowSelection, () => {
  if (!props.selectable) return

  const rows =
    table.value?.tableApi
      ?.getFilteredSelectedRowModel()
      .rows.map((r) => r.original) || []

  emit('selection-change', rows)
})
</script>

<template>
  <div class="flex-1 w-full">
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:row-selection="rowSelection"
      :data="data?.rows || []"
      :columns="columns"
      :loading="loading"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      sticky
    />

    <div
      class="flex justify-between items-center border-t border-default py-4 px-4"
    >
      <div v-if="selectable" class="text-sm text-muted">
        {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }}
        fila(s) seleccionadas
      </div>

      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="data?.total || 0"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>
