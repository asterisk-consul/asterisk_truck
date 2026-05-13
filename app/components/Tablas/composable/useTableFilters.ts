import { ref, computed, watch } from 'vue'
import { nanoid } from 'nanoid'
import type { Ref } from 'vue'

import type {
  TableFilter,
  FilterOperator
} from '~/components/Tablas/types/tablas.types'

export function useTableFilters(table: Ref<any>, columns?: Ref<any[]>) {
  const filters = ref<TableFilter[]>([])

  function getColumnMeta(columnId: string) {
    return columns?.value?.find(
      (c) => c.accessorKey === columnId || c.id === columnId
    )?.meta?.filter
  }

  function getDefaultOperator(type?: string): FilterOperator {
    switch (type) {
      case 'number':
        return 'equals'

      case 'date-range':
        return 'between'

      case 'select':
        return 'equals'

      default:
        return 'contains'
    }
  }

  function getDefaultValue(type?: string) {
    switch (type) {
      case 'date-range':
        return {
          start: undefined,
          end: undefined
        }

      case 'boolean':
        return false

      default:
        return ''
    }
  }

  function addFilter() {
    const firstColumn = columns?.value?.find((c) => c.accessorKey || c.id)

    const columnId = firstColumn?.accessorKey || firstColumn?.id || ''

    const meta = getColumnMeta(columnId)

    filters.value.push({
      id: nanoid(),
      column: columnId,
      operator: getDefaultOperator(meta?.type),
      value: getDefaultValue(meta?.type)
    })
  }

  function removeFilter(id: string) {
    filters.value = filters.value.filter((f) => f.id !== id)
  }

  function clearFilters() {
    filters.value = []

    const api = table.value?.tableApi

    if (!api) return

    api.resetColumnFilters()
  }

  watch(
    filters,
    () => {
      const api = table.value?.tableApi

      if (!api) return

      api.resetColumnFilters()

      filters.value.forEach((filter) => {
        if (!filter.column) return

        api.getColumn(filter.column)?.setFilterValue({
          operator: filter.operator,
          value: filter.value
        })
      })
    },
    {
      deep: true
    }
  )

  return {
    filters,
    addFilter,
    removeFilter,
    clearFilters
  }
}
