import { h } from 'vue'
import { UBadge, UCheckbox, UInput } from '#components'
import type { TableColumn } from '@nuxt/ui'
import WarehouseActiveCell from '@/components/ui/PopoverTableActive.vue'
import type { Warehouse } from '~/types/logistica/warehouses/warehouse'
import type { Component } from 'vue'

type EditableField = 'name' | 'code' | 'locationId'
type EditableValue = string | null | undefined

type Row = Warehouse & { locations?: any }

const editing = ref<{ id: string; field: string } | null>(null)

const startEdit = (id: string, field: string) => (editing.value = { id, field })

const stopEdit = () => (editing.value = null)

const isEditing = (id: string, field: string) =>
  editing.value?.id === id && editing.value?.field === field

export const createWarehouseColumns = (actions: {
  onToggleActive?: (row: Row, value: boolean) => void
  onInlineSave?: (row: Row, field: EditableField, value: EditableValue) => void
  onEdit?: (row: Row) => void
}): TableColumn<Row>[] => [
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
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value)
      })
  },
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => {
      const id = row.getValue('id') as string

      return h(
        'button',
        {
          class: 'text-primary hover:underline font-mono hover:cursor-pointer',
          onClick: () => actions.onEdit?.(row.original)
        },
        `#${id.slice(0, 8)}`
      )
    }
  },

  {
    accessorKey: 'name',
    header: 'Depósito',
    cell: ({ row }) => {
      const id = row.original.id
      const value = row.original.name

      if (isEditing(id, 'name')) {
        return h(UInput as unknown as Component, {
          modelValue: value,
          size: 'lg',
          autofocus: true,
          'onUpdate:modelValue': (v: string) => (row.original.name = v),
          onBlur: () => {
            actions.onInlineSave?.(
              row.original,
              'name' as EditableField,
              row.original.name
            )
            stopEdit()
          }
        })
      }

      return h(
        'div',
        {
          class:
            'cursor-pointer hover:bg-primary/5 hover:text-primary px-2 py-1 rounded',
          onClick: () => startEdit(id, 'name')
        },
        value
      )
    }
  },

  {
    accessorKey: 'code',
    header: 'Código',
    cell: ({ row }) => {
      const id = row.original.id
      const value = row.original.code ?? ''

      if (isEditing(id, 'code')) {
        return h(UInput as unknown as Component, {
          modelValue: value,
          size: 'lg',
          autofocus: true,
          'onUpdate:modelValue': (v: string) => (row.original.code = v),
          onBlur: () => {
            actions.onInlineSave?.(
              row.original,
              'code' as EditableField,
              row.original.code
            )
            stopEdit()
          }
        })
      }

      return h(
        'div',
        {
          class:
            'cursor-pointer hover:bg-primary/5 hover:text-primary px-2 py-1 rounded',
          onClick: () => startEdit(id, 'code')
        },
        value || '—'
      )
    }
  },

  {
    id: 'location',
    header: 'Ubicación',
    cell: ({ row }) => {
      const location = row.original.locations

      if (!location) return 'Sin asignar'

      const address = location.address
      const city = location.city ?? ''

      // Si tiene address → address + city
      // Si no → solo city
      return address ? `${address} - ${city}` : city
    }
  },

  {
    accessorKey: 'active',
    header: 'Estado',
    cell: ({ row }) =>
      h(WarehouseActiveCell, {
        active: row.original.active,
        onToggle: (value: boolean) =>
          actions.onToggleActive?.(row.original, value)
      })
  },

  {
    accessorKey: 'created_at',
    header: 'Creado',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string

      return new Date(date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }
  }
]
