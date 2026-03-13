export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'api_refresh')

  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'No refresh token' })
  }

  const config = useRuntimeConfig()

  try {
    const api = await $fetch<{
      user: any
      accessToken: string
      refreshToken: string
    }>(`${config.apiBase}/auth/refresh`, {
      method: 'POST',
      body: { refreshToken }
    })

    // =========================
    // SET COOKIES
    // =========================

    setCookie(event, 'api_access', api.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 35
    })

    setCookie(event, 'api_refresh', api.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return {
      ok: true,
      user: api.user,
      accessToken: api.accessToken,
      refreshToken: api.refreshToken
    }
  } catch (e: any) {
    deleteCookie(event, 'api_access', { path: '/' })
    deleteCookie(event, 'api_refresh', { path: '/' })

    throw createError({
      statusCode: 401,
      message: 'Refresh failed'
    })
  }
})
