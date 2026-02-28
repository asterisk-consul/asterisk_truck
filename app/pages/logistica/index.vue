<script setup lang="ts">
import { links } from '~/data/logistica'
import SidebarModules from '~/components/ui/SidebarModules.vue'
</script>

<template>
  <UDashboardPanel id="logistica">
    <template #header>
      <UDashboardNavbar title="Logistica" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <SidebarModules :links="links" />
    </template>
  </UDashboardPanel>
</template>
