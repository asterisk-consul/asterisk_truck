<script setup lang="ts">
import type { PlannerStop } from './TripPlanner.types'
import { useLocationsStore } from '~/modulos/logistica/master-data/locations/store/locations.store'
import { useLocations } from '~/modulos/logistica/master-data/locations/composables/useLocations'
import { useDispatchOrdersStore } from '~/modulos/logistica/documents/dispatch-orders/store/dispatch-orders.store'
import { useTripPlannerStore } from './trip-planer.store'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  tripId: string
  initialStops?: any[]
}>()

const emit = defineEmits<{ saved: [] }>()

// ─── Stores ───────────────────────────────────────────────
const plannerStore = useTripPlannerStore()
const { stops, selectedOrders } = storeToRefs(plannerStore)

const locationsStore = useLocationsStore()
const { items: locations } = storeToRefs(locationsStore)
const { items: locationItems } = useLocations(locations)

const dispatchOrdersStore = useDispatchOrdersStore()
const { dispatchOrders, loading: loadingOrders } =
  storeToRefs(dispatchOrdersStore)

// ─── Órdenes visibles en la lista izquierda ───────────────
// IDs que ya venían en initialStops
const savedOrderIds = computed<Set<string>>(() => {
  const ids = (props.initialStops ?? []).flatMap((s: any) =>
    (s.trip_orders ?? []).map((o: any) => o.dispatch_order_id)
  )
  return new Set(ids)
})

// Mostrar pending + las que ya estaban asignadas (aunque no sean PENDING)
const visibleOrders = computed(() =>
  dispatchOrders.value.filter(
    (o) => o.status === 'PENDING' || savedOrderIds.value.has(o.id)
  )
)

// ─── Helpers ──────────────────────────────────────────────
const locationName = (id?: string | null) => {
  if (!id) return '—'
  const loc = locations.value.find((l) => l.id === id)
  return loc ? [loc.city, loc.province].filter(Boolean).join(' - ') : id
}

const isOrderSelected = (orderId: string) =>
  selectedOrders.value.some((o) => o.id === orderId)

const actionLabel: Record<string, string> = {
  PICKUP: 'Carga',
  DELIVERY: 'Descarga'
}

// ─── Preview de paradas (reactivo a selectedOrders) ───────
const previewStops = computed<PlannerStop[]>(() => {
  const map = new Map<string, PlannerStop>()

  selectedOrders.value.forEach((o) => {
    const origin = o.origin_location_id?.trim().toLowerCase()
    const destination = o.destination_location_id?.trim().toLowerCase()

    if (origin) {
      if (!map.has(origin))
        map.set(origin, {
          id: origin,
          location_id: origin,
          stop_order: 0,
          orders: []
        })
      map.get(origin)!.orders.push({
        dispatch_order_id: o.id,
        order_number: o.order_number,
        customer_name: o.customers?.name,
        action: 'PICKUP'
      })
    }

    if (destination) {
      if (!map.has(destination))
        map.set(destination, {
          id: destination,
          location_id: destination,
          stop_order: 0,
          orders: []
        })
      map.get(destination)!.orders.push({
        dispatch_order_id: o.id,
        order_number: o.order_number,
        customer_name: o.customers?.name,
        action: 'DELIVERY'
      })
    }
  })

  return Array.from(map.values()).map((s, i) => ({ ...s, stop_order: i + 1 }))
})

// ─── Reordenar paradas manualmente ────────────────────────
// Usamos una copia local editable del preview para drag manual
const manualStops = ref<PlannerStop[]>([])
const usingManualOrder = ref(false)

watch(
  previewStops,
  (val) => {
    if (!usingManualOrder.value) manualStops.value = val.map((s) => ({ ...s }))
  },
  { immediate: true }
)

const moveStopUp = (index: number) => {
  if (index === 0) return
  usingManualOrder.value = true
  const arr = [...manualStops.value]
  const a = arr[index - 1]
  const b = arr[index]
  if (!a || !b) return // 🔥 guard
  arr[index - 1] = b
  arr[index] = a
  manualStops.value = arr.map((s, i) => ({ ...s, stop_order: i + 1 }))
}

const moveStopDown = (index: number) => {
  if (index === manualStops.value.length - 1) return
  usingManualOrder.value = true
  const arr = [...manualStops.value]
  const a = arr[index]
  const b = arr[index + 1]
  if (!a || !b) return // 🔥 guard
  arr[index] = b
  arr[index + 1] = a
  manualStops.value = arr.map((s, i) => ({ ...s, stop_order: i + 1 }))
}

// ─── Eliminar orden de una parada ─────────────────────────
const removeOrderFromStop = (orderId: string) => {
  // Quitar de selectedOrders => el preview se recalcula solo
  plannerStore.selectedOrders = selectedOrders.value.filter(
    (o) => o.id !== orderId
  )
  usingManualOrder.value = false // reset orden manual al cambiar selección
}

// ─── Guardar ──────────────────────────────────────────────
const saving = ref(false)
const saved = ref(false)

const buildAndSave = async () => {
  saving.value = true
  saved.value = false

  try {
    // 1. Detectar removidas y desasignar
    const removedIds = [...savedOrderIds.value].filter(
      (id) => !selectedOrders.value.some((o) => o.id === id)
    )

    if (removedIds.length > 0) {
      await Promise.all(
        removedIds.map((id) => plannerStore.removeOrderFromTrip(id))
      )
    }

    // 2. Guardar solo si quedan órdenes seleccionadas
    if (selectedOrders.value.length > 0) {
      if (usingManualOrder.value) {
        plannerStore.stops = manualStops.value
      } else {
        plannerStore.buildStopsFromOrders()
      }
      await plannerStore.save()
    }

    saved.value = true
    usingManualOrder.value = false
    emit('saved')
  } finally {
    saving.value = false
  }
}

// ─── Init ─────────────────────────────────────────────────
onMounted(async () => {
  plannerStore.init(props.tripId)
  await Promise.all([locationsStore.fetchAll(), dispatchOrdersStore.fetchAll()])

  if (props.initialStops?.length) {
    const existingIds = props.initialStops.flatMap((s: any) =>
      (s.trip_orders ?? []).map((o: any) => o.dispatch_order_id)
    )
    plannerStore.selectedOrders = dispatchOrders.value.filter((o) =>
      existingIds.includes(o.id)
    )
  }
})
// ─── Detectar cambios ──────────────────────────────────────
const hasChanges = computed(() => {
  const currentIds = new Set(selectedOrders.value.map((o) => o.id))

  // Algo se removió
  const someRemoved = [...savedOrderIds.value].some((id) => !currentIds.has(id))
  // Algo se agregó
  const someAdded = [...currentIds].some((id) => !savedOrderIds.value.has(id))

  return someRemoved || someAdded || usingManualOrder.value
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold">Asignación de órdenes</h3>
        <p class="text-sm text-gray-500">
          Seleccioná las órdenes a incluir en este viaje
        </p>
      </div>
      <UButton
        :loading="saving"
        :disabled="!hasChanges"
        icon="i-lucide-save"
        @click="buildAndSave"
      >
        Guardar asignación
      </UButton>
    </div>

    <div class="grid grid-cols-2 gap-6">
      <!-- IZQUIERDA — lista de órdenes -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Órdenes disponibles</span>
            <UBadge>{{ selectedOrders.length }} seleccionadas</UBadge>
          </div>
        </template>

        <div v-if="loadingOrders" class="py-8 text-center">
          <UIcon name="i-lucide-loader" class="animate-spin" />
        </div>

        <div v-else class="space-y-2 max-h-120 overflow-y-auto">
          <div
            v-for="order in visibleOrders"
            :key="order.id"
            class="border rounded p-2 cursor-pointer transition-colors"
            :class="
              isOrderSelected(order.id)
                ? 'bg-primary-900 border-primary-600'
                : 'hover:bg-gray-800'
            "
            @click="plannerStore.toggleOrder(order)"
          >
            <div class="flex items-center gap-2">
              <UCheckbox
                :model-value="isOrderSelected(order.id)"
                @click.stop
                @update:model-value="plannerStore.toggleOrder(order)"
              />
              <span class="text-sm font-medium text-neutral-200">
                {{ order.order_number ?? order.id }}
              </span>
              <span class="text-sm text-neutral-300">
                {{ order.customers?.name }}
              </span>
              <!-- badge para órdenes ya asignadas -->
              <UBadge
                v-if="savedOrderIds.has(order.id)"
                size="xs"
                color="warning"
                variant="subtle"
              >
                Ya asignada
              </UBadge>
            </div>
            <div class="text-xs pl-6 text-neutral-400 mt-0.5">
              {{ locationName(order.origin_location_id) }}
              →
              {{ locationName(order.destination_location_id) }}
            </div>
          </div>

          <div
            v-if="!visibleOrders.length"
            class="text-sm text-gray-500 py-4 text-center"
          >
            No hay órdenes disponibles
          </div>
        </div>
      </UCard>

      <!-- DERECHA — paradas -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">Paradas del viaje</span>
            <span
              v-if="usingManualOrder"
              class="text-xs text-amber-400 flex items-center gap-1"
            >
              <UIcon name="i-lucide-move-vertical" class="w-3 h-3" />
              Orden personalizado
            </span>
          </div>
        </template>

        <div
          v-if="!selectedOrders.length"
          class="text-sm text-gray-400 py-4 text-center"
        >
          Seleccioná órdenes para ver las paradas
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(stop, i) in manualStops"
            :key="stop.id"
            class="border border-gray-700 rounded-lg p-3 space-y-2"
          >
            <!-- Cabecera de parada -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono text-gray-500 w-5">
                  {{ stop.stop_order }}
                </span>
                <p class="text-sm font-medium">
                  {{ locationName(stop.location_id) }}
                </p>
              </div>

              <!-- Controles de orden -->
              <div class="flex gap-1">
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-chevron-up"
                  :disabled="i === 0"
                  @click="moveStopUp(i)"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-chevron-down"
                  :disabled="i === manualStops.length - 1"
                  @click="moveStopDown(i)"
                />
              </div>
            </div>

            <!-- Órdenes de la parada -->
            <div class="space-y-1 pl-7">
              <div
                v-for="o in stop.orders"
                :key="o.dispatch_order_id"
                class="flex items-center justify-between gap-2 text-xs group"
              >
                <div class="flex items-center gap-2">
                  <UBadge
                    size="xs"
                    :color="o.action === 'PICKUP' ? 'success' : 'info'"
                    variant="subtle"
                  >
                    {{ actionLabel[o.action] ?? o.action }}
                  </UBadge>
                  <span class="font-medium">{{ o.order_number }}</span>
                  <span class="text-gray-400">{{ o.customer_name }}</span>
                </div>

                <!-- Botón eliminar orden -->
                <UButton
                  size="xs"
                  variant="ghost"
                  color="error"
                  icon="i-lucide-x"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeOrderFromStop(o.dispatch_order_id)"
                />
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <UAlert v-if="saved" color="success" icon="i-lucide-check">
      Guardado correctamente
    </UAlert>
  </div>
</template>
