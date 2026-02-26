<script setup lang="ts">
import type { FieldConfig } from '~/types/form-engine'

const props = defineProps<{
  field: FieldConfig
  state: any
}>()

const options = ref(props.field.options || [])

onMounted(async () => {
  if (props.field.fetchOptions)
    options.value = await props.field.fetchOptions('', props.state)
})

// Visibilidad condicional
const visible = computed(() =>
  props.field.visible ? props.field.visible(props.state) : true
)
</script>

<template>
  <div v-if="visible" :class="`col-span-${field.col || 12}`">
    <UFormGroup :label="field.label">
      <!-- TEXT -->
      <UInput v-if="field.type === 'text'" v-model="state[field.name]" />

      <!-- NUMBER -->
      <UInput
        v-else-if="field.type === 'number'"
        type="number"
        v-model.number="state[field.name]"
      />

      <!-- SWITCH -->
      <USwitch
        v-else-if="field.type === 'switch'"
        v-model="state[field.name]"
      />

      <!-- SELECT -->
      <USelect
        v-else-if="field.type === 'select'"
        v-model="state[field.name]"
        :options="options"
      />

      <!-- AUTOCOMPLETE -->
      <USelectMenu
        v-else-if="field.type === 'autocomplete'"
        v-model="state[field.name]"
        :searchable="true"
        :options="options"
      />

      <!-- DATE -->
      <UInput
        v-else-if="field.type === 'date'"
        type="date"
        v-model="state[field.name]"
      />

      <!-- FILE -->
      <UInput
        v-else-if="field.type === 'file'"
        type="file"
        :accept="field.accept"
        @change="(e) => (state[field.name] = e.target.files[0])"
      />
    </UFormGroup>
  </div>
</template>
