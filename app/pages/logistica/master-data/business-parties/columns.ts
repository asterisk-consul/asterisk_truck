import { h } from 'vue'
import { UBadge } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { BusinessParty } from '~/types/logistica/master-data/bussines-parties'

export const columns: TableColumn<BusinessParty>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return `#${id.slice(0, 8)}`
    }
  },

  {
    accessorKey: 'name',
    header: 'Razón Social'
  },

  {
    accessorKey: 'tax_id',
    header: 'CUIT'
  },

  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const type = row.getValue('type') as 'client' | 'supplier'

      const config = {
        client: { label: 'Cliente', color: 'primary' },
        supplier: { label: 'Proveedor', color: 'warning' }
      } as const

      const cfg = config[type]

      return h(
        UBadge,
        {
          variant: 'subtle',
          color: cfg.color
        },
        () => cfg.label
      )
    }
  },

  {
    accessorKey: 'phone',
    header: 'Teléfono'
  },

  {
    accessorKey: 'email',
    header: 'Email'
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
