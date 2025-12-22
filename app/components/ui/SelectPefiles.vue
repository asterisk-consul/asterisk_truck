<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { SelectItem } from '@nuxt/ui'
import { usePerfiles } from '~/composables/usePerfiles'
import type { PropType } from 'vue'

// --- props ---
const props = defineProps({
  modelValue: {
    type: String as PropType<string>,
    default: ''
  },
  label: {
    type: String as PropType<string>,
    default: ''
  },
  placeholder: {
    type: String as PropType<string>,
    default: 'Seleccionar un perfil'
  },
  tipo: {
    type: Number as PropType<number | null>,
    default: null
  },
  categoriaid: {
    type: Number as PropType<number | null>,
    default: null
  }
})

// --- emits ---
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// --- estado interno ---
const selectedValue = ref(props.modelValue)

// --- sincronizar v-model ---
watch(selectedValue, (val) => emit('update:modelValue', val))
watch(
  () => props.modelValue,
  (val) => {
    if (val !== selectedValue.value) selectedValue.value = val ?? ''
  }
)

// --- composable perfiles ---
const perfiles = usePerfiles(props.tipo ?? undefined)
const loading = perfiles.loading

// --- cargar perfiles ---
onMounted(async () => {
  await perfiles.load(props.tipo ?? undefined, true)
  console.log('Perfiles cargados:', perfiles.entities.value)
})

// --- items filtrados por categoriaid ---
const items = computed<SelectItem[]>(() =>
  perfiles.selectOptions(props.categoriaid ?? undefined)
)
</script>

<template>
  <div>
    <label v-if="props.label" class="block my-2">{{ props.label }}</label>
    <USelect
      v-model="selectedValue"
      :items="items"
      :loading="loading"
      :placeholder="props.placeholder"
      class="w-full"
      disable-portal
    />
  </div>
</template>
