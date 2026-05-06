import type { TableColumn } from '@nuxt/ui'
import type { VehicleCombination } from '~/modulos/logistica/transport/vehicles-combinations/types/vehicles-combinations.types'
import StatusToggle from '@/components/ui/PopoverTableActive.vue'

import { createTableBuilder } from '@/composables/table/createColumns'
import { useSelectColumn } from '@/composables/table/useSelectColumn'
import { useIdColumn } from '@/composables/table/useIdColumn'

type Row = VehicleCombination

export type EditableField = 'unit_number'

export const VehicleCombinationColumns = (actions: {
  onInlineSave?: (row: Row, field: EditableField, value: any) => void
  onToggleActive?: (row: Row, validUntil: string | null) => void
  onEdit?: (row: Row) => void
}): TableColumn<Row>[] => {
  const build = createTableBuilder<Row, EditableField>({
    locale: 'es-AR',
    onInlineSave: actions.onInlineSave
  })

  return [
    useSelectColumn<Row>(),
    useIdColumn<Row>(actions.onEdit),

    ...build([
      {
        key: 'unit_number',
        label: 'N° Unidad',
        sortable: true,
        editable: true,
        editField: 'unit_number'
      },

      {
        id: 'status',
        label: 'Estado',
        sortable: true,
        accessorFn: (row) => (row.valid_until === null ? null : 'historic'),

        enum: {
          options: [
            { label: 'Activo', value: null, color: 'success' },
            { label: 'Histórico', value: 'historic', color: 'neutral' }
          ],
          toggle: {
            component: StatusToggle,
            title: 'Cambiar estado',
            onChange: (row, value) => {
              const newValidUntil =
                value === null ? null : new Date().toISOString()
              actions.onToggleActive?.(row, newValidUntil)
            }
          }
        }
      },

      {
        id: 'tractor',
        label: 'Tractor',
        cell: ({ row }) => {
          const t = row.original.tractor
          if (!t) return '—'
          const details = [t.brand, t.model].filter(Boolean).join(' ')
          return details ? `${t.plate} - ${details}` : t.plate
        }
      },

      {
        id: 'trailer',
        label: 'Trailer',
        cell: ({ row }) => {
          const t = row.original.trailer
          if (!t) return '—'
          const details = [t.brand, t.model].filter(Boolean).join(' ')
          return details ? `${t.plate} - ${details}` : t.plate
        }
      },

      {
        id: 'driver',
        label: 'Chofer',
        cell: ({ row }) => {
          const d = row.original.drivers
          return d ? `${d.first_name} ${d.last_name}` : '—'
        }
      },

      {
        key: 'valid_from',
        label: 'Válido desde',
        sortable: true,
        date: true
      },

      {
        key: 'valid_until',
        label: 'Válido hasta',
        sortable: true,
        date: true
      },

      {
        key: 'created_at',
        label: 'Creado',
        sortable: true,
        date: true
      }
    ])
  ]
}
