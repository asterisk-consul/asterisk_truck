import { h } from 'vue'
import { UBadge } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Driver } from '~/types/logistica/transport/drivers'

export const columns: TableColumn<Driver>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return `#${id.slice(0, 8)}`
    }
  },
  {
    id: 'full_name',
    header: 'Nombre',
    cell: ({ row }) => {
      const first = row.original.first_name
      const last = row.original.last_name
      return `${first} ${last}`
    }
  },
  {
    accessorKey: 'document',
    header: 'Documento'
  },
  {
    accessorKey: 'phone',
    header: 'Teléfono'
  },
  {
    accessorKey: 'license_number',
    header: 'N° Licencia'
  },
  {
    accessorKey: 'license_expiration',
    header: 'Vencimiento',
    cell: ({ row }) => {
      const date = row.getValue('license_expiration') as string

      return new Date(date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  },
  {
    accessorKey: 'active',
    header: 'Estado',
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean

      return h(
        UBadge,
        {
          variant: 'subtle',
          color: active ? 'success' : 'error'
        },
        () => (active ? 'Activo' : 'Inactivo')
      )
    }
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
