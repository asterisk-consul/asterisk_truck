import { defineStore } from 'pinia'
import { authService } from './auth.service'
import type { AuthUser } from './auth.types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const initialized = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLogged = computed(() => !!user.value)

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const res = await authService.login(email, password)
      user.value = res.user
    } catch (e: any) {
      error.value =
        e?.data?.message || e?.statusMessage || 'Error al iniciar sesión'

      throw new Error(error.value ?? 'Error al iniciar sesión')
    } finally {
      loading.value = false
    }
  }
  async function register(data: {
    name: string
    email: string
    password: string
  }) {
    loading.value = true
    error.value = null

    try {
      console.log(data)
      const res = await authService.register(data)
      user.value = res.user
    } catch (e: any) {
      error.value =
        e?.data?.message || e?.statusMessage || 'Error al registrarse'

      throw new Error(error.value ?? 'Error al registrarse')
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    const me = await authService.me()
    user.value = me
  }

  async function init() {
    if (initialized.value) return

    try {
      await fetchMe()
    } catch {
      try {
        // 🔥 intentar refresh
        await $fetch('/api/auth/refresh', { method: 'POST' })

        // 🔥 reintentar
        await fetchMe()
      } catch {
        user.value = null
      }
    }

    initialized.value = true
  }
  async function changePassword(data: {
    currentPassword: string
    newPassword: string
  }) {
    loading.value = true
    error.value = null

    try {
      await authService.changePassword(data)
    } catch (e: any) {
      error.value =
        e?.data?.message || e?.statusMessage || 'Error al cambiar contraseña'

      throw new Error(error.value ?? 'Error al cambiar contraseña')
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authService.logout()
    user.value = null
  }

  return {
    user,
    loading,
    register,
    changePassword,
    initialized,
    isLogged,
    error,
    login,
    fetchMe,
    init,
    logout
  }
})
