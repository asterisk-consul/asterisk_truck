<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch } from 'vue'

import { getPaginationRowModel } from '@tanstack/vue-table'

import type { UTableInstance, ExtendedColumn } from './types/tablas.types'

import { useColumnVisibility } from '@/composables/table/useColumnVisibility'
import { useTableFilters } from '@/components/Tablas/composable/useTableFilters'

import DeleteConfirmModal from './DeleteConfirmModal.vue'
import TableSelectionBar from './TableSelectionBar.vue'

import TableFiltersPopover from '@/components/Tablas/filters/TableFiltersPopover.vue'

/* ========================
   Props / Emits
======================== */

const props = defineProps<{
  data: T[]
  columns: ExtendedColumn<T>[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'delete:rows': [rows: T[]]
}>()

/* ========================
   Tabla
======================== */

const table = useTemplateRef<UTableInstance<T>>('table')

defineExpose({
  table
})

const rowSelection = ref<Record<string, boolean>>({})

const showDeleteModal = ref(false)

const { columnVisibility, columnVisibilityItems } = useColumnVisibility(table)

/* ========================
   Filters
======================== */

const { filters, addFilter, removeFilter, clearFilters } = useTableFilters(
  table,
  computed(() => props.columns)
)

/* ========================
   FilterFns
======================== */

const filterFns = {
  advancedFilter: (row: any, columnId: string, filter: any) => {
    const value = row.getValue(columnId)

    if (!filter) {
      return true
    }

    switch (filter.operator) {
      case 'contains':
        return String(value || '')
          .toLowerCase()
          .includes(String(filter.value || '').toLowerCase())

      case 'equals':
        return String(value) === String(filter.value)

      case 'startsWith':
        return String(value || '')
          .toLowerCase()
          .startsWith(String(filter.value || '').toLowerCase())

      case 'gt':
        return Number(value) > Number(filter.value)

      case 'lt':
        return Number(value) < Number(filter.value)

      case 'between':
        if (!filter.value?.start || !filter.value?.end) {
          return true
        }

        const rowDate = new Date(value)

        const start = new Date(filter.value.start)

        const end = new Date(filter.value.end)

        return rowDate >= start && rowDate <= end

      default:
        return true
    }
  }
}

// /* ========================
//    Sync Filters
// ======================== */

// watch(
//   filters,
//   () => {
//     console.log('FILTERS =>', filters.value)

//     const api = table.value?.tableApi

//     if (!api) return

//     filters.value.forEach((filter) => {
//       console.log('APPLY FILTER =>', filter)

//       api.getColumn(filter.column)?.setFilterValue({
//         operator: filter.operator,
//         value: filter.value
//       })
//     })
//   },
//   {
//     deep: true
//   }
// )

/* ========================
   Selección
======================== */

const selectedRows = computed<T[]>(
  () =>
    table.value?.tableApi
      ?.getFilteredSelectedRowModel()
      .rows.map((r) => r.original) ?? []
)

const selectedCount = computed<number>(() => selectedRows.value.length)

const totalCount = computed<number>(
  () => table.value?.tableApi?.getFilteredRowModel().rows.length ?? 0
)

/* ========================
   Pagination
======================== */

const pagination = ref({
  pageIndex: 0,
  pageSize: 15
})

/* ========================
   Acciones
======================== */

function confirmDelete(): void {
  emit('delete:rows', selectedRows.value)

  rowSelection.value = {}

  showDeleteModal.value = false
}
</script>

<template>
  <div class="flex-1 w-full pb-20">
    <!-- ========================
         Topbar
    ========================= -->

    <div class="flex items-center justify-between gap-4 py-3.5">
      <!-- Filters -->

      <TableFiltersPopover
        :filters="filters"
        :columns="props.columns"
        @add="addFilter"
        @remove="removeFilter"
      />

      <!-- Right Actions -->

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-x"
          @click="clearFilters"
        >
          Limpiar
        </UButton>

        <UDropdownMenu
          :items="columnVisibilityItems"
          :content="{
            align: 'end'
          }"
        >
          <UButton
            label="Display"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-settings-2"
          />
        </UDropdownMenu>
      </div>
    </div>

    <!-- ========================
         Tabla
    ========================= -->

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:row-selection="rowSelection"
      v-model:column-visibility="columnVisibility"
      :table-options="{
        filterFns
      }"
      sticky
      :get-row-id="(row: T) => (row as any).id"
      :data="props.data"
      :columns="props.columns"
      :loading="props.loading"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
        autoResetPageIndex: false
      }"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',

        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',

        tbody: '[&>tr]:last:[&>td]:border-b-0',

        th: 'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',

        td: 'border-b border-default'
      }"
      :class="[
        'max-h-[75vh] overflow-y-auto',

        selectedCount > 0 ? 'rounded-b-lg rounded-t-none' : 'rounded-lg'
      ]"
    />

    <!-- ========================
         Footer
    ========================= -->

    <div
      class="flex items-center justify-between border-t border-default bg-muted/30 px-4 py-2"
    >
      <div class="text-xs text-muted">
        {{ selectedCount }}
        seleccionadas •
        {{ totalCount }}
        totales
      </div>

      <UPagination
        size="sm"
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="totalCount"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>

    <!-- ========================
         Selection Bar
    ========================= -->

    <TableSelectionBar
      :count="selectedCount"
      @open-delete="showDeleteModal = true"
    />

    <!-- ========================
         Delete Modal
    ========================= -->

    <DeleteConfirmModal
      :open="showDeleteModal"
      :count="selectedCount"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>
