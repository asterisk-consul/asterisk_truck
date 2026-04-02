<script setup lang="ts">
import { ref } from 'vue'
import { FileService } from '../../services/fileApiNd'

const file = ref<File | null>(null)
const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

async function upload() {
  if (!file.value) return

  loading.value = true
  error.value = null
  result.value = null

  try {
    const response = await FileService.apiPostFile(file.value)
    result.value = response.data

    // Mostrar notificación según resultado
    if (response.data.errors?.length > 0) {
      console.warn('Algunos registros fallaron:', response.data.errors)
    }
  } catch (err: any) {
    console.error('Error completo:', err)
    error.value = err?.data?.message || err?.message || 'Error al importar'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 600px; margin: 40px auto">
    <h2>Importar Facturas de compra</h2>

    <UFileUpload
      v-model="file"
      color="neutral"
      highlight
      label="Arrastra tu archivo aquí"
      description=".xlsx, .csv, .json"
      accept=".xlsx,.csv,.json"
      class="w-96 min-h-48 hover:bg-gray-800 hover:cursor-pointer"
    />

    <p v-if="file" class="mt-2 text-sm font-medium">
      ✓ Archivo seleccionado: {{ file.name }} ({{
        (file.size / 1024).toFixed(2)
      }}
      KB)
    </p>

    <UButton :disabled="!file || loading" @click="upload" class="mt-4">
      {{ loading ? 'Importando...' : 'Importar' }}
    </UButton>

    <!-- Resultado exitoso -->
    <div v-if="result" class="mt-4">
      <div class="p-4 bg-green-50 border border-green-200 rounded">
        <h3 class="font-bold text-green-800">✓ Importación completada</h3>
        <p class="text-sm text-green-700">
          Total procesado: {{ result.total }} | Exitosos:
          {{ result.processed }} | Fallidos: {{ result.failed }}
        </p>
      </div>

      <!-- Mostrar errores si los hay -->
      <div
        v-if="result.errors && result.errors.length > 0"
        class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded"
      >
        <h4 class="font-bold text-yellow-800 mb-2">⚠ Registros con errores:</h4>
        <div v-for="err in result.errors" :key="err.row" class="text-sm mb-2">
          <span class="font-semibold">Fila {{ err.row }}:</span>
          <ul class="ml-4 list-disc text-yellow-700">
            <li v-for="msg in err.errors" :key="msg">{{ msg }}</li>
          </ul>
        </div>
      </div>

      <!-- Datos importados exitosamente -->
      <details v-if="result.data && result.data.length > 0" class="mt-4">
        <summary class="cursor-pointer font-semibold">
          Ver datos importados ({{ result.data.length }})
        </summary>
        <pre class="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">{{
          JSON.stringify(result.data, null, 2)
        }}</pre>
      </details>
    </div>

    <!-- Error general -->
    <p
      v-if="error"
      class="mt-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded"
    >
      {{ error }}
    </p>
  </div>
</template>
