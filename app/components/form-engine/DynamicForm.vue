<script setup lang="ts">
import type { FormConfig } from '~/types/form-engine'

const props = defineProps<{
  config: FormConfig
  id?: string // si existe → edit
}>()

const state = reactive({ ...(props.config.initial || {}) })

// 🔹 Load para modo edit
onMounted(async () => {
  if (props.id && props.config.load) {
    const data = await props.config.load(props.id)
    Object.assign(state, data)
  }
})

const submit = async () => {
  await props.config.submit(state, props.id)
}
</script>

<template>
  <UForm :state="state" @submit.prevent="submit">
    <SectionRenderer
      v-for="(section, i) in config.sections"
      :key="i"
      :section="section"
      :state="state"
    />

    <UButton type="submit">
      {{ id ? 'Actualizar' : 'Crear' }}
    </UButton>
  </UForm>
</template>
