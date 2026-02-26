export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'api2_token')
  const { id } = event.context.params!
  const body = await readBody(event)

  return await $fetch(`${config.apiBase2}/warehouses${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    method: 'PATCH',
    body
  })
})
