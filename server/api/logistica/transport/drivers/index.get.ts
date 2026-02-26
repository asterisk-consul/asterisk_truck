// server/api/logistica/transport/drivers/index.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'api2_token')
  const query = getQuery(event) // lee ?companyId=xxx de la URL

  return await $fetch(`${config.apiBase2}/transport/drivers`, {
    query, // lo pasa directo al backend: ?companyId=xxx
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  })
})
