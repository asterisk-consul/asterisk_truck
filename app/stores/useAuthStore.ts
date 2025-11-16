import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { setToken, postData, loginService } from '../service/apiService'

export const useAuthStore = defineStore('auth', () => {
  // --- Cookies ---
  const credentialsCookie = useCookie<Credentials | null>('auth_credentials')
  const tokenCookie = useCookie<string | null>('auth_token')
  const tokenExpiryCookie = useCookie<number | null>('auth_token_expiry')
  const userDataCookie = useCookie<UserData | null>('auth_user_data')
  // --- Estado ---
  const credentials = reactive<Credentials>({
    username: credentialsCookie.value?.username || '',
    password: credentialsCookie.value?.password || '',
    saved: !!credentialsCookie.value
  })

  const token = ref<string | null>(tokenCookie.value || null)
  const tokenExpiry = ref<number | null>(tokenExpiryCookie.value || null)

  const userData = reactive<UserData>({
    id: userDataCookie.value?.id ?? null,
    perfilid: userDataCookie.value?.perfilid ?? null,
    username: userDataCookie.value?.username ?? null,
    roles: userDataCookie.value?.roles ?? []
  })


  const connectionStatus = reactive<ConnectionStatus>({})
  const batchConfig = reactive<BatchConfig>({
    tokenRefreshThreshold: 1200 // 20 minutos antes de expirar
  })

  const formParams = reactive<FormParams>({
    username: credentials.username,
    password: credentials.password,
  })

  // Restaurar token en Axios si hay token guardado y aún es válido
  if (token.value && tokenExpiry.value && tokenExpiry.value > Date.now()) {
    setToken(token.value)
  }

  // --- Guardar credenciales ---
  function saveCredentials(userCredentials: { username: string; password: string }) {
    credentials.username = userCredentials.username
    credentials.password = userCredentials.password
    credentials.saved = true

    formParams.username = userCredentials.username
    formParams.password = userCredentials.password

    credentialsCookie.value = { ...credentials }
  }

  // --- Guardar datos de usuario ---
  function saveUserData(data: UserData) {
    userData.id = data.id
    userData.perfilid = data.perfilid
    userData.username = data.username
    userData.roles = data.roles || []

    userDataCookie.value = { ...userData }
  }

  // --- Limpiar credenciales ---
  function clearCredentials() {
    credentials.username = ''
    credentials.password = ''
    credentials.saved = false

    token.value = null
    tokenExpiry.value = null

    userData.id = null
    userData.perfilid = null
    userData.username = null
    userData.roles = []

    // Limpiar cookies
    credentialsCookie.value = null
    tokenCookie.value = null
    tokenExpiryCookie.value = null
    userDataCookie.value = null

    setToken(null)
  }

  // --- Verifica si el token está por expirar ---
  function isTokenExpiring(): boolean {
    if (!tokenExpiry.value) return true
    const now = Date.now()
    const timeToExpiry = tokenExpiry.value - now
    const thresholdMs = batchConfig.tokenRefreshThreshold * 1000
    return timeToExpiry < thresholdMs
  }

  // --- Login ---
  async function login(username: string, password: string): Promise<LoginResponse> {
    if (!username || !password) throw new Error('Usuario y contraseña son requeridos')

    try {
      const data = await loginService(username, password) // <- directamente el response

      token.value = data.access_token
      tokenExpiry.value = Date.now() + (data.expires_in || 3600) * 1000
      tokenCookie.value = data.access_token
      tokenExpiryCookie.value = tokenExpiry.value

      saveUserData({
        id: data.id,
        perfilid: data.perfilid,
        username: data.username,
        roles: data.roles
      })

      setToken(data.access_token)
      return data
    } catch (error: unknown) {
      console.error('❌ Error en login:', error)
      throw error instanceof Error ? error : new Error(String(error))
    }
  }


  // --- Test de conexión ---
  async function testConnection() {
    try {
      const loginData = await login('Administrador', '1234')
      connectionStatus.success = true
      connectionStatus.message = 'Conexión exitosa - Token válido'
      connectionStatus.hasToken = !!loginData.access_token
      connectionStatus.userId = loginData.id
      connectionStatus.username = loginData.username
      connectionStatus.roles = loginData.roles
      connectionStatus.tokenExpiry = tokenExpiry.value
        ? new Date(tokenExpiry.value).toLocaleString()
        : null
      connectionStatus.timestamp = new Date().toLocaleString()
      console.log('✅', connectionStatus)
      return connectionStatus
    } catch (error: unknown) {
      connectionStatus.success = false
      connectionStatus.message = 'Error de conexión'
      connectionStatus.error = error instanceof Error ? error.message : String(error)
      connectionStatus.timestamp = new Date().toLocaleString()
      console.error('❌', connectionStatus)
      throw error
    }
  }

  return {
    credentials,
    formParams,
    token,
    tokenExpiry,
    userData,
    connectionStatus,
    saveCredentials,
    saveUserData,
    clearCredentials,
    testConnection,
    login,
    isTokenExpiring
  }
})
