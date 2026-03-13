import { h } from 'vue'
import { UBadge } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { VehicleCombination } from '~/modulos/logistica/transport/vehicles-combinations/vehicles-combinations.types'

function formatDate(date?: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export const columns: TableColumn<VehicleCombination>[] = [
  {
    accessorKey: 'unit_number',
    header: 'N° Unidad',
    cell: ({ row }) => row.original.unit_number || '—'
  },
  {
    id: 'status',
    header: 'Estado',
    cell: ({ row }) => {
      const validUntil = row.original.valid_until
      const isActive = !validUntil || new Date(validUntil) >= new Date()

      return h(UBadge, {
        label: isActive ? 'Activo' : 'Histórico',
        color: isActive ? 'success' : 'neutral',
        variant: 'subtle'
      })
    }
  },
  {
    id: 'tractor',
    header: 'Tractor',
    cell: ({ row }) => {
      const t = row.original.tractor
      return t ? `${t.plate} - ${t.brand || ''} ${t.model || ''}`.trim() : '—'
    }
  },
  {
    id: 'trailer',
    header: 'Trailer',
    cell: ({ row }) => {
      const t = row.original.trailer
      return t ? `${t.plate} - ${t.brand || ''} ${t.model || ''}`.trim() : '—'
    }
  },
  {
    id: 'driver',
    header: 'Chofer',
    cell: ({ row }) => {
      const d = row.original.driver
      return d ? `${d.first_name} ${d.last_name}` : '—'
    }
  },
  {
    accessorKey: 'valid_from',
    header: 'Válido desde',
    cell: ({ row }) => formatDate(row.original.valid_from)
  },
  {
    accessorKey: 'valid_until',
    header: 'Válido hasta',
    cell: ({ row }) => formatDate(row.original.valid_until)
  },
  {
    accessorKey: 'created_at',
    header: 'Creado',
    cell: ({ row }) => formatDate(row.original.created_at)
  }
]
