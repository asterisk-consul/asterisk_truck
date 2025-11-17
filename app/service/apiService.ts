// composables/apiService.ts
import { useRuntimeConfig } from '#app'

let token: string | null = null

// Configurar baseURL desde runtimeConfig o hardcode
const API_BASE = 'https://api.flowsma.com/donandres'

export function setToken(newToken: string | null) {
  token = newToken
}

// Función para hacer GET
export async function fetchData<T>(endpoint: string) {
  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const data = await $fetch<T>(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers
    })
    return data
  } catch (error) {
    console.error('❌ fetchData error:', error)
    throw error
  }
}

// Función para hacer POST
export async function postData<
  T,
  B extends Record<string, any> = Record<string, any>
>(endpoint: string, body: B) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  try {
    let statusCode = 0

    const data = await $fetch<T>(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body,
      onResponse({ response }) {
        statusCode = response.status
      }
    })

    return { data, status: statusCode }
  } catch (error: any) {
    let statusCode = error?.response?.status ?? 0
    throw { error, status: statusCode }
  }
}

// Login service
export async function loginService(username: string, password: string) {
  return $fetch<{
    access_token: string
    expires_in?: number
    id: number
    perfilid: number
    username: string
    roles: string[]
  }>(`${API_BASE}/api/login`, {
    method: 'POST',
    body: { username, password }
  })
}
