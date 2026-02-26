<script setup lang="ts">
import { useDepositosStore } from '@/stores/logistica/warehouse/depositos.store'
const store = useDepositosStore()

onMounted(async () => {
  await store.fetchAll()
  console.log('warehouses', store.warehouses)
})
</script>

<template>
  <div>
    <h1>Warehouses</h1>

    <div v-if="store.loading">Cargando...</div>

    <table v-else>
      <tr v-for="w in store.warehouses" :key="w.id">
        <td>{{ w.name }}</td>
        <td>
          <button @click="store.deleteWarehouse(w.id)">Eliminar</button>
        </td>
      </tr>
    </table>
  </div>
</template>
