<script setup lang="ts">
import type {
  VehicleCombination,
  UpdateVehicleCombinationInput
} from '~/modulos/logistica/transport/vehicles-combinations/types/vehicles-combinations.types'
import { parseDate, today, getLocalTimeZone } from '@internationalized/date'
import type { CalendarDate } from '@internationalized/date'
import {
  mapVehicleCombinationToForm,
  mapVehicleCombinationFormToDto,
  type VehicleCombinationForm
} from '~/modulos/logistica/transport/vehicles-combinations/mappers/vehicle-combinations.mapper'

import type { SelectMenuItem } from '~/modulos/logistica/transport/corridors/composables/useCorridors'

import { useVehiclesStore } from '~/modulos/logistica/transport/vehicles/store/vehicles.store'
import { useChoferesStore } from '~/modulos/logistica/transport/drivers/choferes.store'
import { useVehicleCombinationsStore } from '~/modulos/logistica/transport/vehicles-combinations/vehicle-combinations.store'

// composables
import { useVehicles } from '~/modulos/logistica/transport/vehicles/composable/useVehicles'
import { useDriverMetrics } from '~/modulos/logistica/transport/drivers/useDriverMetrics'

const inputDateFrom = useTemplateRef('inputDateFrom')
const inputDateUntil = useTemplateRef('inputDateUntil')

const props = defineProps<{
  vehicleCombination?: VehicleCombination
}>()

const emit = defineEmits<{
  submit: [data: UpdateVehicleCombinationInput]
  cancel: []
}>()

const isEdit = computed(() => !!props.vehicleCombination)
/**
 * STORE
 */
const store = useVehiclesStore()
const choferStore = useChoferesStore()
const { items: vehicles } = storeToRefs(store)
const { drivers } = storeToRefs(choferStore)
const combinationsStore = useVehicleCombinationsStore()
const { items: combinations } = storeToRefs(combinationsStore)

/**
 * COMPOSABLES
 */
const {
  availableTractorOptions: tractorOptions,
  availableTrailerOptions: trailerOptions
} = useVehicles(vehicles, combinations)
const { items: driverItems } = useDriverMetrics(drivers)

/**
 * FORM
 */
const form = reactive<VehicleCombinationForm>({
  id: '',
  unit_number: '',
  tractor_id: '',
  trailer_id: '',
  driver_id: '',
  valid_from: today(getLocalTimeZone()).toString(),
  valid_until: ''
})

/**
 * Hidratación en modo edición
 */
watch(
  () => props.vehicleCombination,
  (vehicleCombination) => {
    if (!vehicleCombination) return
    Object.assign(form, mapVehicleCombinationToForm(vehicleCombination))
  },
  { immediate: true }
)

const validFromDate = computed({
  get: () => {
    if (form.valid_from) return parseDate(form.valid_from)
    return today(getLocalTimeZone()) // 👈 default a hoy si está vacío
  },
  set: (val: CalendarDate | null | undefined) => {
    form.valid_from = val ? val.toString() : ''
  }
})

const validUntilDate = computed({
  get: () => (form.valid_until ? parseDate(form.valid_until) : undefined),
  set: (val: CalendarDate | null | undefined) => {
    form.valid_until = val ? val.toString() : ''
  }
})
/**
 * Submit
 */
const submit = () => {
  emit('submit', mapVehicleCombinationFormToDto(form))
}
</script>

<template>
  <UForm @submit="submit" class="space-y-6">
    <UCard :ui="{ body: 'grid grid-cols-2 gap-4' }">
      <!-- N° Unidad -->
      <UFormField label="N° Unidad">
        <UInput
          v-model="form.unit_number"
          placeholder="INT-001"
          class="w-full"
        />
      </UFormField>

      <!-- Tractor -->
      <UFormField label="Tractor">
        <USelectMenu
          :model-value="tractorOptions.find((t) => t.value === form.tractor_id)"
          :items="tractorOptions"
          placeholder="Seleccionar tractor"
          option-attribute="label"
          value-attribute="value"
          class="w-full"
          clear
          @update:model-value="
            (item: SelectMenuItem | null) =>
              (form.tractor_id = item?.value ?? '')
          "
        />
      </UFormField>

      <!-- Trailer -->
      <UFormField label="Trailer">
        <USelectMenu
          :model-value="trailerOptions.find((t) => t.value === form.trailer_id)"
          :items="trailerOptions"
          placeholder="Seleccionar trailer"
          option-attribute="label"
          value-attribute="value"
          class="w-full"
          clear
          @update:model-value="
            (item: SelectMenuItem | null) =>
              (form.trailer_id = item?.value ?? '')
          "
        />
      </UFormField>

      <!-- Chofer -->
      <UFormField label="Chofer">
        <USelectMenu
          :model-value="driverItems.find((d) => d.value === form.driver_id)"
          :items="driverItems"
          placeholder="Seleccionar chofer"
          option-attribute="label"
          value-attribute="value"
          class="w-full"
          clear
          @update:model-value="
            (item: SelectMenuItem | null) =>
              (form.driver_id = item?.value ?? '')
          "
        />
      </UFormField>

      <!-- Válido desde -->
      <UFormField label="Válido desde">
        <UInputDate ref="inputDateFrom" v-model="validFromDate" class="w-full">
          <template #trailing>
            <UPopover :reference="inputDateFrom?.inputsRef[3]?.$el">
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="Seleccionar fecha"
                class="px-0"
              />
              <template #content>
                <UCalendar v-model="validFromDate" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </UFormField>

      <!-- Válido hasta -->
      <UFormField label="Válido hasta">
        <UInputDate
          ref="inputDateUntil"
          v-model="validUntilDate"
          class="w-full"
        >
          <template #trailing>
            <UPopover :reference="inputDateUntil?.inputsRef[3]?.$el">
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-calendar"
                aria-label="Seleccionar fecha"
                class="px-0"
              />
              <template #content>
                <UCalendar v-model="validUntilDate" class="p-2" />
              </template>
            </UPopover>
          </template>
        </UInputDate>
      </UFormField>
    </UCard>

    <!-- Actions -->
    <div class="flex justify-end gap-2">
      <UButton variant="ghost" @click="emit('cancel')">Cancelar</UButton>
      <UButton type="submit">
        {{ isEdit ? 'Guardar cambios' : 'Crear combinación' }}
      </UButton>
    </div>
  </UForm>
</template>
