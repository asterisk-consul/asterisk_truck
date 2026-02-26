export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'api2_token')
  const { warehouseId } = event.context.params!

  return await $fetch(
    `${config.public.apiBase2}/warehouse/stock/${warehouseId}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    }
  )
})
