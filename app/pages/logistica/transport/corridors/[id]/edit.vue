<script setup lang="ts">
import { useCorridorsStore } from '~/modulos/logistica/transport/corridors/corridors.store'
import type { CreateCorridorDto } from '~/modulos/logistica/transport/corridors/corridors.types'

const route = useRoute()
const router = useRouter()
const store = useCorridorsStore()

const id = route.params.id as string

await store.fetchCorridor(id)

const corridor = computed(() => store.currentCorridor)

const submit = async (dto: CreateCorridorDto) => {
  await store.updateCorridor(id, dto)
  router.push(`/corridors/${id}`)
}
</script>

<template>
  <UPage v-if="corridor">
    <UPageHeader title="Editar corredor" />
    <UCard>
      <CorridorForm
        :corridor="corridor"
        @submit="submit"
        @cancel="router.push(`/corridors/${id}`)"
      />
    </UCard>
  </UPage>
</template>
