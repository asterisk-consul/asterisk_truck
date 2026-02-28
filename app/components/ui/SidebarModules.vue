<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const open = ref(false)
defineProps<{
  links: NavigationMenuItem[][]
}>()
</script>

<template>
  <UDashboardSidebar resizable :ui="{ footer: 'border-t border-default' }">
    <UNavigationMenu :items="links[0]" orientation="vertical" tooltip popover />

    <UNavigationMenu
      :items="links[1]"
      orientation="vertical"
      tooltip
      class="mt-auto"
    />
  </UDashboardSidebar>
</template>
