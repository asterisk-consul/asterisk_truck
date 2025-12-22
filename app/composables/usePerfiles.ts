export function usePerfiles(tipo?: number) {
  const store = usePerfilesStore()
  const { entities, loading } = storeToRefs(store)

  async function load(tipoParam?: number, detalleCompleto = false) {
    if (loading.value) return
    await store.fetchAll(tipoParam ?? tipo, detalleCompleto)
  }

  function selectOptions(categoriaid?: number) {
    return entities.value
      .filter((p) => {
        if (!categoriaid) return true

        const puestos = p.empleado?.puestos ?? []
        return puestos.some((pu: Puesto) => pu.categoriaid === categoriaid)
      })
      .map((p) => ({
        label:
          (p.identificador ?? p.razonsocial ?? `${p.apellido ?? ''}`.trim()) ||
          '-',
        value: p.identificador ?? p.razonsocial ?? `${p.apellido ?? ''}`.trim()
      }))
  }

  function findById(id?: number) {
    return entities.value.find((p) => p.id === id)
  }

  return { loading, load, entities, selectOptions, findById }
}
