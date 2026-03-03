<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChoferesStore } from '@/stores/logistica/transport/choferes.store'
import { useDriverMetrics } from '~/composables/logistica/useDriverMetrics'
import type { CreateDriverInput } from '@/types/logistica/transport/drivers'

import { driverFormFields } from '~/form/driverFormFields'

import ModalForm from '~/components/ModalForm.vue'
import { columns } from './columns'

definePageMeta({
  layout: 'logistica'
})

const loading = ref(true)
const store = useChoferesStore()
const { drivers } = storeToRefs(store)
const metrics = useDriverMetrics(drivers)

const open = ref(false)

onMounted(async () => {
  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  loading.value = store.loading
})

function saveDriver(data: any) {
  const payload: CreateDriverInput = {
    companyId: 'a060f7ff-0281-4df4-b5b3-cbdf940be31e',
    firstName: data.first_name,
    lastName: data.last_name,
    document: data.document || null,
    phone: data.phone || null,
    licenseNumber: data.license_number || null,
    licenseExpiration: data.license_expiration || null
  }

  store.createDriver(payload)
  open.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-row items-center justify-between">
      <h3>Choferes</h3>
      <UButton icon="i-heroicons-plus" @click="open = true">
        Nuevo Chofer
      </UButton>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <UCard>
        <div class="text-center">
          <p class="text-xs text-gray-500">Total Choferes</p>
          <p class="text-2xl font-bold">{{ metrics.total }}</p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-xs text-gray-500">Activos</p>
          <p class="text-2xl font-bold text-green-600">
            {{ metrics.active }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-xs text-gray-500">Inactivos</p>
          <p class="text-2xl font-bold text-gray-500">
            {{ metrics.inactive }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-xs text-gray-500">Lic. Vencidas</p>
          <p class="text-2xl font-bold text-red-600">
            {{ metrics.licenseExpired }}
          </p>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <p class="text-xs text-gray-500">Por vencer</p>
          <p class="text-2xl font-bold text-yellow-500">
            {{ metrics.licenseExpiring }}
          </p>
        </div>
      </UCard>
    </div>
    <UTable
      :loading="loading"
      sticky
      :data="drivers"
      :columns="columns"
      class="border border-default rounded-lg"
    />
  </div>
  <ModalForm
    v-model:open="open"
    :fields="driverFormFields"
    title="Nuevo Chofer"
    @submit="saveDriver"
  />
</template>
