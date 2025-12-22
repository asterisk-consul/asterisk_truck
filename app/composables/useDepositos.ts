import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDepositosStore } from '~/stores/depositos.store'

export function useDepositos() {
  const store = useDepositosStore()
  const { entities, loading } = storeToRefs(store)

  // --- cargar todos los depósitos ---
  async function load() {
    if (loading.value) return
    await store.fetchAll()
  }

  // --- filtrar camiones según parentId ---
  const camiones = computed(() => {
    const parentId = [254, 255]
    return (entities.value ?? []).filter((d) =>
      parentId.includes(d.parentid ?? 0)
    )
  })

  // --- opciones para USelect ---
  const selectCamiones = computed(() =>
    camiones.value.map((c) => ({
      label: c.descrip ?? '-',
      value: c.descrip ?? '-'
    }))
  )

  // --- buscar por id ---
  function findById(id?: number) {
    return entities.value.find((d) => d.id === id)
  }

  return {
    loading,
    load,
    camiones,
    selectCamiones,
    findById
  }
}
