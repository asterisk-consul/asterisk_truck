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

import { useVehiclesStore } from '~/modulos/logistica/transport/vehicles/store/vehicles.store'
import { useChoferesStore } from '~/modulos/logistica/transport/drivers/choferes.store'
import { useVehicleCombinationsStore } from '~/modulos/logistica/transport/vehicles-combinations/vehicle-combinations.store'

import { useVehicles } from '~/modulos/logistica/transport/vehicles/composable/useVehicles'
import { useDriverMetrics } from '~/modulos/logistica/transport/drivers/useDriverMetrics'

const props = defineProps<{
  vehicleCombination?: VehicleCombination
}>()

const emit = defineEmits<{
  submit: [form: VehicleCombinationForm]
  cancel: []
}>()

const isEdit = computed(() => !!props.vehicleCombination)

/**
 * STORES
 */
const store = useVehiclesStore()
const choferStore = useChoferesStore()
const combinationsStore = useVehicleCombinationsStore()

const { items: vehicles } = storeToRefs(store)
const { drivers } = storeToRefs(choferStore)
const { items: combinations } = storeToRefs(combinationsStore)

/**
 * COMPOSABLES
 */
const {
  tractorOptions,
  trailerOptions,
  availableTractorOptions,
  availableTrailerOptions
} = useVehicles(
  vehicles,
  combinations,
  computed(() => props.vehicleCombination?.id)
)

const { items: driverItems } = useDriverMetrics(drivers)

/**
 * OPTIONS SEGÚN MODO
 */
const tractorOptionsFinal = computed(() =>
  isEdit.value ? tractorOptions.value : availableTractorOptions.value
)

const trailerOptionsFinal = computed(() =>
  isEdit.value ? trailerOptions.value : availableTrailerOptions.value
)

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
 * HIDRATACIÓN
 */
watch(
  [
    () => props.vehicleCombination,
    tractorOptionsFinal,
    trailerOptionsFinal,
    driverItems
  ],
  ([vehicleCombination]) => {
    console.log('watch fired', {
      vc: !!vehicleCombination,
      tractors: tractorOptionsFinal.value.length,
      trailers: trailerOptionsFinal.value.length,
      drivers: driverItems.value.length
    })

    if (!vehicleCombination) return
    if (!tractorOptionsFinal.value.length) return
    if (!trailerOptionsFinal.value.length) return
    if (!driverItems.value.length) return

    Object.assign(form, mapVehicleCombinationToForm(vehicleCombination))
    console.log('form hydrated', { ...form })
  },
  { immediate: true }
)
/**
 * SELECT MODELS
 */
const selectedTractor = computed({
  get: () =>
    tractorOptionsFinal.value.find((t) => t.value === form.tractor_id) ?? null,
  set: (item) => {
    form.tractor_id = item?.value ?? ''
  }
})

const selectedTrailer = computed({
  get: () =>
    trailerOptionsFinal.value.find((t) => t.value === form.trailer_id) ?? null,
  set: (item) => {
    form.trailer_id = item?.value ?? ''
  }
})

const selectedDriver = computed({
  get: () => driverItems.value.find((d) => d.value === form.driver_id) ?? null,
  set: (item) => {
    form.driver_id = item?.value ?? ''
  }
})

/**
 * FECHAS
 */
const validFromDate = computed({
  get: () =>
    form.valid_from ? parseDate(form.valid_from) : today(getLocalTimeZone()),
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
 * SUBMIT
 */
const submit = () => {
  emit('submit', form)
}
</script>
<template>
  <UForm @submit="submit" class="space-y-6">
    <UCard :ui="{ body: 'grid grid-cols-2 gap-4' }">
      <UFormField label="N° Unidad">
        <UInput v-model="form.unit_number" class="w-full" />
      </UFormField>

      <!-- Tractor -->
      <UFormField label="Tractor">
        <USelectMenu
          v-model="selectedTractor"
          :items="tractorOptionsFinal"
          option-attribute="label"
          value-attribute="value"
          class="w-full"
          clear
        />
      </UFormField>

      <!-- Trailer -->
      <UFormField label="Trailer">
        <USelectMenu
          v-model="selectedTrailer"
          :items="trailerOptionsFinal"
          option-attribute="label"
          value-attribute="value"
          class="w-full"
          clear
        />
      </UFormField>

      <!-- Chofer -->
      <UFormField label="Chofer">
        <USelectMenu
          v-model="selectedDriver"
          :items="driverItems"
          option-attribute="label"
          value-attribute="value"
          class="w-full"
          clear
        />
      </UFormField>

      <!-- Fecha desde -->
      <UFormField label="Válido desde">
        <UInputDate v-model="validFromDate" class="w-full" />
      </UFormField>

      <!-- Fecha hasta -->
      <UFormField label="Válido hasta">
        <UInputDate v-model="validUntilDate" class="w-full" />
      </UFormField>
    </UCard>

    <div class="flex justify-end gap-2">
      <UButton variant="ghost" @click="emit('cancel')">Cancelar</UButton>
      <UButton type="submit">
        {{ isEdit ? 'Guardar cambios' : 'Crear combinación' }}
      </UButton>
    </div>
  </UForm>
</template>
