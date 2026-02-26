export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  type me = {
    id: number
    name: string
    email: string
    roles: string[]
  }

  const token2 = getCookie(event, 'api_token')
  if (!token2) {
    throw createError({ statusCode: 401 })
  }

  // Backend 2 es la fuente de verdad
  const me: me = await $fetch(`${config.public.apiBase2}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token2}`
    }
  })

  return {
    id: me.id,
    name: me.name,
    email: me.email,
    roles: me.roles
  }
})
