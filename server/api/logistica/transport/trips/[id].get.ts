export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'api2_token')
  const { id } = event.context.params!

  return await $fetch(`${config.public.apiBase2}/transport/trips/${id}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    },
    method: 'GET'
  })
})
