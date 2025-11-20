import { defineStore } from 'pinia'
import { fetchData, postData } from '@/service/apiService'

export const useDepositosStore = defineStore('depositos', {
  state: () => ({
    depositos: [] as Partial<ApiDeposito>[],
    camiones: [] as Partial<ApiDeposito>[],
    error: null as string | null
  }),
  actions: {
    async fetchDepositos(): Promise<void> {
      this.error = null
      try {
        const data =
          await fetchData<Partial<ApiRegistroCabList>>('/deposito/index')
        this.depositos = data.rows ?? []
      } catch (error) {
        console.error('❌ Error fetching depositos:', error)
        this.error = error instanceof Error ? error.message : 'Unknown error'
      }
    },
    async fetchCamiones(): Promise<void> {
      this.error = null
      try {
        await this.fetchDepositos() // <-- IMPORTANTE

        const parentId = [254, 255]

        // Asegura que depositos sea SIEMPRE un array
        const depositos = this.depositos ?? []

        this.camiones = depositos.filter((deposito) =>
          parentId.includes(deposito.parentid ?? 0)
        )
        console.log('camiones', this.camiones)
      } catch (error) {
        console.error('❌ Error fetching camiones:', error)
        this.error = error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },
  getters: {
    getDepositoById: (state) => (id: number) => {
      return state.depositos.find((deposito) => deposito.id === id)
    },
    getCamionesOptionsDescrip: (state) => {
      return state.camiones.map((c) => ({
        label: c.descrip,
        value: c.descrip
      }))
    }
  }
})
