<script setup lang="ts">
import FormsubirCombustible from '~/components/combustible/FormsubirCombustible.vue'
import SubirCsv from '~/components/combustible/SubirCsv.vue'
import CisternaMedida from '~/components/combustible/CisternaMedida.vue'
import TablaList from '~/components/Tablas/TablaList.vue'

const open = ref(false)
const openCsv = ref(false)

const items = [
  {
    label: 'Combustibles',
    slot: 'combustibles',
    icon: 'i-lucide-fuel'
  },
  {
    label: 'Urea',
    slot: 'urea',
    icon: 'i-lucide-fertilizer'
  }
]

const params = ref(
  buildRegistroParams({
    statusid: 1640,
    flowid: 10987
  })
)

const { data, loading } = useRegistroCabList(params)
</script>

<template>
  <UDashboardPanel id="combustible">
    <template #header>
      <UDashboardNavbar title="Combustible">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
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
      <CisternaMedida />
      <TablaList
        :data="data"
        :loading="loading"
        selectable
        @selection-change="(rows) => console.log(rows)"
        :column-config="{
          fecha: { renderer: 'date' },
          creationdate: { renderer: 'date' },
          total: { renderer: 'number', align: 'right' },
          totalprecio: { renderer: 'currency', align: 'right' },
          totalimpuestos: { renderer: 'currency', align: 'right' }
        }"
      />
      <FormsubirCombustible v-model="open" />
      <SubirCsv v-model="openCsv" />
    </template>
  </UDashboardPanel>
</template>
