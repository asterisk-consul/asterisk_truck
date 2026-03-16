<script setup lang="ts">
import { useCorridorsStore } from '~/modulos/logistica/transport/corridors/corridors.store'

const route = useRoute()
const store = useCorridorsStore()

const id = route.params.id as string

await Promise.all([store.fetchCorridor(id), store.fetchRoute(id)])

const corridor = computed(() => store.currentCorridor)
const routeData = computed(() => store.currentRoute)
</script>

<template>
  <UPage v-if="corridor">
    <UPageHeader
      :title="corridor.name || 'Corredor'"
      :description="
        routeData
          ? `${routeData.route[0]?.name} → ${routeData.route[routeData.route.length - 1]?.name}`
          : ''
      "
    >
      <template #actions>
        <UButton icon="i-lucide-pencil" :to="`/corridors/${corridor.id}/edit`">
          Editar
        </UButton>
      </template>
    </UPageHeader>

    <div class="grid grid-cols-3 gap-6">
      <UCard class="col-span-2">
        <div class="h-96 flex items-center justify-center text-gray-400">
          MAPA AQUÍ
        </div>
      </UCard>

      <UCard>
        <h3 class="font-semibold mb-4">Ruta</h3>

        <div class="space-y-3">
          <div
            v-for="(point, index) in routeData?.route"
            :key="index"
            class="flex items-center gap-2"
          >
            <UBadge
              :color="
                point.type === 'origin'
                  ? 'success'
                  : point.type === 'destination'
                    ? 'error'
                    : 'info'
              "
              variant="solid"
              size="sm"
            >
              {{
                point.type === 'origin'
                  ? 'Origen'
                  : point.type === 'destination'
                    ? 'Destino'
                    : `Parada ${index}`
              }}
            </UBadge>

            <span>{{ point.name }}</span>
          </div>
        </div>

        <div class="mt-6 text-sm text-gray-500">
          <p>Distancia: {{ routeData?.total_distance_km ?? '-' }} km</p>
          <p>Tiempo estimado: {{ routeData?.estimated_minutes ?? '-' }} min</p>
        </div>
      </UCard>
    </div>
  </UPage>
</template>
