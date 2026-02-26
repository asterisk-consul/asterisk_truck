<script setup lang="ts">
import type { SectionConfig } from '~/types/form-engine'

const props = defineProps<{
  section: SectionConfig
  state: any
}>()
</script>

<template>
  <div class="mb-8">
    <h3 v-if="section.title" class="text-lg font-bold mb-4">
      {{ section.title }}
    </h3>

    <div class="grid grid-cols-12 gap-4">
      <FieldRenderer
        v-for="field in section.fields"
        :key="field.name"
        :field="field"
        :state="state"
      />
    </div>
  </div>
</template>
