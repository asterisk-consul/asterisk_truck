import type { ApiLoginResponse } from '@/types/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const api = await $fetch<ApiLoginResponse>(`${config.apiBase}/auth/login`, {
    method: 'POST',
    body
  })

  // ✅ camelCase — como los devuelve tu backend
  setCookie(event, 'api_access', api.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 40
  })

  setCookie(event, 'api_refresh', api.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })

  return { user: api.user }
})
