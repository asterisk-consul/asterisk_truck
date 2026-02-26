<script setup lang="ts">
import { useDepositosStore } from '@/stores/logistica/warehouse/depositos.store'
const store = useDepositosStore()
const router = useRouter()

const handleSubmit = async (data: any) => {
  await store.createWarehouse(data)
  router.push('/logistica/warehouse')
}
</script>

<template>
  <div>
    <h1>Crear Warehouse</h1>

    <WarehouseForm mode="create" @submit="handleSubmit" />
  </div>
</template>
