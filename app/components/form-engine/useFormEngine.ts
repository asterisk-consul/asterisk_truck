// components/form-engine/useFormEngine.ts

import { reactive, ref, onMounted } from 'vue'
import type { FormConfig } from '~/types/form-engine'

export function useFormEngine(config: FormConfig, id?: string) {
  const state = reactive({ ...(config.initial || {}) })
  const loading = ref(false)
  const optionsMap = reactive<Record<string, any[]>>({})

  // 🔹 Cargar datos (modo EDIT)
  const load = async () => {
    if (!id || !config.load) return

    loading.value = true
    try {
      const data = await config.load(id)
      Object.assign(state, data)
    } finally {
      loading.value = false
    }
  }

  // 🔹 Cargar opciones remotas
  const loadOptions = async (fieldName: string, fetcher: any) => {
    optionsMap[fieldName] = await fetcher('', state)
  }

  // 🔹 Submit
  const submit = async () => {
    loading.value = true
    try {
      await config.submit(state, id)
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return {
    state,
    loading,
    optionsMap,
    loadOptions,
    submit
  }
}
