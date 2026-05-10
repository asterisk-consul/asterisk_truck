<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

import SalesDocumentForm from '~/modulos/erp/facturas/components/FacturaForm.vue'
import { DocumentsSalesService } from '~/modulos/erp/sales/services/sales.service'

const { mainCollapsed } = useSidebarState()
const router = useRouter()
const toast = useToast()

const saving = ref(false)
const formRef = ref<InstanceType<typeof SalesDocumentForm> | null>(null)

async function handleSubmit(payload: any) {
  try {
    saving.value = true
    console.log('payload', payload)
    const created = await DocumentsSalesService.create(payload)
    toast.add({ title: 'Factura creada', color: 'success' })
    router.push(`/erp/sales/${created.id}`)
  } catch (e: any) {
    console.log('BACKEND ERROR')
    console.log(e?.data)
    console.log(e)
    toast.add({
      title: 'Error al crear factura',
      description: e?.data?.message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Nueva Factura">
        <template #leading>
          <UButton
            icon="i-lucide-panel-left-close"
            variant="ghost"
            color="neutral"
            @click="mainCollapsed = !mainCollapsed"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPage>
        <UPageHeader
          title="Crear Factura"
          description="Completá los datos y agregá los productos"
          :links="[
            {
              label: 'Guardar Factura',
              icon: 'i-lucide-check',
              loading: saving,
              onClick: () => formRef?.submit()
            }
          ]"
        />

        <UPageBody>
          <SalesDocumentForm
            ref="formRef"
            :loading="saving"
            @submit="handleSubmit"
          />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>
