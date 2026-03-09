<script setup lang="ts" generic="T extends Record<string, any>">
import type { TableColumn } from '@nuxt/ui'
import type { ComponentPublicInstance } from 'vue'
import DeleteConfirmModal from './DeleteConfirmModal.vue'
import TableSelectionBar from './TableSelectionBar.vue'

interface TableApi {
  getFilteredSelectedRowModel: () => { rows: Array<{ original: T }> }
  getFilteredRowModel: () => { rows: Array<{ original: T }> }
}

interface UTableInstance extends ComponentPublicInstance {
  tableApi: TableApi | null
}

const props = defineProps<{
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
}>()

const emit = defineEmits<{
  'delete:rows': [rows: T[]]
}>()

const table = useTemplateRef<UTableInstance>('table')
const rowSelection = ref<Record<string, boolean>>({})
const showDeleteModal = ref(false)

const selectedRows = computed<T[]>(
  () =>
    table.value?.tableApi
      ?.getFilteredSelectedRowModel()
      .rows.map((r) => r.original) ?? []
)

const selectedCount = computed(() => selectedRows.value.length)

const totalCount = computed(
  () => table.value?.tableApi?.getFilteredRowModel().rows.length ?? 0
)

function confirmDelete(): void {
  emit('delete:rows', selectedRows.value)
  rowSelection.value = {}
  showDeleteModal.value = false
}
</script>

<template>
  <div class="flex-1 w-full pb-20">
    <UTable
      ref="table"
      v-model:row-selection="rowSelection"
      sticky
      :data="data"
      :columns="columns"
      :loading="loading"
      :class="[
        'border border-default',
        selectedCount > 0 ? 'rounded-b-lg rounded-t-none' : 'rounded-lg'
      ]"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Filas seleccionadas: {{ selectedCount }} de {{ totalCount }}
    </div>

    <TableSelectionBar
      :count="selectedCount"
      @open-delete="showDeleteModal = true"
    />

    <DeleteConfirmModal
      :open="showDeleteModal"
      :count="selectedCount"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>
