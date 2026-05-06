<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { storeToRefs } from 'pinia'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'

//stores
import { useVehiclesStore } from '~/modulos/logistica/transport/vehicles/store/vehicles.store'
import { useVehicleCombinationsStore } from '~/modulos/logistica/transport/vehicles-combinations/vehicle-combinations.store'
import { useChoferesStore } from '~/modulos/logistica/transport/drivers/choferes.store'
import { useAuthStore } from '~/modulos/auth/auth.store'
//form
import { vehicleCombinationsFormFields } from '~/modulos/logistica/transport/vehicles-combinations/vehicleCombinationsForm'
import ModalForm from '~/components/ModalForm.vue'
//composables

import { useDriverMetrics } from '~/modulos/logistica/transport/drivers/useDriverMetrics'
import { useVehicles } from '~/modulos/logistica/transport/vehicles/composable/useVehicles'
//tabla columns
import { VehicleCombinationColumns } from '~/modulos/logistica/transport/vehicles-combinations/columns'
import type {
  VehicleCombination,
  UpdateVehicleCombinationInput
} from '~/modulos/logistica/transport/vehicles-combinations/types/vehicles-combinations.types'

const moduleCollapsed = inject('moduleSidebarCollapsed') as Ref<boolean>
import type { ButtonProps } from '@nuxt/ui'
function toggleModuleSidebar() {
  moduleCollapsed.value = !moduleCollapsed.value
}

type EditableField = 'unit_number'
type EditableValue = string | null | undefined

const toast = useToast()
const loading = ref(true)
const store = useVehicleCombinationsStore()
const vehiculoStore = useVehiclesStore()
const choferStore = useChoferesStore()
const authStore = useAuthStore()

const { items } = storeToRefs(store)
const { items: vehicles } = storeToRefs(vehiculoStore)
const { drivers } = storeToRefs(choferStore)

const { tractorOptions, trailerOptions } = useVehicles(vehicles)
const { items: driverItems } = useDriverMetrics(drivers)
const router = useRouter()

/* ---------------------------------------
   MODAL CONTROL
--------------------------------------- */

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingRow = ref<any>(null)

function openCreate() {
  router.push('/logistica/vehicles-combinations/create')
}

function openEdit(row: VehicleCombination) {
  router.push(`/logistica/vehicles-combinations/${row.id}/edit`)
}
/* ---------------------------------------
   TABLE COLUMNS
--------------------------------------- */

const columns = VehicleCombinationColumns({
  onEdit: openEdit,
  onInlineSave: async (
    row: VehicleCombination,
    field: EditableField,
    value: EditableValue
  ) => {
    const prev = row[field]
    row[field] = value ?? ''

    try {
      // Preparar el payload dinámico
      const updateData = {
        [field]: value ?? undefined
      } as UpdateVehicleCombinationInput

      // Llamada al store/backend
      await store.update(row.id, updateData)

      // Mostrar toast de éxito
      toast.add({
        title: 'Guardado',
        description: `El ${field} se actualizó correctamente`,
        color: 'success'
      })
    } catch (err: any) {
      // Revertir valor al anterior
      row[field] = prev

      // Tomar mensaje del backend si existe
      const backendMessage =
        err?.response?.data?.message || `No se pudo actualizar el ${field}`

      // Mostrar toast de error
      toast.add({
        title: 'Error',
        description: backendMessage,
        color: 'error'
      })
    }
  },
  async onToggleActive(row: VehicleCombination, validUntil: string | null) {
    const isActive = validUntil === null // null = activo, string = histórico
    try {
      if (isActive) {
        await store.activate(row.id)
        toast.add({
          title: 'Reactivado',
          description: 'La combinación ahora está activa',
          color: 'success'
        })
      } else {
        await store.finish(row.id)
        toast.add({
          title: 'Finalizado',
          description: 'La combinación ahora es histórica',
          color: 'success'
        })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'No se pudo cambiar el estado'
      toast.add({ title: 'Error', description: msg, color: 'error' })
    } finally {
      await store.fetchAll()
    }
  }
})

// ========================================
// COMPUTED
// ========================================

const fields = computed(() =>
  vehicleCombinationsFormFields.map((field) => {
    if (field.name === 'tractor_id') {
      return { ...field, options: tractorOptions.value }
    }
    if (field.name === 'trailer_id') {
      return { ...field, options: trailerOptions.value }
    }
    if (field.name === 'driver_id') {
      return { ...field, options: driverItems.value }
    }
    return field
  })
)

// ========================================
// HOOKS
// ========================================
console.log(store.items)

onMounted(async () => {
  await store.fetchAll()
  await vehiculoStore.fetchAll()
  await choferStore.fetchAll()
  await authStore.fetchMe()
  console.log('ITEMS RAW:', store.items)
  loading.value = store.loading
})

// ========================================
// ACTIONS
// ========================================

async function handleSubmit(data: any) {
  const { id, ...rest } = data

  const payloadBase = {
    ...rest
  }

  try {
    if (modalMode.value === 'create') {
      console.log('Create payload:', payloadBase)
      await store.create(payloadBase)

      toast.add({
        title: 'Creado',
        description: `La combinación se creó correctamente`,
        color: 'success'
      })
    } else {
      // Para update: eliminar campos undefined/null
      const payload: Partial<UpdateVehicleCombinationInput> = {}
      for (const key in payloadBase) {
        if (payloadBase[key] !== undefined && payloadBase[key] !== null) {
          payload[key as keyof UpdateVehicleCombinationInput] = payloadBase[key]
        }
      }

      console.log('Update payload:', payload)
      await store.update(editingRow.value.id, payload)

      toast.add({
        title: 'Actualizado',
        description: `La combinación se actualizó correctamente`,
        color: 'success'
      })
    }

    modalOpen.value = false
  } catch (err: any) {
    // Mostrar mensaje del backend si existe
    const backendMessage =
      err?.response?.data?.message ||
      'Ocurrió un error al guardar la combinación'

    toast.add({
      title: 'Error',
      description: backendMessage,
      color: 'error'
    })
  }
}
// ========================================
// MAP PAYLOAD
// ========================================
const links = ref<ButtonProps[]>([
  {
    label: 'Nueva Unidad',
    icon: 'i-heroicons-plus',
    onClick: openCreate,
    color: 'primary',
    variant: 'solid'
  }
])
</script>

<template>
  <UPage class="space-y-4">
    <div class="flex flex-col">
      <div>
        <UButton
          icon="i-lucide-layout-panel-left"
          variant="ghost"
          color="neutral"
          label="Menu"
          @click="toggleModuleSidebar"
        />
      </div>
      <UPageHeader
        title="Unidades"
        description="Listado de Unidades"
        :links="links"
        class="mb-4 w-full"
      />
    </div>
    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </UPage>
</template>
