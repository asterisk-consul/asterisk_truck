export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'api2_token')
  const query = getQuery(event)

  return await $fetch(`${config.apiBase2}/master-data/products`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    query
  })
})
