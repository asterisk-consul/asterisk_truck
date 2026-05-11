import { ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import type { Ref } from 'vue'

import type {
  TableFilter,
  FilterOperator
} from '~/components/Tablas/tablas.types'

export function useTableFilters(table: Ref<any>) {
  const filters = ref<TableFilter[]>([])

  function addFilter() {
    filters.value.push({
      id: nanoid(),
      column: '',
      operator: 'contains',
      value: ''
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
    api.resetGlobalFilter()
  }

  function getDefaultOperator(type?: string): FilterOperator {
    switch (type) {
      case 'number':
        return 'equals'

      case 'date-range':
        return 'between'

      default:
        return 'contains'
    }
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
    { deep: true }
  )

  return {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    getDefaultOperator
  }
}
