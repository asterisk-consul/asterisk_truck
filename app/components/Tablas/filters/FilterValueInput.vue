<script setup lang="ts">
import DateRangePicker from '@/components/compras/FiltroDateCompras.vue'

import type { ColumnFilterMeta } from '../types/tablas.types'

const props = defineProps<{
  modelValue: any
  meta?: ColumnFilterMeta
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()
</script>

<template>
  <!-- TEXT -->

  <UInput
    v-if="meta?.type === 'text'"
    :model-value="modelValue"
    placeholder="Valor..."
    class="w-56"
    @update:model-value="emit('update:modelValue', $event)"
  />

  <!-- NUMBER -->

  <UInput
    v-else-if="meta?.type === 'number'"
    type="number"
    class="w-40"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', Number($event))"
  />

  <!-- SELECT -->

  <USelect
    v-else-if="meta?.type === 'select'"
    class="w-48"
    :items="meta.options || []"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  />

  <!-- BOOLEAN -->

  <USwitch
    v-else-if="meta?.type === 'boolean'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  />

  <!-- DATE RANGE -->

  <DateRangePicker
    v-else-if="meta?.type === 'date-range'"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  />

  <!-- FALLBACK -->

  <UInput
    v-else
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
