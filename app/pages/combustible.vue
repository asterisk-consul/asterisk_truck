<script setup lang="ts">
import FormsubirCombustible from '~/components/combustible/FormsubirCombustible.vue'
import SubirCsv from '~/components/combustible/SubirCsv.vue'
import CisternaMedida from '~/components/combustible/CisternaMedida.vue'
import TablaList from '~/components/Tablas/TablaList.vue'
import { useArticulos } from '~/composables/articulos/useArticulos'

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
    icon: 'i-lucide-soap-dispenser-droplet'
  }
]

const {
  articulo: articuloCombustible,
  totalCantidad: totalCantidadCombustible
} = useArticulos(1189)

const paramsCombustible = ref(
  buildRegistroParams({
    statusid: 1640,
    flowid: 10987
  })
)

const paramsUrea = ref(
  buildRegistroParams({
    statusid: 1719,
    flowid: 10987
  })
)

const { data: dataCombustible, loading: loadingCombustible } =
  useRegistroCabList(paramsCombustible)

const { data: dataUrea, loading: loadingUrea } = useRegistroCabList(paramsUrea)

onMounted(() => {
  console.log(totalCantidadCombustible.value)
})
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
      <UTabs color="neutral" variant="link" :items="items">
        <template #combustibles>
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
          <CisternaMedida
            :total-litros="5000"
            :litros-actuales="totalCantidadCombustible"
          />
          <TablaList
            :data="dataCombustible"
            :loading="loadingCombustible"
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
        <template #urea>
          <UDashboardNavbar title="Urea">
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
          <CisternaMedida :total-litros="5000" :litros-actuales="3500" />
          <TablaList
            :data="dataUrea"
            :loading="loadingUrea"
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
      </UTabs>
    </template>
  </UDashboardPanel>
</template>
