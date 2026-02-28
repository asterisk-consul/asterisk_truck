<script setup lang="ts">
import { links as logistica } from '~/data/logistica'
import SidebarModules from '~/components/ui/SidebarModules.vue'
import { navigationLinks } from '~/data/navigation'

const route = useRoute()
const toast = useToast()

const open = ref(false)
const links = navigationLinks

const groups = computed(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.flat()
  }
])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title: 'Este sitio utiliza cookies',
    duration: 0,
    close: false,
    actions: [
      {
        label: 'Aceptar',
        color: 'neutral',
        variant: 'outline',
        onClick: () => {
          cookie.value = 'accepted'
        }
      },
      {
        label: 'Rechazar',
        color: 'neutral',
        variant: 'ghost'
      }
    ]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <!-- SIDEBAR PRINCIPAL -->
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
    >
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
        />
      </template>
    </UDashboardSidebar>

    <!-- PANEL PRINCIPAL -->
    <UDashboardPanel id="logistica" :ui="{ body: '!p-0' }">
      <!-- HEADER -->
      <template #header>
        <UDashboardNavbar title="Logística">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>
        </UDashboardNavbar>
      </template>

      <!-- CONTENIDO CON SIDEBAR SECUNDARIO -->
      <template #body>
        <div class="flex h-full">
          <!-- SIDEBAR SECUNDARIO (BAJO HEADER) -->

          <SidebarModules :links="logistica" />

          <!-- CONTENIDO DE PÁGINA -->
          <main class="flex-1 p-6 overflow-auto">
            <slot />
          </main>
        </div>
      </template>
    </UDashboardPanel>

    <!-- SEARCH GLOBAL -->
    <UDashboardSearch :groups="groups" />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
