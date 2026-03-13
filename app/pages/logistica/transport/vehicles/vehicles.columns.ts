import { h } from 'vue'
import { UBadge } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type {
  Vehicle,
  VehicleDocument
} from '~/modulos/logistica/transport/vehicles/vehicles.types'

type EditableField = 'plate'

import { useSelectColumn } from '@/composables/table/useSelectColumn'
import { useIdColumn } from '@/composables/table/useIdColumn'
import { useDateColumn } from '@/composables/useDateColumn'

const { editableCell } = useInlineEdit<Vehicle, EditableField>()
const createdDate = useDateColumn('es-AR')

function getDocumentColor(expiration: string) {
  const today = new Date()
  const exp = new Date(expiration)

  const diff = Math.ceil(
    (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diff < 0) return 'error'
  if (diff < 30) return 'warning'

  return 'success'
}
type Row = Vehicle
export const vehiclesColumns = (actions: {
  onInlineSave?: (row: Row, field: EditableField, value: EditableValue) => void
  // onToggleActive?: (row: Row, value: boolean) => void
  onEdit?: (row: Row) => void
}): TableColumn<Row>[] => [
  // ♻️ si querés selección múltiple
  useSelectColumn<Row>(),

  // ♻️ si Driver tiene id:string y querés click para editar
  useIdColumn<Row>(actions.onEdit),

  {
    accessorKey: 'plate',
    header: 'Patente',
    cell: ({ row }) => editableCell('plate', row.original, actions)
  },

  {
    accessorKey: 'type',
    header: 'Tipo'
  },

  {
    id: 'vehicle',
    header: 'Vehículo',
    cell: ({ row }) => {
      const brand = row.original.brand ?? ''
      const model = row.original.model ?? ''

      return `${brand} ${model}`.trim() || '—'
    }
  },

  {
    accessorKey: 'refrigeration',
    header: 'Frío',
    cell: ({ row }) => {
      const refrigeration = row.original.refrigeration

      return h(
        UBadge,
        {
          variant: 'subtle',
          color: refrigeration ? 'info' : 'neutral'
        },
        () => (refrigeration ? 'Refrigerado' : 'Normal')
      )
    }
  },

  {
    id: 'documents',
    header: 'Documentos',
    cell: ({ row }) => {
      const docs = row.original.vehicleDocuments

      if (!docs?.length) return '—'

      return h(
        'div',
        { class: 'flex flex-wrap gap-1' },
        docs.map((doc) =>
          h(
            UBadge,
            {
              variant: 'subtle',
              color: getDocumentColor(doc.expiration_date)
            },
            () => doc.transport_document_types.name
          )
        )
      )
    }
  },

  // ♻️ fecha reusable
  {
    accessorKey: 'created_at', // 👈 camelCase si normalizaste API
    header: 'Creado',
    meta: createdDate.meta,
    filterFn: createdDate.filterFn,
    cell: ({ row }) => createdDate.format(row.getValue<string>('created_at'))
  }
]
