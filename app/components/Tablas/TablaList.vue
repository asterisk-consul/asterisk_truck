<script setup lang="ts">
import {
  h,
  resolveComponent,
  computed,
  ref,
  onMounted,
  watch,
  nextTick
} from 'vue'
import { getPaginationRowModel, getFilteredRowModel } from '@tanstack/vue-table'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import { useDraggable } from 'vue-draggable-plus'

const UCheckbox = resolveComponent('UCheckbox')
const UButton = resolveComponent('UButton')
const UKbd = resolveComponent('UKbd')
const UIcon = resolveComponent('UIcon')
const UInput = resolveComponent('UInput')
const UPopover = resolveComponent('UPopover')
const USelectMenu = resolveComponent('USelectMenu')

/**
 * Props
 */
const props = defineProps<{
  data: {
    rows: Record<string, any>[]
    total: number
  } | null
  loading?: boolean
  selectable?: boolean
  deletable?: boolean
  tableKey: string
  pageSize?: number
}>()

/**
 * Emits
 */
const emit = defineEmits<{
  (e: 'selection-change', rows: any[]): void
  (e: 'delete-selected', rows: any[]): void
  (e: 'reorder', rows: any[]): void // Evento para guardar el nuevo orden
}>()

/**
 * Refs y Estado Local
 */
const tableRef = ref<any>(null)
const rowSelection = ref({})
const pagination = ref({
  pageIndex: 0,
  pageSize: props.pageSize || 10
})
const globalFilter = ref('')
const columnFilters = ref<{ id: string; value: unknown }[]>([])

// Estado para el selector de búsqueda "Buscar por..."
const searchScope = ref('global')
const searchQuery = ref('')

const searchColumns = ref([
  { label: 'Global (Todo)', value: 'global' },
  { label: 'ID', value: 'id' },
  { label: 'Fecha', value: 'fecha' },
  { label: 'Cliente', value: 'clientname' },
  { label: 'Referencia', value: 'referenciatexto' },
  { label: 'Precio', value: 'totalprecio' },
  { label: 'Total', value: 'total' },
  { label: 'Vendedor', value: 'vendedorid' }
])

// Watcher principal para coordinar la búsqueda
watch([searchQuery, searchScope], ([query, scope]) => {
  if (scope === 'global') {
    // Modo Global: Limpiar filtros de columna y udar globalFilter
    columnFilters.value = []
    globalFilter.value = query
  } else {
    // Modo Columna: Limpiar globalFilter y aplicar a la columna específica
    globalFilter.value = ''
    columnFilters.value = [{ id: scope, value: query }]
  }
})

// Referencia local reactiva necesaria para el Draggable
const tableData = ref([...(props.data?.rows || [])])

// Sincronizar tableData cuando los props cambien (ej. carga inicial o filtros)
watch(
  () => props.data?.rows,
  (newRows) => {
    tableData.value = [...(newRows || [])]
  },
  { deep: true }
)

/**
 * CONFIGURACIÓN DRAGGABLE
 */

/**
 * COLUMNAS
 */
const DRAG_COLUMN: TableColumn<any> = {
  id: 'drag',
  header: '',
  cell: () =>
    h('div', { class: 'drag-handle cursor-grab flex justify-center' }, [
      h(UIcon, {
        name: 'i-lucide-grip-vertical',
        class: 'w-5 h-5 text-gray-400'
      })
    ])
}

const SELECT_COLUMN: TableColumn<any> = {
  id: 'select',
  header: ({ table }) =>
    h(UCheckbox, {
      modelValue: table.getIsSomePageRowsSelected()
        ? 'indeterminate'
        : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (v: boolean | 'indeterminate') =>
        table.toggleAllPageRowsSelected(!!v),
      ariaLabel: 'Select all'
    }),
  cell: ({ row }) =>
    h(UCheckbox, {
      modelValue: row.getIsSelected(),
      'onUpdate:modelValue': (v: boolean | 'indeterminate') =>
        row.toggleSelected(!!v),
      ariaLabel: 'Select row'
    })
}

const headerWithDrag =
  (label: string) =>
  ({ column }: any) =>
    h('div', { class: 'flex items-center gap-2 group' }, [
      h(UIcon, {
        name: 'i-lucide-grip-vertical',
        class:
          'col-drag-handle cursor-grab w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
      }),
      h('span', { class: 'flex-1 truncate' }, label)
    ])

const DATA_COLUMNS: TableColumn<any>[] = [
  { accessorKey: 'id', header: headerWithDrag('ID') },
  {
    accessorKey: 'fecha',
    header: headerWithDrag('Fecha'),
    cell: ({ row }) =>
      row.original.fecha
        ? new Date(row.original.fecha).toLocaleDateString('es-AR')
        : '-'
  },
  { accessorKey: 'clientname', header: headerWithDrag('Cliente') },
  { accessorKey: 'referenciatexto', header: headerWithDrag('Referencia') },
  {
    accessorKey: 'totalprecio',
    header: headerWithDrag('Precio'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        row.original.totalprecio != null
          ? `$ ${row.original.totalprecio.toLocaleString('es-AR')}`
          : '-'
      )
  },
  {
    accessorKey: 'totalimpuestos',
    header: headerWithDrag('Impuestos'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        row.original.totalimpuestos != null
          ? `$ ${row.original.totalimpuestos.toLocaleString('es-AR')}`
          : '-'
      )
  },
  {
    accessorKey: 'total',
    header: headerWithDrag('Total'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium' },
        row.original.total != null
          ? `$ ${row.original.total.toLocaleString('es-AR')}`
          : '-'
      )
  },
  { accessorKey: 'vendedorid', header: headerWithDrag('Vendedor') }
]

const tableColumns = ref<TableColumn<any>[]>([])

// Inicializar columnas
const initColumns = () => {
  const cols = [DRAG_COLUMN, ...DATA_COLUMNS]
  if (props.selectable) cols.splice(1, 0, SELECT_COLUMN)
  tableColumns.value = [...cols]
}

// Watch para regenerar si cambian props estructurales (opcional pero recomendado)
watch(() => props.selectable, initColumns)

// Inicialización inicial
initColumns() // Se llamará en setup

/**
 * CONFIGURACIÓN DRAGGABLE
 */
onMounted(async () => {
  await nextTick()

  // 1. Draggable de FILES (body)
  const elCtx = tableRef.value?.$el.querySelector('tbody')
  if (elCtx) {
    useDraggable(elCtx, tableData, {
      animation: 150,
      handle: '.drag-handle', // Solo se arrastra desde el icono
      draggable: 'tr',
      ghostClass: 'bg-primary-50/50', // Clase visual al arrastrar
      onEnd: () => {
        emit('reorder', tableData.value)
      }
    })
  }

  // 2. Draggable de COLUMNAS (header)
  // Buscamos el thead > tr
  const elHeader = tableRef.value?.$el.querySelector('thead > tr')
  if (elHeader) {
    useDraggable(elHeader, tableColumns, {
      animation: 150,
      handle: '.col-drag-handle', // Solo se mueve desde el handle
      draggable: 'th',
      filter: '.no-drag', // Ignorar elementos con esta clase
      ghostClass: 'bg-primary-50/50',
      onEnd: () => {
        // Opción: emitir evento o guardar
      }
    })
  }
})

/**
 * LÓGICA DE SELECCIÓN Y COLUMNAS
 */
const getSelectedRows = () => {
  const model = tableRef.value?.tableApi?.getFilteredSelectedRowModel()
  return model?.rows?.map((r: any) => r.original) ?? []
}

const selectedCount = computed(() => Object.keys(rowSelection.value).length)

const handleDeleteConfirm = () => {
  const rows = getSelectedRows()
  if (!rows.length) return
  emit('delete-selected', rows)
  rowSelection.value = {}
}

const STORAGE_KEY = `table-columns-${props.tableKey}`

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved || !tableRef.value?.tableApi) return
  const visibility = JSON.parse(saved)
  Object.entries(visibility).forEach(([id, visible]) => {
    tableRef.value.tableApi.getColumn(id)?.toggleVisibility(!!visible)
  })
})

const persistColumnVisibility = () => {
  const visibility: Record<string, boolean> = {}
  tableRef.value?.tableApi?.getAllColumns().forEach((c: any) => {
    visibility[c.id] = c.getIsVisible()
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility))
}

const getColumnItems = () =>
  tableRef.value?.tableApi
    ?.getAllColumns()
    .filter((c: any) => c.getCanHide())
    .map((c: any) => ({
      label: upperFirst(c.id),
      type: 'checkbox' as const,
      checked: c.getIsVisible(),
      onUpdateChecked(v: boolean) {
        c.toggleVisibility(!!v)
        persistColumnVisibility()
      },
      onSelect(e?: Event) {
        e?.preventDefault()
      }
    })) ?? []

const getPaginationInfo = () => {
  const api = tableRef.value?.tableApi
  if (!api) return { page: 1, size: 5, total: 0 }
  return {
    page: api.getState().pagination.pageIndex + 1,
    size: api.getState().pagination.pageSize,
    total: props.data?.total || 0
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-end gap-4">
      <TablasDeleteModal
        v-if="deletable && selectable"
        :count="selectedCount"
        @confirm="handleDeleteConfirm"
      >
        <UButton
          v-show="selectedCount > 0"
          label="Eliminar"
          color="error"
          variant="subtle"
          icon="i-lucide-trash"
        >
          <template #trailing>
            <UKbd>{{ selectedCount }}</UKbd>
          </template>
        </UButton>
      </TablasDeleteModal>

      <UDropdownMenu
        :items="getColumnItems()"
        :content="{ align: 'end' }"
        :ui="{ content: 'max-h-64 overflow-y-auto' }"
      >
        <UButton
          label="Columnas"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-columns"
        />
      </UDropdownMenu>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        :placeholder="
          searchScope === 'global'
            ? 'Buscar en toda la tabla...'
            : `Buscar por ${searchColumns.find((c) => c.value === searchScope)?.label}...`
        "
        class="w-full max-w-sm"
      />
      <USelectMenu
        v-model="searchScope"
        :options="searchColumns"
        option-attribute="label"
        value-attribute="value"
        class="w-48"
      />
    </div>

    <UTable
      ref="tableRef"
      v-model:row-selection="rowSelection"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      v-model:column-filters="columnFilters"
      :data="tableData"
      :columns="tableColumns"
      :loading="loading"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
      :get-filtered-row-model="getFilteredRowModel()"
      sticky
      class="border border-default rounded-lg"
    />

    <div
      class="flex justify-between items-center border-t border-default py-4 px-4"
    >
      <div v-if="selectable" class="text-sm text-muted">
        {{ selectedCount }} fila(s) seleccionadas
      </div>

      <UPagination
        :page="getPaginationInfo().page"
        :items-per-page="getPaginationInfo().size"
        :total="getPaginationInfo().total"
        @update:page="(p) => tableRef?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </div>
</template>

<style scoped>
/* Estilo para la fila que se está moviendo */
:deep(.sortable-ghost) {
  opacity: 0.4;
  background: rgb(var(--color-primary-500) / 0.1);
}

:deep(.sortable-chosen) {
  background: rgb(var(--color-neutral-100));
}
</style>
