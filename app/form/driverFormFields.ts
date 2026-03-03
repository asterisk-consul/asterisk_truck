import type { BaseField } from '@/types/form.types'
export const driverFormFields: BaseField[] = [
  { label: 'Nombre', name: 'first_name', type: 'text', placeholder: 'Juan' },
  { label: 'Apellido', name: 'last_name', type: 'text', placeholder: 'Pérez' },
  {
    label: 'Documento',
    name: 'document',
    type: 'text',
    placeholder: '30123456'
  },
  { label: 'Teléfono', name: 'phone', type: 'text', placeholder: '3511234567' },
  {
    label: 'N° Licencia',
    name: 'license_number',
    type: 'text',
    placeholder: 'B1234567'
  },
  { label: 'Vencimiento Licencia', name: 'license_expiration', type: 'date' }
]
