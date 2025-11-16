<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useKilometrosStore } from '@/stores/useKilometrosStore'

  const props = defineProps({
    modelValue: Boolean,
    registros: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['update:modelValue', 'completado'])

  const csvStore = useKilometrosStore()

  const dialogVisible = ref(false)
  const envioCompleto = ref(false)
  const progresoActual = ref(0)
  const totalRegistros = ref(0)
  const registroActual = ref(null)
  const resultadosEnvio = ref({
    exitosos: [],
    fallidos: []
  })

  // Sincronizar con v-model
  watch(
    () => props.modelValue,
    (newVal) => {
      dialogVisible.value = newVal
      if (newVal) iniciarEnvio()
    }
  )

  watch(dialogVisible, (newVal) => {
    emit('update:modelValue', newVal)
  })

  // Iniciar envío
  const iniciarEnvio = async () => {
    envioCompleto.value = false
    progresoActual.value = 0
    registroActual.value = null
    resultadosEnvio.value = { exitosos: [], fallidos: [] }
    totalRegistros.value = props.registros.length

    // Convertir datos como espera la API
    const datos = props.registros.map((r) => ({
      patente: r.descripcion,
      kilometros: parseFloat(r.kilometros),
      fecha: r.fecha
    }))

    // Llamar método con callback de progreso
    const resultado = await csvStore.saveRegistroCabyCuerpo(
      datos,
      (actual, registro) => {
        progresoActual.value = actual
        registroActual.value = registro
      }
    )

    resultadosEnvio.value = resultado.resultados
    envioCompleto.value = true

    emit('completado', resultado)
  }

  const cerrarDialog = () => {
    dialogVisible.value = false
  }
</script>

<template>
  <UModal v-model="dialogVisible" :ui="{ width: 'max-w-xl' }" prevent-close>
    <UCard>
      <!-- Título -->
      <template #header>
        <div
          class="flex items-center gap-2 text-white bg-blue-600 p-3 rounded-t-xl"
        >
          <UIcon name="i-heroicons-paper-airplane-solid" class="w-5 h-5" />
          <span class="font-semibold">Enviando registros a Flow</span>
        </div>
      </template>

      <div class="p-4">
        <!-- Progreso general -->
        <div v-if="!envioCompleto" class="mb-6">
          <div class="flex justify-between text-sm mb-2">
            <span>Procesando: {{ progresoActual }} / {{ totalRegistros }}</span>
            <span class="text-gray-500">
              {{ Math.round((progresoActual / totalRegistros) * 100) }}%
            </span>
          </div>

          <UProgress
            :value="(progresoActual / totalRegistros) * 100"
            size="lg"
            class="rounded-full"
          />
        </div>

        <!-- Registro actual procesando -->
        <UCard
          v-if="registroActual && !envioCompleto"
          variant="outline"
          class="mb-6 border-gray-300"
        >
          <div class="flex items-center gap-3">
            <UProgress animation="indeterminate" size="xs" class="w-6" />
            <div>
              <div class="font-semibold">
                {{ registroActual.patente }}
              </div>
              <div class="text-gray-500 text-sm">
                {{ registroActual.kilometros }} km - {{ registroActual.fecha }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Resultados finales -->
        <div v-if="envioCompleto">
          <UAlert
            :color="resultadosEnvio.fallidos.length === 0 ? 'green' : 'yellow'"
            variant="soft"
            class="mb-4"
            icon="i-heroicons-check-circle"
          >
            <template #title>
              {{
                resultadosEnvio.fallidos.length === 0
                  ? '¡Envío completado!'
                  : 'Envío completado con errores'
              }}
            </template>

            {{ resultadosEnvio.exitosos.length }} exitosos —
            {{ resultadosEnvio.fallidos.length }} fallidos
          </UAlert>

          <!-- Listas en acordeones -->
          <UAccordion multiple class="mb-4">
            <!-- Exitosos -->
            <UAccordionItem
              v-if="resultadosEnvio.exitosos.length > 0"
              name="exitosos"
            >
              <template #title>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="text-green-600"
                  />
                  Registros exitosos ({{ resultadosEnvio.exitosos.length }})
                </div>
              </template>

              <ul class="space-y-2 pl-2">
                <li
                  v-for="(item, idx) in resultadosEnvio.exitosos"
                  :key="idx"
                  class="flex items-start gap-2"
                >
                  <UIcon name="i-heroicons-check" class="text-green-600 mt-1" />
                  <div>
                    <div class="font-medium">
                      {{ item.patente }}
                    </div>
                    <div class="text-gray-500 text-sm">
                      {{ item.kilometros }} km — {{ item.fecha }}
                    </div>
                  </div>
                </li>
              </ul>
            </UAccordionItem>

            <!-- Fallidos -->
            <UAccordionItem
              v-if="resultadosEnvio.fallidos.length > 0"
              name="fallidos"
            >
              <template #title>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="text-red-600"
                  />
                  Registros fallidos ({{ resultadosEnvio.fallidos.length }})
                </div>
              </template>

              <ul class="space-y-2 pl-2">
                <li
                  v-for="(item, idx) in resultadosEnvio.fallidos"
                  :key="idx"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    name="i-heroicons-x-circle"
                    class="text-red-600 mt-1"
                  />
                  <div>
                    <div class="font-medium">
                      {{ item.patente }}
                    </div>
                    <div class="text-red-600 text-sm">
                      {{ item.error }}
                    </div>
                  </div>
                </li>
              </ul>
            </UAccordionItem>
          </UAccordion>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex justify-end">
          <UButton v-if="envioCompleto" color="blue" @click="cerrarDialog">
            Cerrar
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
