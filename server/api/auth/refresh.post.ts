export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const refreshToken = getCookie(event, 'api_refresh')

  if (!refreshToken) {
    throw createError({ statusCode: 401 })
  }

  const api = await $fetch(`${config.public.apiBase}/auth/refresh`, {
    method: 'POST',
    body: { refreshToken }
  })

  setCookie(event, 'api_access', api.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15
  })

  setCookie(event, 'api_refresh', api.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return { user: api.user }
})
