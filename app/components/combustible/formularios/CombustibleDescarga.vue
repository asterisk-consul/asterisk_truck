<script setup lang="ts">
import DataPicker from '@/components/ui/DataPicker.vue'
import SelectPefiles from '@/components/ui/SelectPefiles.vue'

const model = defineModel<any>()

const estaciones = [
  { label: 'PETROLERA SUQUIA SRL', value: 'PETROLERA SUQUIA SRL' },
  { label: 'POSTA DEL MERCOSUR SRL', value: 'POSTA DEL MERCOSUR SRL' }
]
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <SelectPefiles
      v-model="model.cargadorId"
      :tipo="4"
      :categoriaid="11090"
      label="Responsable"
    />

    <USelect v-model="model.estacion" :items="estaciones" label="Estación" />

    <DataPicker v-model="model.fecha" label="Fecha" />

    <UInput
      v-model="model.litros"
      type="number"
      label="Litros descargados"
      class="col-span-2"
    />
  </div>
</template>
