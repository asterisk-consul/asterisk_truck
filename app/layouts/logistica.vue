<script setup lang="ts">
import { links as logistica } from '~/pages/logistica/logisticaNavigation'
import SidebarModules from '~/components/ui/SidebarModules.vue'
import { navigationLinks } from '~/data/navigation'
import { useVersion } from '~/composables/useVersion'

const versions = useVersion()

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
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-default"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>
      <template #footer="{ collapsed }">
        <div class="flex flex-col w-full">
          <UserMenu :collapsed="collapsed" />
          <div class="py-3 flex justify-center">
            <div class="flex items-center text-xs text-muted">
              <span>v{{ versions.version }}</span>

              <UBadge
                v-if="versions.stage"
                size="xs"
                variant="soft"
                color="neutral"
                class="ml-2 capitalize"
              >
                {{ versions.stage }}
              </UBadge>
            </div>
          </div>
        </div>
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
