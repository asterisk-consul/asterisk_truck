// server/api/logistica/transport/trips/[id].patch.ts

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { id } = event.context.params!
  const token = getCookie(event, 'api2_token')
  const body = await readBody(event)

  // body.action = 'start' | 'complete'

  return await $fetch(
    `${config.public.apiBase2}/transport/trips/${id}/${body.action}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      },
      method: 'PATCH'
    }
  )
})
