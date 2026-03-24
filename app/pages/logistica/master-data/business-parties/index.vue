<script setup lang="ts">
definePageMeta({
  layout: 'logistica',
  middleware: ['auth']
})
import { useBusinessPartiesStore } from '~/modulos/logistica/master-data/bussiness-parties/bussines-parties.store'
import { BusinessPartyColumns } from '~/modulos/logistica/master-data/bussiness-parties/columns'
import LogisticaTable from '~/components/Tablas/LogisticaTable.vue'

const moduleCollapsed = inject('moduleSidebarCollapsed') as Ref<boolean>
import type { ButtonProps } from '@nuxt/ui'
function toggleModuleSidebar() {
  moduleCollapsed.value = !moduleCollapsed.value
}

const store = useBusinessPartiesStore()
const router = useRouter()
const { items } = storeToRefs(store)

const loading = ref(true)

onMounted(async () => {
<<<<<<< HEAD
  await store.fetchAll('21f611eb-1f24-4a85-9b82-efc5ba78ef71')
  console.log(store.items)
  loading.value = store.loading
})

const saveLocation = async (data: any) => {
  const payload = {
    company_id: '21f611eb-1f24-4a85-9b82-efc5ba78ef71',
    type: data.type,
    name: data.name,
    tax_id: data.tax_id,
    phone: String(data.phone),
    email: data.email,
    active: true
  }

  await store.create(payload)
  await store.fetchAll('21f611eb-1f24-4a85-9b82-efc5ba78ef71')
  open.value = false
=======
  await store.fetchAll('a060f7ff-0281-4df4-b5b3-cbdf940be31e')
  loading.value = store.loading
})

const openCreate = () => {
  router.push('/logistica/master-data/business-parties/create')
>>>>>>> main
}

const openEdit = (row: any) => {
  router.push(`/logistica/master-data/business-parties/${row.id}/edit`)
}
const columns = BusinessPartyColumns({
  onEdit: openEdit
})

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
</template>
