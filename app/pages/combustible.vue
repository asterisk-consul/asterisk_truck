<script setup lang="ts">
import FormsubirCombustible from '~/components/combustible/FormsubirCombustible.vue'
import SubirCsv from '~/components/combustible/SubirCsv.vue'
import CisternaMedida from '~/components/combustible/CisternaMedida.vue'

const open = ref(false)
const openCsv = ref(false)
</script>

<template>
  <UDashboardPanel id="combustible">
    <template #header>
      <UDashboardNavbar title="Combustible">
        <template #right>
          <UButton
            icon="i-lucide-upload"
            label="Subir archivo"
            @click="openCsv = true"
          />
          <UButton
            icon="i-lucide-plus"
            label="Registrar movimiento"
            @click="open = true"
            color="warning"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <CisternaMedida />
      <FormsubirCombustible v-model="open" />
      <SubirCsv v-model="openCsv" />
    </template>
  </UDashboardPanel>
</template>
