// composables/useDistribuciones.ts

import {
  distribucionSchema,
  distribucionesSchema
} from '@/schemas/distribuciones.schema'

export const useDistribuciones = (
  compraOriginal: Ref<Partial<Compra>>,
  opcionesCamiones: Ref<Array<{label: string, value: string}>> // 👈 Agregar este parámetro
)  => {
    
    const crearDistribucionVacia = (): Distribucion => ({
        clasificacion: undefined,
        porcentaje: 0,
        bloqueada: false,
        importes: {
            totalimpuestos: 0,
            totalprecio: 0,
            varcn0: 0,
            varcn1: 0,
            varcn2: 0,
            varcn3: 0
        }
    })
    
    const distribuciones = ref<Distribucion[]>([crearDistribucionVacia()])
  // ====== CRUD BÁSICO ======
  const agregarDistribucion = () => {
    distribuciones.value.push(crearDistribucionVacia())
  }

  const eliminarDistribucion = (index: number) => {
    if (distribuciones.value.length > 1) {
      distribuciones.value.splice(index, 1)
    }
  }

  const toggleBloqueo = (index: number) => {
    const dist = distribuciones.value[index]
    if (dist) {
      dist.bloqueada = !dist.bloqueada
    }
  }

  // ====== CÁLCULOS ======
  const calcularImportesPorPorcentaje = (index: number) => {
    const dist = distribuciones.value[index]
    if (!dist) return

    const p = dist.porcentaje
    dist.importes = {
      totalimpuestos: Math.round((compraOriginal.value.totalimpuestos || 0) * p * 100) / 100,
      totalprecio: Math.round((compraOriginal.value.totalprecio || 0) * p * 100) / 100,
      varcn0: Math.round((compraOriginal.value.varcn0 || 0) * p * 100) / 100,
      varcn1: Math.round((compraOriginal.value.varcn1 || 0) * p * 100) / 100,
      varcn2: Math.round((compraOriginal.value.varcn2 || 0) * p * 100) / 100,
      varcn3: Math.round((compraOriginal.value.varcn3 || 0) * p * 100) / 100
    }
  }

  const totalesDistribuidos = computed(() => {
    return distribuciones.value.reduce(
      (acc, dist) => ({
        totalimpuestos: acc.totalimpuestos + (dist.importes.totalimpuestos || 0),
        totalprecio: acc.totalprecio + (dist.importes.totalprecio || 0),
        varcn0: acc.varcn0 + (dist.importes.varcn0 || 0),
        varcn1: acc.varcn1 + (dist.importes.varcn1 || 0),
        varcn2: acc.varcn2 + (dist.importes.varcn2 || 0),
        varcn3: acc.varcn3 + (dist.importes.varcn3 || 0)
      }),
      { totalimpuestos: 0, totalprecio: 0, varcn0: 0, varcn1: 0, varcn2: 0, varcn3: 0 }
    )
  })

  // ====== VALIDACIONES ======
  const r2 = (n: number | null | undefined) => Math.round((n || 0) * 100) / 100
  const isEqual = (a: number, b: number, tolerance = 0.01) => 
    Math.abs(r2(a) - r2(b)) <= tolerance

  const totalesCoincidenCompletamente = computed(() => {
    const d = totalesDistribuidos.value
    return (
      isEqual(compraOriginal.value.totalimpuestos, d.totalimpuestos) &&
      isEqual(compraOriginal.value.totalprecio, d.totalprecio) &&
      isEqual(compraOriginal.value.varcn0, d.varcn0) &&
      isEqual(compraOriginal.value.varcn1, d.varcn1) &&
      isEqual(compraOriginal.value.varcn2, d.varcn2) &&
      isEqual(compraOriginal.value.varcn3, d.varcn3)
    )
  })

  const esDistribucionValida = (dist: Distribucion) => {
    try {
      distribucionSchema.parse(dist)
      return true
    } catch {
      return false
    }
  }

  // ====== ACCIONES AVANZADAS ======
  const prorraterarEquitativamente = () => {
    const noBloqueadas = distribuciones.value.filter(d => !d.bloqueada)
    const porcentajeBloqueado = distribuciones.value
      .filter(d => d.bloqueada)
      .reduce((sum, d) => sum + d.porcentaje, 0)
    
    const porcentajeDisponible = 1 - porcentajeBloqueado
    const porcentajePorDist = porcentajeDisponible / noBloqueadas.length

    distribuciones.value.forEach((dist, index) => {
      if (!dist.bloqueada) {
        dist.porcentaje = porcentajePorDist
        calcularImportesPorPorcentaje(index)
      }
    })
  }

const distribuirTodosCamiones = () => {
    const porcentaje = 1 / opcionesCamiones.value.length
    
    distribuciones.value = opcionesCamiones.value.map(camion => ({
      clasificacion: camion,
      porcentaje,
      bloqueada: false,
      importes: {
        totalimpuestos: Math.round((compraOriginal.value.totalimpuestos || 0) * porcentaje * 100) / 100,
        totalprecio: Math.round((compraOriginal.value.totalprecio || 0) * porcentaje * 100) / 100,
        varcn0: Math.round((compraOriginal.value.varcn0 || 0) * porcentaje * 100) / 100,
        varcn1: Math.round((compraOriginal.value.varcn1 || 0) * porcentaje * 100) / 100,
        varcn2: Math.round((compraOriginal.value.varcn2 || 0) * porcentaje * 100) / 100,
        varcn3: Math.round((compraOriginal.value.varcn3 || 0) * porcentaje * 100) / 100
      }
    }))
  }

  const ajustarDistribucionesNoBloquedas = (indexModificado: number) => {
    const distModificada = distribuciones.value[indexModificado]
    if (!distModificada || distModificada.bloqueada) return

    const noBloqueadas = distribuciones.value.filter((d, i) => !d.bloqueada && i !== indexModificado)
    if (noBloqueadas.length === 0) return

    const porcentajeBloqueado = distribuciones.value
      .filter(d => d.bloqueada)
      .reduce((sum, d) => sum + d.porcentaje, 0)

    const porcentajeRestante = 1 - porcentajeBloqueado - distModificada.porcentaje
    const porcentajePorDist = porcentajeRestante / noBloqueadas.length

    distribuciones.value.forEach((dist, index) => {
      if (!dist.bloqueada && index !== indexModificado) {
        dist.porcentaje = Math.max(0, porcentajePorDist)
        calcularImportesPorPorcentaje(index)
      }
    })
  }

  // ====== FILTROS ======
  const getOpcionesDisponibles = (indexActual: number) => {
    const seleccionados = distribuciones.value
      .map((dist, idx) => idx !== indexActual ? dist.clasificacion?.value : null)
      .filter(Boolean)
    
    return opcionesCamiones.value.filter(
      opcion => !seleccionados.includes(opcion.value)
    )
  }

  return {
    // Estado
    distribuciones,
    totalesDistribuidos,
    totalesCoincidenCompletamente,
    
    // CRUD
    agregarDistribucion,
    eliminarDistribucion,
    toggleBloqueo,
    
    // Cálculos
    calcularImportesPorPorcentaje,
    
    // Validaciones
    esDistribucionValida,
    
    // Acciones
    prorraterarEquitativamente,
    distribuirTodosCamiones,
    ajustarDistribucionesNoBloquedas,
    
    // Utilidades
    getOpcionesDisponibles
  }
}