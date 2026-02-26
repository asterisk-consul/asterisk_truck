export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { id } = event.context.params!
  const body = await readBody(event)
  const token = getCookie(event, 'api2_token')

  return await $fetch(`${config.apiBase2}/master-data/products/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    method: 'PATCH',
    body
  })
})
