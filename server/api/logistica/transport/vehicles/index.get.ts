export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'api2_token')
  const query = getQuery(event)

  return await $fetch(`${config.public.apiBase}/transport/vehicles`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    method: 'GET',
    query
  })
})
