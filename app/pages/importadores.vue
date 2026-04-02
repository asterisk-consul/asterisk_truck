<script setup lang="ts">
import { FileService } from '~/services/fileApi'

const activeKey = ref<string | null>(null)

const importers = [
  {
    key: 'compras',
    title: 'Importar Compras',
    description: 'Importar facturas de compra desde archivo Excel o CSV',
    icon: 'i-lucide-file-plus',
    heading: 'Importar Facturas de compra',
    handler: FileService.importCompras // 👈
  },
  {
    key: 'nc',
    title: 'Importar Notas de Crédito',
    description: 'Importar notas de crédito de proveedores',
    icon: 'i-lucide-rotate-ccw',
    heading: 'Importar Notas de Crédito',
    handler: FileService.importNotaCredito // 👈
  },
  {
    key: 'nd',
    title: 'Importar Notas de Débito',
    description: 'Importar notas de débito de proveedores',
    icon: 'i-lucide-rotate-cw',
    heading: 'Importar Notas de Débito',
    handler: FileService.importNotaDebito // 👈
  }
]
const states = reactive<
  Record<
    string,
    {
      file: File | null
      loading: boolean
      result: any
      error: string | null
    }
  >
>(
  Object.fromEntries(
    importers.map((i) => [
      i.key,
      { file: null, loading: false, result: null, error: null }
    ])
  )
)

function select(key: string) {
  activeKey.value = activeKey.value === key ? null : key
}

async function upload(importer: (typeof importers)[0]) {
  const s = states[importer.key]
  if (!s.file) return

  s.loading = true
  s.error = null
  s.result = null

  try {
    const response = await importer.handler(s.file) // 👈 llama al handler correcto
    s.result = response.data
  } catch (err: any) {
    s.error = err?.data?.message || err?.message || 'Error al importar'
  } finally {
    s.loading = false
  }
}

const active = computed(
  () => importers.find((i) => i.key === activeKey.value) ?? null
)
</script>

<template>
  <div class="max-w-5xl mx-auto py-10">
    <h1 class="text-2xl font-bold mb-6">Importadores de Datos</h1>

    <UPageGrid class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UCard
        v-for="item in importers"
        :key="item.key"
        class="hover:shadow-lg cursor-pointer transition"
        :class="{ 'ring-2 ring-primary': activeKey === item.key }"
        @click="select(item.key)"
      >
        <div class="flex flex-col items-center text-center gap-3 p-4">
          <UIcon :name="item.icon" class="text-4xl text-primary" />
          <h2 class="text-lg font-semibold">{{ item.title }}</h2>
          <p class="text-sm text-gray-500">{{ item.description }}</p>
        </div>
      </UCard>
    </UPageGrid>

    <!-- Panel del importador activo -->
    <div v-if="active" class="mt-8 max-w-xl">
      <h2 class="text-xl font-semibold mb-4">{{ active.heading }}</h2>

      <UFileUpload
        v-model="states[active.key].file"
        color="neutral"
        highlight
        label="Arrastra tu archivo aquí"
        description=".xlsx, .csv, .json"
        accept=".xlsx,.csv,.json"
        class="w-96 min-h-48 hover:bg-gray-800 hover:cursor-pointer"
      />

      <p v-if="states[active.key].file" class="mt-2 text-sm font-medium">
        ✓ {{ states[active.key].file.name }} ({{
          (states[active.key].file.size / 1024).toFixed(2)
        }}
        KB)
      </p>

      <UButton
        :disabled="!states[active.key].file || states[active.key].loading"
        class="mt-4"
        @click="upload(active)"
      >
        {{ states[active.key].loading ? 'Importando...' : 'Importar' }}
      </UButton>

      <!-- Resultado exitoso -->
      <div v-if="states[active.key].result" class="mt-4">
        <div class="p-4 bg-green-50 border border-green-200 rounded">
          <h3 class="font-bold text-green-800">✓ Importación completada</h3>
          <p class="text-sm text-green-700">
            Total: {{ states[active.key].result.total }} | Exitosos:
            {{ states[active.key].result.processed }} | Fallidos:
            {{ states[active.key].result.failed }}
          </p>
        </div>

        <div
          v-if="states[active.key].result.errors?.length > 0"
          class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded"
        >
          <h4 class="font-bold text-yellow-800 mb-2">
            ⚠ Registros con errores:
          </h4>
          <div
            v-for="err in states[active.key].result.errors"
            :key="err.row"
            class="text-sm mb-2"
          >
            <span class="font-semibold">Fila {{ err.row }}:</span>
            <ul class="ml-4 list-disc text-yellow-700">
              <li v-for="msg in err.errors" :key="msg">{{ msg }}</li>
            </ul>
          </div>
        </div>

        <details v-if="states[active.key].result.data?.length > 0" class="mt-4">
          <summary class="cursor-pointer font-semibold">
            Ver datos importados ({{ states[active.key].result.data.length }})
          </summary>
          <pre class="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">{{
            JSON.stringify(states[active.key].result.data, null, 2)
          }}</pre>
        </details>
      </div>

      <!-- Error general -->
      <div
        v-if="states[active.key].error"
        class="mt-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded"
      >
        {{ states[active.key].error }}
      </div>
    </div>
  </div>
</template>
