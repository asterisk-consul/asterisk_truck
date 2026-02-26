export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'api2_token')

  return await $fetch(`${config.apiBase2}/companies`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  })
})
