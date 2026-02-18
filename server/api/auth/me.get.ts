export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const token2 = getCookie(event, 'api2_token')
  if (!token2) {
    throw createError({ statusCode: 401 })
  }

  // Backend 2 es la fuente de verdad
  const me = await $fetch(`${config.public.apiBase2}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token2}`
    }
  })

  return {
    id: me.id,
    username: me.username,
    roles: me.roles
  }
})
