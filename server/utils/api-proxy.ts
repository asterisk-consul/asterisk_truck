// utils/apiProxy.ts
import type { H3Event } from 'h3'
import type { FetchOptions } from 'ofetch'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'

interface TokenCache {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCache>()
const refreshMutex = new Map<string, Promise<TokenCache | null>>()

const ACCESS_TOKEN_TTL_MS = 35_000

function getCachedTokens(refreshToken: string): TokenCache | null {
  const cached = tokenCache.get(refreshToken)
  if (!cached) return null
  if (Date.now() > cached.expiresAt) {
    tokenCache.delete(refreshToken)
    return null
  }
  return cached
}

export async function apiProxy(
  event: H3Event,
  path: string,
  options: {
    method?: HTTPMethod
    body?: any
    query?: FetchOptions['query']
  } = {}
) {
  const config = useRuntimeConfig()
  const method = options.method ?? 'GET'

  const refreshToken = getCookie(event, 'api_refresh')

  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'No autenticado' })
  }

  let tokens = getCachedTokens(refreshToken)
  let accessToken = tokens?.accessToken ?? getCookie(event, 'api_access')

  const doFetch = async (token?: string) => {
    return await $fetch(`${config.apiBase}${path}`, {
      method,
      body: options.body,
      query: options.query,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
  }

  if (accessToken) {
    try {
      return await doFetch(accessToken)
    } catch (err: any) {
      if (err?.response?.status !== 401) throw err
      tokenCache.delete(refreshToken)
    }
  }

  return await doRefreshAndRetry(event, refreshToken, doFetch)
}

async function doRefreshAndRetry(
  event: H3Event,
  refreshToken: string,
  doFetch: (token: string) => Promise<any>
) {
  // Si ya hay un refresh en curso, esperar su resultado
  if (refreshMutex.has(refreshToken)) {
    const tokens = await refreshMutex.get(refreshToken)!
    if (!tokens) {
      throw createError({ statusCode: 401, message: 'Sesión expirada' })
    }
    return await doFetch(tokens.accessToken)
  }

  // Iniciar refresh — nunca hace reject, siempre resuelve con null en caso de error
  let resolveRefresh!: (t: TokenCache | null) => void

  const refreshPromise = new Promise<TokenCache | null>((res) => {
    resolveRefresh = res
  })

  refreshMutex.set(refreshToken, refreshPromise)

  try {
    const cookieHeader = getRequestHeader(event, 'cookie') ?? ''

    const refreshRes: any = await $fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { cookie: cookieHeader }
    })

    const newAccessToken: string = refreshRes.accessToken
    const newRefreshToken: string = refreshRes.refreshToken ?? refreshToken

    if (!newAccessToken) throw new Error('Refresh sin accessToken')

    const cached: TokenCache = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS
    }

    tokenCache.set(refreshToken, cached)
    if (newRefreshToken !== refreshToken) {
      tokenCache.set(newRefreshToken, cached)
    }

    resolveRefresh(cached)

    return await doFetch(newAccessToken)
  } catch (error) {
    // Resolver con null en vez de rechazar → evita unhandledRejection
    resolveRefresh(null)
    throw createError({ statusCode: 401, message: 'Sesión expirada' })
  } finally {
    refreshMutex.delete(refreshToken)
  }
}
