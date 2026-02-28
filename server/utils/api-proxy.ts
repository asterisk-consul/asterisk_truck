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
    query?: FetchOptions['query'] // 👈 NUEVO
  } = {}
) {
  const config = useRuntimeConfig()

  const accessToken = getCookie(event, 'api_access')
  const refreshToken = getCookie(event, 'api_refresh')

  const method = (options.method ?? 'GET') as HTTPMethod

  try {
    return await $fetch(`${config.apiBase}${path}`, {
      method,
      body: options.body,
      query: options.query, // 👈 PASAR QUERY
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

      setCookie(event, 'api_access', refreshRes.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
      })

      return await $fetch(`${config.apiBase}${path}`, {
        method,
        body: options.body,
        query: options.query, // 👈 TAMBIÉN AQUÍ
        headers: {
          Authorization: `Bearer ${refreshRes.access_token}`
        }
      })
    }

    throw error
  }
}
