export function useCombustibleApi() {
  const bulkInsertCarga = async (records: RegistroCombustible[]) => {
    return $fetch('/api/combustible/carga', {
      method: 'POST',
      body: { records }
    })
  }

  const bulkInsertDescarga = async (records: RegistroCombustible[]) => {
    return $fetch('/api/combustible/descarga', {
      method: 'POST',
      body: { records }
    })
  }

  const getMedida = async () => {
    const data = await useFetch('/articulo/show/1189')
    return
  }

  return {
    bulkInsertCarga,
    bulkInsertDescarga,
    getMedida
  }
}
