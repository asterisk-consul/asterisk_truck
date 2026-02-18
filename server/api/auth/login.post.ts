import type { ApiLoginResponse, Api1LoginResponse } from '@/types/auth-api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  // Backend 1 (legacy)
  const api1 = await $fetch<Api1LoginResponse>(
    `${config.public.apiBase1}/api/login`,
    {
      method: 'POST',
      body
    }
  )

  // Backend 2 (auth real)
  const api2 = await $fetch<ApiLoginResponse>(
    `${config.public.apiBase2}/auth/login`,
    {
      method: 'POST',
      body
    }
  )

  // Cookies httpOnly
  setCookie(event, 'api1_token', api1.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  })

  setCookie(event, 'api2_token', api2.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  })

  return {
    user: {
      id: api2.id,
      username: api2.username,
      roles: api2.roles
    }
  }
})
