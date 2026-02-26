import type { H3Event } from 'h3'
import type { FetchOptions } from 'ofetch'

type HTTPMethod =
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'CONNECT'
  | 'OPTIONS'
  | 'TRACE'
  | 'get'
  | 'head'
  | 'patch'
  | 'post'
  | 'put'
  | 'delete'
  | 'connect'
  | 'options'
  | 'trace'

type RefreshResponse = {
  access_token: string
}

export async function apiProxy(
  event: H3Event,
  path: string,
  options: {
    method?: HTTPMethod
    body?: any
  } = {}
) {
  const config = useRuntimeConfig()

  const accessToken = getCookie(event, 'api_token')
  const refreshToken = getCookie(event, 'refresh_token')

  const method = (options.method ?? 'GET') as HTTPMethod

  try {
    return await $fetch(`${config.apiBase}${path}`, {
      method,
      body: options.body,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    })
  } catch (error: any) {
    if (error?.response?.status === 401 && refreshToken) {
      const refreshRes = await $fetch<RefreshResponse>(
        `${config.apiBase}/auth/refresh`,
        {
          method: 'POST',
          body: { refreshToken }
        }
      )

      setCookie(event, 'api_token', refreshRes.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      })

      return await $fetch(`${config.apiBase}${path}`, {
        method,
        body: options.body,
        headers: {
          Authorization: `Bearer ${refreshRes.access_token}`
        }
      })
    }

    throw error
  }
}
