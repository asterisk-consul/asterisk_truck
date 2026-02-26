// server/api/logistica/transport/trips/[id].get.ts

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { id } = event.context.params!

  return await $fetch(`${config.public.apiBase2}/transport/trips/${id}`, {
    method: 'GET'
  })
})
