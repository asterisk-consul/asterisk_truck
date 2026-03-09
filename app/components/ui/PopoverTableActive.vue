<script setup lang="ts">
const props = defineProps<{
  active: boolean
}>()

const emit = defineEmits<{
  toggle: [value: boolean]
}>()
</script>

<template>
  <UPopover mode="click">
    <UBadge
      class="cursor-pointer"
      variant="subtle"
      :color="active ? 'success' : 'error'"
    >
      {{ active ? 'Activo' : 'Inactivo' }}
    </UBadge>

    <template #content>
      <div class="p-2 flex flex-col gap-1 w-36">
        <span class="text-muted text-xs">Cambiar estado</span>
        <UButton
          size="xs"
          :variant="active ? 'solid' : 'ghost'"
          @click="emit('toggle', true)"
        >
          Activo
        </UButton>
        <UButton
          size="xs"
          color="error"
          :variant="!active ? 'solid' : 'ghost'"
          @click="emit('toggle', false)"
        >
          Inactivo
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
