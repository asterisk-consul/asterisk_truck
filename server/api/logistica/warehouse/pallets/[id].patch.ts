export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { id } = event.context.params!
  const body = await readBody(event)
  const token = getCookie(event, 'api2_token')

  return await $fetch(`${config.public.apiBase2}/warehouse/pallets/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    method: 'PATCH',
    body
  })
})
