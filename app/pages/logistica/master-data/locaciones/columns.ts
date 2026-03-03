import type { TableColumn } from '@nuxt/ui'
import type { Location } from '~/types/logistica/master-data/locations'

export const columns: TableColumn<Location>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => {
      const id = row.getValue('id') as string
      return `#${id.slice(0, 8)}`
    }
  },
  // {
  //   accessorKey: 'address',
  //   header: 'Dirección'
  // },
  {
    accessorKey: 'city',
    header: 'Ciudad'
  },
  {
    accessorKey: 'province',
    header: 'Provincia'
  },
  {
    accessorKey: 'country',
    header: 'País'
  },
  {
    accessorKey: 'postal_code',
    header: 'CP'
  },
  {
    id: 'coordinates',
    header: 'Coordenadas',
    cell: ({ row }) => {
      const lat = row.original.latitude
      const lng = row.original.longitude
      return `${lat}, ${lng}`
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
  },
  {
    id: 'map',
    header: 'Mapa',
    cell: ({ row }) => {
      const { latitude, longitude } = row.original
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`

      return h(
        'a',
        {
          href: url,
          target: '_blank',
          class: 'text-primary underline'
        },
        'Ver mapa'
      )
    }
  }
]
