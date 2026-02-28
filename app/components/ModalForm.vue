<script setup lang="ts">
import type { PropType } from 'vue'
import { reactive, watch, computed } from 'vue'

interface Field {
  label: string
  name: string
  type: string
  placeholder?: string
}

const props = defineProps({
  open: Boolean,
  fields: { type: Array as PropType<Field[]>, required: true },
  title: { type: String, default: 'Formulario' }
})

const emit = defineEmits(['update:open', 'submit'])

const modalOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const state = reactive<Record<string, any>>({})

function resetForm() {
  for (const f of props.fields) {
    state[f.name] = f.type === 'checkbox' ? false : ''
  }
}

/* Inicialización */
watch(
  () => props.fields,
  () => resetForm(),
  { immediate: true }
)

/* Reset al cerrar */
watch(
  () => props.open,
  (value) => {
    if (!value) {
      resetForm()
    }
  }
)

function handleSubmit() {
  emit('submit', { ...state })
  resetForm()
  modalOpen.value = false
}

function close() {
  emit('update:open', false)
  resetForm()
}
</script>

<template>
  <UModal v-model:open="modalOpen">
    <!-- HEADER -->
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">
          {{ title }}
        </h3>

        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          @click="close"
        />
      </div>
    </template>

    <!-- FORM -->
    <template #body>
      <div class="max-h-[70vh] overflow-y-auto pr-2">
        <UForm :state="state" @submit="handleSubmit" class="space-y-8">
          <!-- Grid 2 columnas -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <template v-for="field in fields" :key="field.name">
              <!-- 🔥 FORM FIELD -->
              <UFormField :label="field.label" :name="field.name">
                <!-- CHECKBOX -->
                <UCheckbox
                  v-if="field.type === 'checkbox'"
                  v-model="state[field.name]"
                />

                <!-- INPUT -->
                <UInput
                  v-else
                  v-model="state[field.name]"
                  :type="field.type"
                  :placeholder="field.placeholder"
                  size="lg"
                />
              </UFormField>
            </template>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-6 border-t">
            <UButton color="neutral" variant="soft" @click="modalOpen = false">
              Cancelar
            </UButton>

            <UButton type="submit" color="primary" size="lg">Guardar</UButton>
          </div>
        </UForm>
      </div>
    </template>
  </UModal>
</template>
