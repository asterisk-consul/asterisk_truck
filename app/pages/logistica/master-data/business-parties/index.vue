<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { useBusinessPartiesStore } from '~/modulos/logistica/master-data/bussiness-parties/bussines-parties.store'
import { businessPartyFormFields } from '~/modulos/logistica/master-data/bussiness-parties/businessPartyFormFields'
import { BusinessPartyColumns } from '~/modulos/logistica/master-data/bussiness-parties/columns'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'

const moduleCollapsed = inject('moduleSidebarCollapsed') as Ref<boolean>
import type { ButtonProps } from '@nuxt/ui'
function toggleModuleSidebar() {
  moduleCollapsed.value = !moduleCollapsed.value
}

const store = useBusinessPartiesStore()

const { items } = storeToRefs(store)
const open = ref(false)
const loading = ref(true)

onMounted(async () => {
  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  console.log(store.items)
  loading.value = store.loading
})

const saveLocation = async (data: any) => {
  const payload = {
    company_id: 'a060f7ff-0281-4df4-b5b3-cbdf940be31e',
    type: data.type,
    name: data.name,
    tax_id: data.tax_id,
    phone: String(data.phone),
    email: data.email,
    active: true
  }

  await store.create(payload)
  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  open.value = false
}
const links: ButtonProps[] = [
  {
    label: 'Nueva Parte Interesada',
    icon: 'i-heroicons-plus',
    color: 'primary',
    variant: 'solid',
    onClick: openCreate
  }
]
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
        title="Partes Interesadas"
        description="Listado de Partes Interesadas"
        :links="links"
        class="mb-4 w-full"
      />
    </div>

    <LogisticaTable :loading="loading" :data="items" :columns="columns" />
  </UPage>
  <ModalForm
    v-model:open="open"
    :fields="businessPartyFormFields"
    title="Nueva Locacion"
    @submit="saveLocation"
  />
</template>
