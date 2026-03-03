<script setup lang="ts" generic="T extends Record<string, any>">
import { reactive, watch, computed } from 'vue'
import type { BaseField } from '@/types/form.types'

const props = defineProps<{
  open: boolean
  fields: BaseField[]
  title?: string
  initialValues?: Partial<T>
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit', value: T): void
}>()

/* ---------------------------------------
   CONTROL MODAL
--------------------------------------- */
const modalOpen = computed({
  get: () => props.open,
  set: (val: boolean) => emit('update:open', val)
})

/* ---------------------------------------
   STATE DINÁMICO TIPADO
--------------------------------------- */
const state = reactive<Record<string, any>>({})

function buildInitialState() {
  for (const field of props.fields) {
    if (props.initialValues && field.name in props.initialValues) {
      state[field.name] = props.initialValues[field.name as keyof T]
      continue
    }

    switch (field.type) {
      case 'checkbox':
        state[field.name] = false
        break
      case 'select':
        state[field.name] = null
        break
      default:
        state[field.name] = ''
    }
  }
}

/* ---------------------------------------
   WATCHERS
--------------------------------------- */
watch(
  () => props.fields,
  () => buildInitialState(),
  { immediate: true }
)

watch(
  () => props.open,
  (val) => {
    if (!val) {
      buildInitialState()
    }
  }
)

/* ---------------------------------------
   SUBMIT
--------------------------------------- */
function handleSubmit() {
  emit('submit', { ...state } as T)
  modalOpen.value = false
}
</script>

<template>
  <UModal v-model:open="modalOpen">
    <!-- HEADER -->
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">
          {{ title ?? 'Formulario' }}
        </h3>

        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          @click="modalOpen = false"
        />
      </div>
    </template>

    <!-- BODY -->
    <template #body>
      <div class="max-h-[70vh] overflow-y-auto pr-2">
        <UForm :state="state" @submit="handleSubmit" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <template v-for="field in fields" :key="field.name">
              <!-- HIDDEN -->
              <input
                v-if="field.type === 'hidden'"
                type="hidden"
                v-model="state[field.name]"
              />

              <UFormField v-else :label="field.label" :name="field.name">
                <!-- CHECKBOX -->
                <UCheckbox
                  v-if="field.type === 'checkbox'"
                  v-model="state[field.name]"
                />

                <!-- SELECT -->
                <USelect
                  v-else-if="field.type === 'select'"
                  v-model="state[field.name]"
                  :items="field.options"
                  class="w-full"
                />

                <!-- TEXTAREA -->
                <UTextarea
                  v-else-if="field.type === 'textarea'"
                  v-model="state[field.name]"
                  :placeholder="field.placeholder"
                  size="lg"
                />

                <!-- INPUTS -->
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

          <!-- FOOTER -->
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
