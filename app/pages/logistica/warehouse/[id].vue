<script setup lang="ts">
import { useDepositosStore } from '@/stores/logistica/warehouse/depositos.store'
const store = useDepositosStore()
const route = useRoute()
const router = useRouter()

await store.fetchById(route.params.id as string)

const handleSubmit = async (data: any) => {
  await store.updateWarehouse(route.params.id as string, data)
  router.push('/logistica/warehouse')
}
</script>

<template>
  <div v-if="store.current">
    <h1>Editar Warehouse</h1>

    <WarehouseForm
      mode="edit"
      :model-value="store.current"
      @submit="handleSubmit"
    />
  </div>
</template>
