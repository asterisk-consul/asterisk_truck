let token: string | null = null

export function setToken(newToken: string | null) {
  token = newToken
}

export async function fetchData<T>(endpoint: string) {
  const config = useRuntimeConfig()

  const headers: HeadersInit = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  return await $fetch<T>(`${config.public.apiBase}${endpoint}`, { headers })
}

export async function postData<T>(endpoint: string, body: any) {
  const config = useRuntimeConfig()

  const headers: Record<string, string> = {}

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let status = 0

  const data = await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
    method: 'POST',
    headers,
    body,
    onResponse({ response }) {
      status = response.status
    }
  })

  return { data, status }
}

export async function loginService(username: string, password: string) {
  const config = useRuntimeConfig()

  return $fetch(`${config.public.apiBase}/api/login`, {
    method: 'POST',
    body: { username, password }
  })
}
