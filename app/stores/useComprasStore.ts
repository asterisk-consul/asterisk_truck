// useComprasStore.ts
import { defineStore } from 'pinia'
import { postData } from '@/service/apiService'
// ⬆️ Arriba del defineStore
function diffIds(oldIds: number[], newIds: number[]) {
  const setOld = new Set(oldIds)
  return newIds.filter((id) => !setOld.has(id))
}

export const useComprasStore = defineStore('compras', {
  state: (): ComprasState => ({
    comprasA: [],
    comprasB: [],
    loading: false,
    error: null,
    loaded: false,
    comprasSeleccionadas: [],
    clasificando: false,
    lastFetch: null as Date | null
  }),

  actions: {
    /**
     * 👉 Solo carga una vez, no recarga cuando vuelvas a entrar al componente
     */
    async fetchComprasOnce() {
      if (this.loaded) return

      await this.fetchCompras() // fetch real con caché
      this.loaded = true
    },

    /**
     * 👉 Carga completa de compras con cache inteligente
     */
    async fetchCompras(force = false): Promise<void> {
      const CACHE_TIME = 12 * 60 * 60 * 1000 // ⏳ 12 horas
      const now = Date.now()

      const shouldUseCache =
        !force &&
        this.lastFetch &&
        now - this.lastFetch.getTime() < CACHE_TIME &&
        this.comprasA.length > 0 &&
        this.comprasB.length > 0

      if (shouldUseCache) {
        console.log('🟢 Usando datos en caché (12h)')
        return
      }
      console.log('🔄 Cargando compras desde API...')
      this.loading = true
      this.error = null

      try {
        const flowidA = 11080
        const statusidA = 1711
        const flowidB = 11079
        const statusidB = 1692

        const dataA = {
          flowid: flowidA,
          statusid: statusidA,
          pattern: '',
          offset: 0,
          sort: 'referenciatexto',
          descending: false
        }

        const dataB = {
          flowid: flowidB,
          statusid: statusidB,
          pattern: '',
          offset: 0,
          sort: 'referenciatexto',
          descending: false
        }

        // Obtener listas principales A y B
        const [comprasAResList, comprasBResList] = await Promise.all([
          postData<ApiRegistroCabList>('/workspace/getRegistroCabList', dataA),
          postData<ApiRegistroCabList>('/workspace/getRegistroCabList', dataB)
        ])

        const idsA = (comprasAResList.data.rows || []).map((row) => row.id)
        const idsB = (comprasBResList.data.rows || []).map((row) => row.id)

        /**
         * 👉 Carga concurrente limitada para evitar cuelgues
         */
        const fetchInBatchesProgressive = async (
          ids: number[],
          batchSize: number,
          tipo: 'A' | 'B'
        ) => {
          if (tipo === 'A') this.comprasA = []
          else this.comprasB = []

          for (let i = 0; i < ids.length; i += batchSize) {
            const batch = ids.slice(i, i + batchSize)

            const batchResults = await Promise.all(
              batch.map((id) =>
                postData('/workspace/getRegistroCabGeneric', {
                  id: id,
                  checkuser: true
                }).catch((err) => {
                  console.error(`Error en ID ${id}:`, err)
                  return null
                })
              )
            )

            const validResults = batchResults
              .filter((r) => r?.data)
              .map((r) => r?.data)

            if (tipo === 'A') this.comprasA.push(...validResults)
            else this.comprasB.push(...validResults)

            // Evento para notificar progresos (si lo usás)
            window.dispatchEvent(
              new CustomEvent(`compras-${tipo.toLowerCase()}-updated`, {
                detail: {
                  loaded:
                    tipo === 'A' ? this.comprasA.length : this.comprasB.length,
                  total: ids.length,
                  tipo
                }
              })
            )

            console.log(
              `✓ Compras ${tipo}: ${
                tipo === 'A' ? this.comprasA.length : this.comprasB.length
              }/${ids.length}`
            )
          }
        }

        // Procesar ambas listas A y B en paralelo
        await Promise.all([
          fetchInBatchesProgressive(idsA, 50, 'A'),
          fetchInBatchesProgressive(idsB, 50, 'B')
        ])

        this.lastFetch = new Date()
        this.loaded = true

        console.log(`✅ Compras A: ${this.comprasA.length} registros`)
        console.log(`✅ Compras B: ${this.comprasB.length} registros`)
      } catch (error) {
        console.error('Error al obtener compras:', error)
        this.error = 'Error al cargar las compras'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateNuevasCompras() {
      const flowidA = 11080
      const statusidA = 1711
      const flowidB = 11079
      const statusidB = 1692

      const dataA = {
        flowid: flowidA,
        statusid: statusidA,
        pattern: '',
        offset: 0,
        sort: 'referenciatexto',
        descending: false
      }
      const dataB = {
        flowid: flowidB,
        statusid: statusidB,
        pattern: '',
        offset: 0,
        sort: 'referenciatexto',
        descending: false
      }

      const [listaA, listaB] = await Promise.all([
        postData<ApiRegistroCabList>('/workspace/getRegistroCabList', dataA),
        postData<ApiRegistroCabList>('/workspace/getRegistroCabList', dataB)
      ])

      const nuevosA = diffIds(
        this.comprasA.map((c) => c.id),
        listaA.data.rows.map((r) => r.id)
      )

      const nuevosB = diffIds(
        this.comprasB.map((c) => c.id),
        listaB.data.rows.map((r) => r.id)
      )

      console.log('🆕 IDs nuevos A:', nuevosA)
      console.log('🆕 IDs nuevos B:', nuevosB)

      // Descargar solo nuevos
      const fetchNuevos = async (ids: number[]) => {
        return Promise.all(
          ids.map((id) =>
            postData('/workspace/getRegistroCabGeneric', {
              id,
              checkuser: true
            })
              .then((r) => r.data)
              .catch(() => null)
          )
        )
      }

      if (nuevosA.length) {
        const nuevosDatosA = await fetchNuevos(nuevosA)
        this.comprasA.push(...nuevosDatosA.filter(Boolean))
      }

      if (nuevosB.length) {
        const nuevosDatosB = await fetchNuevos(nuevosB)
        this.comprasB.push(...nuevosDatosB.filter(Boolean))
      }

      console.log('✨ Sync completa sin recargar todo')
    },

    async reloadCompras(): Promise<void> {
      this.loaded = false
      await this.fetchCompras(true)
    },

    /**
     * 👉 Crear registros clasificados
     */
    async crearRegistrosClasificados(
      compra: Compra,
      distribuciones: Distribucion[]
    ): Promise<{ success: boolean; creados: number; resultados: any[] }> {
      this.clasificando = true
      this.error = null

      try {
        const promesas = distribuciones.map((distribucion) =>
          postData('/workspace/saveRegistroCab', {
            id: -1,
            flowid: 11088,
            statusid: 1715,
            statusflowid: 781,
            opciondesplegabletexto: distribucion.clasificacion,
            clientid: compra.clientid ?? null,
            clientname: compra.clientname ?? null,
            referenciatexto: compra.referenciatexto ?? null,
            fecha: compra.fecha ?? null,
            fechacompromiso: compra.fechacompromiso ?? null,
            totalimpuestos: distribucion.importes.totalimpuestos ?? null,
            totalprecio: distribucion.importes.totalprecio ?? null,
            varcn0: distribucion.importes.varcn0 ?? 0,
            varcn1: distribucion.importes.varcn1 ?? 0,
            varcn2: distribucion.importes.varcn2 ?? 0,
            varcn3: distribucion.importes.varcn3 ?? 0,
            responsableactactualid: '358',
            responsableactactual: { id: '358', identificador: '' },
            xlatitud: -32.4193186,
            xlongitud: -63.2334244,
            articulos: [],
            cuerpos: [],
            dependeDe: [],
            instructivoExec: []
          })
        )

        const resultados = await Promise.all(promesas)

        // Refrescar datos
        await this.reloadCompras()

        return {
          success: true,
          creados: resultados.length,
          resultados
        }
      } catch (error) {
        console.error('Error al crear registros clasificados:', error)
        this.error = 'Error al clasificar las compras'
        throw error
      } finally {
        this.clasificando = false
      }
    },

    limpiarSeleccion(): void {
      this.comprasSeleccionadas = []
    }
  },

  getters: {
    cantidadSeleccionadas: (state): number => state.comprasSeleccionadas.length,
    haySeleccion: (state): boolean => state.comprasSeleccionadas.length > 0
  }
})
