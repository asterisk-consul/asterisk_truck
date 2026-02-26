import type { FormConfig } from '~/types/form-engine'
import { useVehiclesStore } from '~/stores/logistica/transport/vehicles.store'

export const vehicleForm = (companyId: string): FormConfig => {
  const store = useVehiclesStore()

  return {
    initial: {
      companyId
    },

    sections: [
      {
        title: 'Datos principales',
        fields: [
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            fetchOptions: async () => await $fetch('/api/vehicle-types')
          },

          { name: 'plate', label: 'Patente', type: 'text', required: true },

          { name: 'brand', label: 'Marca', type: 'text' },

          { name: 'model', label: 'Modelo', type: 'text' },

          { name: 'year', label: 'Año', type: 'number' }
        ]
      },

      {
        title: 'Capacidad',
        fields: [
          {
            name: 'maxWeight',
            label: 'Peso máximo (kg)',
            type: 'number'
          },

          {
            name: 'maxVolume',
            label: 'Volumen máximo (m³)',
            type: 'number'
          },

          {
            name: 'refrigeration',
            label: 'Refrigerado',
            type: 'switch'
          }
        ]
      }
    ],

    // 🔹 Crear usando tu store
    submit: async (data) => {
      await store.createVehicle(data)
    }
  }
}
