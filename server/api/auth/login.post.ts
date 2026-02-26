import type { ApiLoginResponse } from '@/types/auth-api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const api = await $fetch<ApiLoginResponse>(
    `${config.public.apiBase}/auth/login`,
    {
      method: 'POST',
      body
    }
  )

  // 🔐 Access token (corto)
  setCookie(event, 'api_access', api.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15 // 15 min
  })

  // 🔁 Refresh token (largo)
  setCookie(event, 'api_refresh', api.refresh_token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 días
  })

  return { user: api.user }
})
